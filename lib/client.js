"use strict";
/**
 * Dudwalls Client - Main SDK Class
 * Official TypeScript/JavaScript SDK for Dudwalls NoSQL Database
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DudwallsClient = void 0;
const axios_1 = __importDefault(require("axios"));
const database_1 = require("./database");
class DudwallsClient {
    constructor(config) {
        // Validate configuration
        if (!config.endpoint) {
            throw new Error('Dudwalls endpoint is required');
        }
        if (!config.apiKey) {
            throw new Error('Dudwalls API key is required');
        }
        // Set default configuration
        this.config = {
            endpoint: config.endpoint.replace(/\/$/, ''), // Remove trailing slash
            apiKey: config.apiKey,
            timeout: config.timeout || 10000,
            debug: config.debug || false,
            headers: config.headers || {}
        };
        // Create HTTP client
        this.http = axios_1.default.create({
            baseURL: `${this.config.endpoint}/api/dudwalls`,
            timeout: this.config.timeout,
            headers: {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Dudwalls-SDK/1.0.0',
                ...this.config.headers
            }
        });
        // Add request/response interceptors for debugging and error handling
        this.setupInterceptors();
        if (this.config.debug) {
            console.log('[Dudwalls] Client initialized:', {
                endpoint: this.config.endpoint,
                timeout: this.config.timeout
            });
        }
    }
    setupInterceptors() {
        // Request interceptor
        this.http.interceptors.request.use((config) => {
            if (this.config.debug) {
                console.log('[Dudwalls] Request:', {
                    method: config.method?.toUpperCase(),
                    url: config.url,
                    data: config.data
                });
            }
            return config;
        }, (error) => {
            if (this.config.debug) {
                console.error('[Dudwalls] Request Error:', error);
            }
            return Promise.reject(this.formatError(error));
        });
        // Response interceptor
        this.http.interceptors.response.use((response) => {
            if (this.config.debug) {
                console.log('[Dudwalls] Response:', {
                    status: response.status,
                    data: response.data
                });
            }
            return response;
        }, (error) => {
            if (this.config.debug) {
                console.error('[Dudwalls] Response Error:', error);
            }
            return Promise.reject(this.formatError(error));
        });
    }
    formatError(error) {
        if (error.response) {
            // Server responded with error status
            return {
                message: error.response.data?.error || error.message,
                code: error.response.data?.code || 'HTTP_ERROR',
                status: error.response.status,
                details: error.response.data
            };
        }
        else if (error.request) {
            // Request was made but no response received
            return {
                message: 'Network error - unable to reach Dudwalls server',
                code: 'NETWORK_ERROR',
                status: 0,
                details: error.request
            };
        }
        else {
            // Something else happened
            return {
                message: error.message || 'Unknown error occurred',
                code: 'UNKNOWN_ERROR',
                status: 0,
                details: error
            };
        }
    }
    /**
     * Test connection to Dudwalls server
     */
    async ping() {
        try {
            const response = await axios_1.default.get(`${this.config.endpoint}/api/health`);
            return {
                data: response.data,
                status: response.status,
                headers: response.headers,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            throw this.formatError(error);
        }
    }
    /**
     * Get all databases for the authenticated user
     */
    async getDatabases() {
        try {
            const response = await this.http.get('/');
            return response.data;
        }
        catch (error) {
            throw this.formatError(error);
        }
    }
    /**
     * Create a new database
     */
    async createDatabase(name) {
        try {
            const response = await this.http.post('/', { name });
            return response.data;
        }
        catch (error) {
            throw this.formatError(error);
        }
    }
    /**
     * Delete a database and all its collections
     */
    async deleteDatabase(name) {
        try {
            const response = await this.http.delete(`/${name}`);
            return response.data;
        }
        catch (error) {
            throw this.formatError(error);
        }
    }
    /**
     * Rename a database
     */
    async renameDatabase(oldName, newName) {
        try {
            const response = await this.http.put(`/${oldName}`, { newName });
            return response.data;
        }
        catch (error) {
            throw this.formatError(error);
        }
    }
    /**
     * Get a database instance for operations
     */
    database(name) {
        return new database_1.Database(this.http, name, this.config.debug);
    }
    /**
     * Alias for database() method
     */
    db(name) {
        return this.database(name);
    }
    /**
     * Get client configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update API key
     */
    setApiKey(apiKey) {
        this.config.apiKey = apiKey;
        this.http.defaults.headers['Authorization'] = `Bearer ${apiKey}`;
        if (this.config.debug) {
            console.log('[Dudwalls] API key updated');
        }
    }
    /**
     * Update endpoint
     */
    setEndpoint(endpoint) {
        this.config.endpoint = endpoint.replace(/\/$/, '');
        this.http.defaults.baseURL = `${this.config.endpoint}/api/dudwalls`;
        if (this.config.debug) {
            console.log('[Dudwalls] Endpoint updated:', this.config.endpoint);
        }
    }
    /**
     * Enable or disable debug logging
     */
    setDebug(debug) {
        this.config.debug = debug;
        if (debug) {
            console.log('[Dudwalls] Debug logging enabled');
        }
    }
    /**
     * Get server information and statistics
     */
    async getServerInfo() {
        try {
            const response = await axios_1.default.get(`${this.config.endpoint}/api/health`);
            return response.data;
        }
        catch (error) {
            throw this.formatError(error);
        }
    }
    /**
     * Generate SDK code for different programming languages
     */
    async generateSDK(language, options) {
        try {
            const response = await axios_1.default.post(`${this.config.endpoint}/api/admin/sdk-generate`, {
                language,
                options,
                apiKey: this.config.apiKey,
                endpoint: this.config.endpoint
            });
            return response.data;
        }
        catch (error) {
            throw this.formatError(error);
        }
    }
}
exports.DudwallsClient = DudwallsClient;
//# sourceMappingURL=client.js.map