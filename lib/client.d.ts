/**
 * Dudwalls Client - Main SDK Class
 * Official TypeScript/JavaScript SDK for Dudwalls NoSQL Database
 */
import { Database } from './database';
import { DudwallsConfig, DatabaseInfo, DudwallsResponse } from './types';
export declare class DudwallsClient {
    private http;
    private config;
    constructor(config: DudwallsConfig);
    private setupInterceptors;
    private formatError;
    /**
     * Test connection to Dudwalls server
     */
    ping(): Promise<DudwallsResponse<{
        status: string;
        timestamp: string;
    }>>;
    /**
     * Get all databases for the authenticated user
     */
    getDatabases(): Promise<string[]>;
    /**
     * Create a new database
     */
    createDatabase(name: string): Promise<DatabaseInfo>;
    /**
     * Delete a database and all its collections
     */
    deleteDatabase(name: string): Promise<{
        success: boolean;
    }>;
    /**
     * Rename a database
     */
    renameDatabase(oldName: string, newName: string): Promise<DatabaseInfo>;
    /**
     * Get a database instance for operations
     */
    database(name: string): Database;
    /**
     * Alias for database() method
     */
    db(name: string): Database;
    /**
     * Get client configuration
     */
    getConfig(): Readonly<Required<DudwallsConfig>>;
    /**
     * Update API key
     */
    setApiKey(apiKey: string): void;
    /**
     * Update endpoint
     */
    setEndpoint(endpoint: string): void;
    /**
     * Enable or disable debug logging
     */
    setDebug(debug: boolean): void;
    /**
     * Get server information and statistics
     */
    getServerInfo(): Promise<any>;
    /**
     * Generate SDK code for different programming languages
     */
    generateSDK(language: string, options?: any): Promise<any>;
}
//# sourceMappingURL=client.d.ts.map