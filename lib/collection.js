"use strict";
/**
 * Dudwalls Collection Class
 * Handles collection-level operations and document management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
class Collection {
    constructor(http, databaseName, collectionName, debug = false) {
        this.http = http;
        this.databaseName = databaseName;
        this.collectionName = collectionName;
        this.debug = debug;
        if (this.debug) {
            console.log(`[Dudwalls] Collection instance created: ${databaseName}.${collectionName}`);
        }
    }
    /**
     * Get collection name
     */
    getName() {
        return this.collectionName;
    }
    /**
     * Get database name
     */
    getDatabaseName() {
        return this.databaseName;
    }
    /**
     * Get full collection path
     */
    getFullName() {
        return `${this.databaseName}.${this.collectionName}`;
    }
    /**
     * Insert a single document
     */
    async insertOne(document) {
        try {
            const response = await this.http.post(`/${this.databaseName}/${this.collectionName}`, document);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Insert multiple documents
     */
    async insertMany(documents) {
        const results = [];
        const errors = [];
        for (const document of documents) {
            try {
                const result = await this.insertOne(document);
                results.push(result);
            }
            catch (error) {
                errors.push(error instanceof Error ? error.message : 'Unknown error');
            }
        }
        if (errors.length > 0 && this.debug) {
            console.warn(`[Dudwalls] Some documents failed to insert:`, errors);
        }
        return results;
    }
    /**
     * Find all documents (with optional query)
     */
    async find(query) {
        try {
            const response = await this.http.get(`/${this.databaseName}/${this.collectionName}`);
            let documents = response.data;
            // Apply client-side filtering if query is provided
            if (query) {
                documents = this.applyQuery(documents, query);
            }
            return documents;
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Find a single document by ID
     */
    async findOne(id) {
        try {
            const response = await this.http.get(`/${this.databaseName}/${this.collectionName}/${id}`);
            return response.data;
        }
        catch (error) {
            if (error.status === 404) {
                return null;
            }
            throw error;
        }
    }
    /**
     * Find first document matching query
     */
    async findFirst(query) {
        const documents = await this.find(query);
        return documents.length > 0 ? documents[0] : null;
    }
    /**
     * Update a single document by ID
     */
    async updateOne(id, update) {
        try {
            const response = await this.http.put(`/${this.databaseName}/${this.collectionName}/${id}`, update);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update multiple documents matching query
     */
    async updateMany(query, update) {
        const documents = await this.find(query);
        const updated = [];
        for (const doc of documents) {
            try {
                if (doc.id && typeof doc.id === 'string') {
                    const result = await this.updateOne(doc.id, update);
                    updated.push(result);
                }
            }
            catch (error) {
                if (this.debug) {
                    console.warn(`[Dudwalls] Failed to update document ${doc.id}:`, error);
                }
            }
        }
        return {
            modifiedCount: updated.length,
            documents: updated
        };
    }
    /**
     * Delete a single document by ID
     */
    async deleteOne(id) {
        try {
            const response = await this.http.delete(`/${this.databaseName}/${this.collectionName}/${id}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Delete multiple documents matching query
     */
    async deleteMany(query) {
        const documents = await this.find(query);
        let deletedCount = 0;
        for (const doc of documents) {
            try {
                if (doc.id && typeof doc.id === 'string') {
                    await this.deleteOne(doc.id);
                    deletedCount++;
                }
            }
            catch (error) {
                if (this.debug) {
                    console.warn(`[Dudwalls] Failed to delete document ${doc.id}:`, error);
                }
            }
        }
        return { deletedCount };
    }
    /**
     * Count documents in collection
     */
    async count(query) {
        const documents = await this.find(query);
        return documents.length;
    }
    /**
     * Check if document exists
     */
    async exists(id) {
        const document = await this.findOne(id);
        return document !== null;
    }
    /**
     * Replace a document entirely
     */
    async replaceOne(id, document) {
        // Ensure the ID is preserved
        const docWithId = { ...document, id };
        return this.updateOne(id, docWithId);
    }
    /**
     * Upsert - update if exists, insert if not
     */
    async upsert(document) {
        if (document.id && typeof document.id === 'string') {
            const existing = await this.findOne(document.id);
            if (existing) {
                return this.updateOne(document.id, document);
            }
        }
        return this.insertOne(document);
    }
    /**
     * Bulk operations
     */
    async bulkWrite(operations) {
        const results = [];
        let successCount = 0;
        let failedCount = 0;
        for (const operation of operations) {
            try {
                let result;
                switch (operation.operation) {
                    case 'create':
                        if (!operation.data) {
                            throw new Error('Data is required for create operation');
                        }
                        result = await this.insertOne(operation.data);
                        break;
                    case 'update':
                        if (!operation.id || !operation.data) {
                            throw new Error('ID and data are required for update operation');
                        }
                        result = await this.updateOne(operation.id, operation.data);
                        break;
                    case 'delete':
                        if (!operation.id) {
                            throw new Error('ID is required for delete operation');
                        }
                        result = await this.deleteOne(operation.id);
                        break;
                    default:
                        throw new Error(`Unknown operation: ${operation.operation}`);
                }
                results.push({
                    operation,
                    success: true,
                    data: result
                });
                successCount++;
            }
            catch (error) {
                results.push({
                    operation,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
                failedCount++;
            }
        }
        return {
            success: successCount,
            failed: failedCount,
            results
        };
    }
    /**
     * Get distinct values for a field
     */
    async distinct(field, query) {
        const documents = await this.find(query);
        const values = new Set();
        for (const doc of documents) {
            const value = this.getNestedValue(doc, field);
            if (value !== undefined) {
                values.add(value);
            }
        }
        return Array.from(values);
    }
    /**
     * Aggregate data (basic aggregation operations)
     */
    async aggregate(pipeline) {
        let documents = await this.find();
        for (const stage of pipeline) {
            if (stage.$match) {
                documents = documents.filter(doc => this.matchesFilter(doc, stage.$match));
            }
            if (stage.$sort) {
                documents = this.sortDocuments(documents, stage.$sort);
            }
            if (stage.$skip) {
                documents = documents.slice(stage.$skip);
            }
            if (stage.$limit) {
                documents = documents.slice(0, stage.$limit);
            }
            // Basic $group implementation
            if (stage.$group) {
                documents = this.groupDocuments(documents, stage.$group);
            }
        }
        return documents;
    }
    /**
     * Drop/delete this collection
     */
    async drop() {
        try {
            const response = await this.http.delete(`/${this.databaseName}/${this.collectionName}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }
    // Private helper methods
    applyQuery(documents, query) {
        let result = documents;
        // Apply where filter
        if (query.where) {
            result = result.filter(doc => this.matchesFilter(doc, query.where));
        }
        // Apply sorting
        if (query.orderBy) {
            result = this.sortDocuments(result, query.orderBy);
        }
        // Apply skip
        if (query.skip) {
            result = result.slice(query.skip);
        }
        // Apply limit
        if (query.limit) {
            result = result.slice(0, query.limit);
        }
        // Apply field selection
        if (query.select) {
            result = result.map(doc => this.selectFields(doc, query.select));
        }
        return result;
    }
    matchesFilter(document, filter) {
        for (const [key, value] of Object.entries(filter)) {
            const docValue = this.getNestedValue(document, key);
            if (typeof value === 'object' && value !== null) {
                // Handle operators like $gt, $lt, etc.
                for (const [operator, operatorValue] of Object.entries(value)) {
                    switch (operator) {
                        case '$eq':
                            if (docValue !== operatorValue)
                                return false;
                            break;
                        case '$ne':
                            if (docValue === operatorValue)
                                return false;
                            break;
                        case '$gt':
                            if (typeof operatorValue === 'number' && docValue <= operatorValue)
                                return false;
                            break;
                        case '$gte':
                            if (typeof operatorValue === 'number' && docValue < operatorValue)
                                return false;
                            break;
                        case '$lt':
                            if (typeof operatorValue === 'number' && docValue >= operatorValue)
                                return false;
                            break;
                        case '$lte':
                            if (typeof operatorValue === 'number' && docValue > operatorValue)
                                return false;
                            break;
                        case '$in':
                            if (!Array.isArray(operatorValue) || !operatorValue.includes(docValue))
                                return false;
                            break;
                        case '$nin':
                            if (Array.isArray(operatorValue) && operatorValue.includes(docValue))
                                return false;
                            break;
                        case '$regex':
                            if (typeof operatorValue === 'string') {
                                const regex = new RegExp(operatorValue);
                                if (!regex.test(String(docValue)))
                                    return false;
                            }
                            break;
                    }
                }
            }
            else {
                // Simple equality check
                if (docValue !== value)
                    return false;
            }
        }
        return true;
    }
    sortDocuments(documents, orderBy) {
        return documents.sort((a, b) => {
            for (const [field, direction] of Object.entries(orderBy)) {
                const aValue = this.getNestedValue(a, field);
                const bValue = this.getNestedValue(b, field);
                let comparison = 0;
                if (aValue < bValue)
                    comparison = -1;
                else if (aValue > bValue)
                    comparison = 1;
                if (direction === 'desc')
                    comparison *= -1;
                if (comparison !== 0)
                    return comparison;
            }
            return 0;
        });
    }
    selectFields(document, select) {
        if (Array.isArray(select)) {
            // Include only specified fields
            const result = {};
            for (const field of select) {
                const value = this.getNestedValue(document, field);
                if (value !== undefined) {
                    this.setNestedValue(result, field, value);
                }
            }
            return result;
        }
        else {
            // Include/exclude based on boolean values
            const result = { ...document };
            for (const [field, include] of Object.entries(select)) {
                if (!include) {
                    this.deleteNestedValue(result, field);
                }
            }
            return result;
        }
    }
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!(key in current))
                current[key] = {};
            return current[key];
        }, obj);
        target[lastKey] = value;
    }
    deleteNestedValue(obj, path) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => current?.[key], obj);
        if (target)
            delete target[lastKey];
    }
    groupDocuments(documents, groupSpec) {
        const groups = {};
        // Simple grouping by _id field
        const groupBy = groupSpec._id;
        for (const doc of documents) {
            const groupKey = typeof groupBy === 'string'
                ? this.getNestedValue(doc, groupBy.replace('$', ''))
                : JSON.stringify(groupBy);
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(doc);
        }
        // Apply aggregation operations
        const result = [];
        for (const [key, groupDocs] of Object.entries(groups)) {
            const groupResult = { _id: key };
            for (const [field, operation] of Object.entries(groupSpec)) {
                if (field === '_id')
                    continue;
                if (typeof operation === 'object' && operation !== null) {
                    for (const [op, fieldPath] of Object.entries(operation)) {
                        switch (op) {
                            case '$sum':
                                if (fieldPath === 1) {
                                    groupResult[field] = groupDocs.length;
                                }
                                else {
                                    const fieldName = String(fieldPath).replace('$', '');
                                    groupResult[field] = groupDocs.reduce((sum, doc) => {
                                        const value = this.getNestedValue(doc, fieldName);
                                        return sum + (typeof value === 'number' ? value : 0);
                                    }, 0);
                                }
                                break;
                            case '$avg':
                                const fieldName = String(fieldPath).replace('$', '');
                                const values = groupDocs.map(doc => this.getNestedValue(doc, fieldName))
                                    .filter(v => typeof v === 'number');
                                groupResult[field] = values.length > 0
                                    ? values.reduce((sum, v) => sum + v, 0) / values.length
                                    : 0;
                                break;
                            case '$min':
                            case '$max':
                                const fieldName2 = String(fieldPath).replace('$', '');
                                const values2 = groupDocs.map(doc => this.getNestedValue(doc, fieldName2))
                                    .filter(v => v !== undefined);
                                if (values2.length > 0) {
                                    groupResult[field] = op === '$min'
                                        ? Math.min(...values2)
                                        : Math.max(...values2);
                                }
                                break;
                        }
                    }
                }
            }
            result.push(groupResult);
        }
        return result;
    }
}
exports.Collection = Collection;
//# sourceMappingURL=collection.js.map