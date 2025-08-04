/**
 * Dudwalls Collection Class
 * Handles collection-level operations and document management
 */
import { AxiosInstance } from 'axios';
import { DudwallsDocument, DudwallsQuery, BulkOperation, BulkResult } from './types';
export declare class Collection {
    private http;
    private databaseName;
    private collectionName;
    private debug;
    constructor(http: AxiosInstance, databaseName: string, collectionName: string, debug?: boolean);
    /**
     * Get collection name
     */
    getName(): string;
    /**
     * Get database name
     */
    getDatabaseName(): string;
    /**
     * Get full collection path
     */
    getFullName(): string;
    /**
     * Insert a single document
     */
    insertOne(document: DudwallsDocument): Promise<DudwallsDocument>;
    /**
     * Insert multiple documents
     */
    insertMany(documents: DudwallsDocument[]): Promise<DudwallsDocument[]>;
    /**
     * Find all documents (with optional query)
     */
    find(query?: DudwallsQuery): Promise<DudwallsDocument[]>;
    /**
     * Find a single document by ID
     */
    findOne(id: string): Promise<DudwallsDocument | null>;
    /**
     * Find first document matching query
     */
    findFirst(query?: DudwallsQuery): Promise<DudwallsDocument | null>;
    /**
     * Update a single document by ID
     */
    updateOne(id: string, update: Partial<DudwallsDocument>): Promise<DudwallsDocument>;
    /**
     * Update multiple documents matching query
     */
    updateMany(query: DudwallsQuery, update: Partial<DudwallsDocument>): Promise<{
        modifiedCount: number;
        documents: DudwallsDocument[];
    }>;
    /**
     * Delete a single document by ID
     */
    deleteOne(id: string): Promise<{
        success: boolean;
    }>;
    /**
     * Delete multiple documents matching query
     */
    deleteMany(query?: DudwallsQuery): Promise<{
        deletedCount: number;
    }>;
    /**
     * Count documents in collection
     */
    count(query?: DudwallsQuery): Promise<number>;
    /**
     * Check if document exists
     */
    exists(id: string): Promise<boolean>;
    /**
     * Replace a document entirely
     */
    replaceOne(id: string, document: DudwallsDocument): Promise<DudwallsDocument>;
    /**
     * Upsert - update if exists, insert if not
     */
    upsert(document: DudwallsDocument): Promise<DudwallsDocument>;
    /**
     * Bulk operations
     */
    bulkWrite(operations: BulkOperation[]): Promise<BulkResult>;
    /**
     * Get distinct values for a field
     */
    distinct(field: string, query?: DudwallsQuery): Promise<any[]>;
    /**
     * Aggregate data (basic aggregation operations)
     */
    aggregate(pipeline: Array<{
        $match?: Record<string, any>;
        $group?: Record<string, any>;
        $sort?: Record<string, 'asc' | 'desc'>;
        $limit?: number;
        $skip?: number;
    }>): Promise<any[]>;
    /**
     * Drop/delete this collection
     */
    drop(): Promise<{
        success: boolean;
    }>;
    private applyQuery;
    private matchesFilter;
    private sortDocuments;
    private selectFields;
    private getNestedValue;
    private setNestedValue;
    private deleteNestedValue;
    private groupDocuments;
}
//# sourceMappingURL=collection.d.ts.map