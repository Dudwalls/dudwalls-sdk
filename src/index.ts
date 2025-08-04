/**
 * Dudwalls SDK - Official TypeScript/JavaScript Client
 * 
 * A modern, feature-rich SDK for the Dudwalls NoSQL Database.
 * Provides a MongoDB-like API with additional features for modern applications.
 * 
 * @version 1.0.0
 * @author Dudwalls Team
 * @license MIT
 */

// Main exports
export { DudwallsClient } from './client';
export { Database } from './database';
export { Collection } from './collection';

// Type exports
export * from './types';

// Utility exports
export { createClient, connect } from './utils';

// Version
export const VERSION = '1.0.0';

/**
 * Default export - DudwallsClient class
 * 
 * @example
 * ```typescript
 * import Dudwalls from 'dudwalls';
 * 
 * const client = new Dudwalls({
 *   endpoint: 'https://your-dudwalls-instance.com',
 *   apiKey: 'your-api-key'
 * });
 * ```
 */
export { DudwallsClient as default } from './client';
