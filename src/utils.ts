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
export function createClient(config: DudwallsConfig): DudwallsClient {
  return new DudwallsClient(config);
}

/**
 * Connect to Dudwalls and return a client instance
 * Alias for createClient with connection testing
 */
export async function connect(config: DudwallsConfig): Promise<DudwallsClient> {
  const client = new DudwallsClient(config);
  
  // Test connection
  try {
    await client.ping();
    return client;
  } catch (error) {
    throw new Error(`Failed to connect to Dudwalls: ${error}`);
  }
}

/**
 * Validate API key format
 */
export function isValidApiKey(apiKey: string): boolean {
  // Dudwalls API keys follow the pattern: dudw_live_sk_* or dw_admin_*
  return /^(dudw_live_sk_|dw_admin_)[a-zA-Z0-9_]+$/.test(apiKey);
}

/**
 * Validate endpoint URL
 */
export function isValidEndpoint(endpoint: string): boolean {
  try {
    const url = new URL(endpoint);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Generate a random document ID
 */
export function generateId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sanitize collection/database names
 */
export function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

/**
 * Merge objects deeply
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = result[key];
      
      if (
        typeof sourceValue === 'object' &&
        sourceValue !== null &&
        !Array.isArray(sourceValue) &&
        typeof targetValue === 'object' &&
        targetValue !== null &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }
  
  return result;
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: number;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, delay = 1000, backoff = 2 } = options;
  
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(backoff, attempt - 1)));
    }
  }
  
  throw lastError!;
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Check if running in Node.js environment
 */
export function isNode(): boolean {
  return typeof process !== 'undefined' && 
         typeof process.versions !== 'undefined' && 
         typeof process.versions.node !== 'undefined';
}

/**
 * Check if running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Get environment type
 */
export function getEnvironment(): 'node' | 'browser' | 'unknown' {
  if (isNode()) return 'node';
  if (isBrowser()) return 'browser';
  return 'unknown';
}

/**
 * Parse connection string
 * Format: dudwalls://apikey@endpoint/database
 */
export function parseConnectionString(connectionString: string): {
  endpoint: string;
  apiKey: string;
  database?: string;
} {
  try {
    const url = new URL(connectionString);
    
    if (url.protocol !== 'dudwalls:') {
      throw new Error('Invalid protocol. Expected "dudwalls:"');
    }
    
    const apiKey = url.username;
    if (!apiKey) {
      throw new Error('API key not found in connection string');
    }
    
    const endpoint = `https://${url.host}`;
    const database = url.pathname.slice(1) || undefined;
    
    return { endpoint, apiKey, database };
  } catch (error) {
    throw new Error(`Invalid connection string: ${error}`);
  }
}

/**
 * Create connection string
 */
export function createConnectionString(
  endpoint: string,
  apiKey: string,
  database?: string
): string {
  const url = new URL(endpoint);
  const path = database ? `/${database}` : '';
  return `dudwalls://${apiKey}@${url.host}${path}`;
}

/**
 * Validate document structure
 */
export function validateDocument(document: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (typeof document !== 'object' || document === null) {
    errors.push('Document must be an object');
    return { valid: false, errors };
  }
  
  if (Array.isArray(document)) {
    errors.push('Document cannot be an array');
  }
  
  // Check for circular references
  try {
    JSON.stringify(document);
  } catch (error) {
    errors.push('Document contains circular references');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Convert query operators to human readable format
 */
export function explainQuery(query: any): string {
  const explanations: string[] = [];
  
  if (query.where) {
    explanations.push(`Filter: ${JSON.stringify(query.where)}`);
  }
  
  if (query.orderBy) {
    const sorts = Object.entries(query.orderBy)
      .map(([field, direction]) => `${field} ${direction}`)
      .join(', ');
    explanations.push(`Sort: ${sorts}`);
  }
  
  if (query.limit) {
    explanations.push(`Limit: ${query.limit}`);
  }
  
  if (query.skip) {
    explanations.push(`Skip: ${query.skip}`);
  }
  
  if (query.select) {
    const fields = Array.isArray(query.select) 
      ? query.select.join(', ')
      : Object.entries(query.select)
          .filter(([, include]) => include)
          .map(([field]) => field)
          .join(', ');
    explanations.push(`Select: ${fields}`);
  }
  
  return explanations.join(' | ') || 'No filters applied';
}
