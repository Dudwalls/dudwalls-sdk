/**
 * Dudwalls Database Class
 * Handles database-level operations and provides access to collections
 */
import { AxiosInstance } from 'axios';
import { Collection } from './collection';
import { CollectionInfo } from './types';
export declare class Database {
    private http;
    private name;
    private debug;
    constructor(http: AxiosInstance, name: string, debug?: boolean);
    /**
     * Get database name
     */
    getName(): string;
    /**
     * Get all collections in this database
     */
    getCollections(): Promise<string[]>;
    /**
     * Create a new collection in this database
     */
    createCollection(name: string): Promise<CollectionInfo>;
    /**
     * Delete a collection and all its documents
     */
    deleteCollection(name: string): Promise<{
        success: boolean;
    }>;
    /**
     * Rename a collection
     */
    renameCollection(oldName: string, newName: string): Promise<CollectionInfo>;
    /**
     * Get a collection instance for operations
     */
    collection(name: string): Collection;
    /**
     * Check if a collection exists
     */
    hasCollection(name: string): Promise<boolean>;
    /**
     * Get collection count
     */
    getCollectionCount(): Promise<number>;
    /**
     * Drop/delete this entire database
     */
    drop(): Promise<{
        success: boolean;
    }>;
    /**
     * Get database statistics
     */
    getStats(): Promise<{
        name: string;
        collections: number;
        totalDocuments: number;
        estimatedSize: number;
    }>;
    /**
     * Bulk operations across multiple collections
     */
    bulkOperations(operations: Array<{
        collection: string;
        operation: 'create' | 'update' | 'delete';
        data?: any;
        id?: string;
    }>): Promise<Array<{
        success: boolean;
        error?: string;
        result?: any;
    }>>;
    /**
     * Export all data from this database
     */
    exportData(): Promise<Record<string, any[]>>;
    /**
     * Import data into this database
     */
    importData(data: Record<string, any[]>, options?: {
        overwrite?: boolean;
        createCollections?: boolean;
    }): Promise<{
        success: boolean;
        imported: number;
        errors: string[];
    }>;
}
//# sourceMappingURL=database.d.ts.map