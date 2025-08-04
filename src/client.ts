/**
 * Dudwalls Client - Main SDK Class
 * Official TypeScript/JavaScript SDK for Dudwalls NoSQL Database
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Database } from './database';
import { 
  DudwallsConfig, 
  DudwallsError, 
  DatabaseInfo,
  DudwallsResponse 
} from './types';

export class DudwallsClient {
  private http: AxiosInstance;
  private config: Required<DudwallsConfig>;

  constructor(config: DudwallsConfig) {
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
    this.http = axios.create({
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

  private setupInterceptors(): void {
    // Request interceptor
    this.http.interceptors.request.use(
      (config) => {
        if (this.config.debug) {
          console.log('[Dudwalls] Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data
          });
        }
        return config;
      },
      (error) => {
        if (this.config.debug) {
          console.error('[Dudwalls] Request Error:', error);
        }
        return Promise.reject(this.formatError(error));
      }
    );

    // Response interceptor
    this.http.interceptors.response.use(
      (response: AxiosResponse) => {
        if (this.config.debug) {
          console.log('[Dudwalls] Response:', {
            status: response.status,
            data: response.data
          });
        }
        return response;
      },
      (error) => {
        if (this.config.debug) {
          console.error('[Dudwalls] Response Error:', error);
        }
        return Promise.reject(this.formatError(error));
      }
    );
  }

  private formatError(error: any): DudwallsError {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.error || error.message,
        code: error.response.data?.code || 'HTTP_ERROR',
        status: error.response.status,
        details: error.response.data
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - unable to reach Dudwalls server',
        code: 'NETWORK_ERROR',
        status: 0,
        details: error.request
      };
    } else {
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
  async ping(): Promise<DudwallsResponse<{ status: string; timestamp: string }>> {
    try {
      const response = await axios.get(`${this.config.endpoint}/api/health`);
      return {
        data: response.data,
        status: response.status,
        headers: response.headers as Record<string, string>,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Get all databases for the authenticated user
   */
  async getDatabases(): Promise<string[]> {
    try {
      const response = await this.http.get('/');
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Create a new database
   */
  async createDatabase(name: string): Promise<DatabaseInfo> {
    try {
      const response = await this.http.post('/', { name });
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Delete a database and all its collections
   */
  async deleteDatabase(name: string): Promise<{ success: boolean }> {
    try {
      const response = await this.http.delete(`/${name}`);
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Rename a database
   */
  async renameDatabase(oldName: string, newName: string): Promise<DatabaseInfo> {
    try {
      const response = await this.http.put(`/${oldName}`, { newName });
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Get a database instance for operations
   */
  database(name: string): Database {
    return new Database(this.http, name, this.config.debug);
  }

  /**
   * Alias for database() method
   */
  db(name: string): Database {
    return this.database(name);
  }

  /**
   * Get client configuration
   */
  getConfig(): Readonly<Required<DudwallsConfig>> {
    return { ...this.config };
  }

  /**
   * Update API key
   */
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    this.http.defaults.headers['Authorization'] = `Bearer ${apiKey}`;
    
    if (this.config.debug) {
      console.log('[Dudwalls] API key updated');
    }
  }

  /**
   * Update endpoint
   */
  setEndpoint(endpoint: string): void {
    this.config.endpoint = endpoint.replace(/\/$/, '');
    this.http.defaults.baseURL = `${this.config.endpoint}/api/dudwalls`;
    
    if (this.config.debug) {
      console.log('[Dudwalls] Endpoint updated:', this.config.endpoint);
    }
  }

  /**
   * Enable or disable debug logging
   */
  setDebug(debug: boolean): void {
    this.config.debug = debug;
    
    if (debug) {
      console.log('[Dudwalls] Debug logging enabled');
    }
  }

  /**
   * Get server information and statistics
   */
  async getServerInfo(): Promise<any> {
    try {
      const response = await axios.get(`${this.config.endpoint}/api/health`);
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Generate SDK code for different programming languages
   */
  async generateSDK(language: string, options?: any): Promise<any> {
    try {
      const response = await axios.post(`${this.config.endpoint}/api/admin/sdk-generate`, {
        language,
        options,
        apiKey: this.config.apiKey,
        endpoint: this.config.endpoint
      });
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }
}
