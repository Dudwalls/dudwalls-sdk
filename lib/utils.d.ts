/**
 * Dudwalls SDK Utilities
 * Helper functions and convenience methods
 */
import { DudwallsClient } from './client';
import { DudwallsConfig } from './types';
/**
 * Create a new Dudwalls client instance
 * Convenience function for creating a client
 */
export declare function createClient(config: DudwallsConfig): DudwallsClient;
/**
 * Connect to Dudwalls and return a client instance
 * Alias for createClient with connection testing
 */
export declare function connect(config: DudwallsConfig): Promise<DudwallsClient>;
/**
 * Validate API key format
 */
export declare function isValidApiKey(apiKey: string): boolean;
/**
 * Validate endpoint URL
 */
export declare function isValidEndpoint(endpoint: string): boolean;
/**
 * Generate a random document ID
 */
export declare function generateId(): string;
/**
 * Sanitize collection/database names
 */
export declare function sanitizeName(name: string): string;
/**
 * Deep clone an object
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Merge objects deeply
 */
export declare function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T;
/**
 * Retry a function with exponential backoff
 */
export declare function retry<T>(fn: () => Promise<T>, options?: {
    maxAttempts?: number;
    delay?: number;
    backoff?: number;
}): Promise<T>;
/**
 * Debounce function calls
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * Throttle function calls
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
/**
 * Format bytes to human readable string
 */
export declare function formatBytes(bytes: number, decimals?: number): string;
/**
 * Check if running in Node.js environment
 */
export declare function isNode(): boolean;
/**
 * Check if running in browser environment
 */
export declare function isBrowser(): boolean;
/**
 * Get environment type
 */
export declare function getEnvironment(): 'node' | 'browser' | 'unknown';
/**
 * Parse connection string
 * Format: dudwalls://apikey@endpoint/database
 */
export declare function parseConnectionString(connectionString: string): {
    endpoint: string;
    apiKey: string;
    database?: string;
};
/**
 * Create connection string
 */
export declare function createConnectionString(endpoint: string, apiKey: string, database?: string): string;
/**
 * Validate document structure
 */
export declare function validateDocument(document: any): {
    valid: boolean;
    errors: string[];
};
/**
 * Convert query operators to human readable format
 */
export declare function explainQuery(query: any): string;
//# sourceMappingURL=utils.d.ts.map