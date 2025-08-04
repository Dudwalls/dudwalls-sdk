"use strict";
/**
 * Dudwalls SDK Utilities
 * Helper functions and convenience methods
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = createClient;
exports.connect = connect;
exports.isValidApiKey = isValidApiKey;
exports.isValidEndpoint = isValidEndpoint;
exports.generateId = generateId;
exports.sanitizeName = sanitizeName;
exports.deepClone = deepClone;
exports.deepMerge = deepMerge;
exports.retry = retry;
exports.debounce = debounce;
exports.throttle = throttle;
exports.formatBytes = formatBytes;
exports.isNode = isNode;
exports.isBrowser = isBrowser;
exports.getEnvironment = getEnvironment;
exports.parseConnectionString = parseConnectionString;
exports.createConnectionString = createConnectionString;
exports.validateDocument = validateDocument;
exports.explainQuery = explainQuery;
const client_1 = require("./client");
/**
 * Create a new Dudwalls client instance
 * Convenience function for creating a client
 */
function createClient(config) {
    return new client_1.DudwallsClient(config);
}
/**
 * Connect to Dudwalls and return a client instance
 * Alias for createClient with connection testing
 */
async function connect(config) {
    const client = new client_1.DudwallsClient(config);
    // Test connection
    try {
        await client.ping();
        return client;
    }
    catch (error) {
        throw new Error(`Failed to connect to Dudwalls: ${error}`);
    }
}
/**
 * Validate API key format
 */
function isValidApiKey(apiKey) {
    // Dudwalls API keys follow the pattern: dudw_live_sk_* or dw_admin_*
    return /^(dudw_live_sk_|dw_admin_)[a-zA-Z0-9_]+$/.test(apiKey);
}
/**
 * Validate endpoint URL
 */
function isValidEndpoint(endpoint) {
    try {
        const url = new URL(endpoint);
        return url.protocol === 'http:' || url.protocol === 'https:';
    }
    catch {
        return false;
    }
}
/**
 * Generate a random document ID
 */
function generateId() {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * Sanitize collection/database names
 */
function sanitizeName(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}
/**
 * Deep clone an object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item));
    }
    const cloned = {};
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
function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            const sourceValue = source[key];
            const targetValue = result[key];
            if (typeof sourceValue === 'object' &&
                sourceValue !== null &&
                !Array.isArray(sourceValue) &&
                typeof targetValue === 'object' &&
                targetValue !== null &&
                !Array.isArray(targetValue)) {
                result[key] = deepMerge(targetValue, sourceValue);
            }
            else {
                result[key] = sourceValue;
            }
        }
    }
    return result;
}
/**
 * Retry a function with exponential backoff
 */
async function retry(fn, options = {}) {
    const { maxAttempts = 3, delay = 1000, backoff = 2 } = options;
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt === maxAttempts) {
                throw lastError;
            }
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(backoff, attempt - 1)));
        }
    }
    throw lastError;
}
/**
 * Debounce function calls
 */
function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(null, args), wait);
    };
}
/**
 * Throttle function calls
 */
function throttle(func, limit) {
    let inThrottle;
    return (...args) => {
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
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
/**
 * Check if running in Node.js environment
 */
function isNode() {
    return typeof process !== 'undefined' &&
        typeof process.versions !== 'undefined' &&
        typeof process.versions.node !== 'undefined';
}
/**
 * Check if running in browser environment
 */
function isBrowser() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}
/**
 * Get environment type
 */
function getEnvironment() {
    if (isNode())
        return 'node';
    if (isBrowser())
        return 'browser';
    return 'unknown';
}
/**
 * Parse connection string
 * Format: dudwalls://apikey@endpoint/database
 */
function parseConnectionString(connectionString) {
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
    }
    catch (error) {
        throw new Error(`Invalid connection string: ${error}`);
    }
}
/**
 * Create connection string
 */
function createConnectionString(endpoint, apiKey, database) {
    const url = new URL(endpoint);
    const path = database ? `/${database}` : '';
    return `dudwalls://${apiKey}@${url.host}${path}`;
}
/**
 * Validate document structure
 */
function validateDocument(document) {
    const errors = [];
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
    }
    catch (error) {
        errors.push('Document contains circular references');
    }
    return { valid: errors.length === 0, errors };
}
/**
 * Convert query operators to human readable format
 */
function explainQuery(query) {
    const explanations = [];
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
//# sourceMappingURL=utils.js.map