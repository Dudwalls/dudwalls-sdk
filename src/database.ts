/**
 * Dudwalls Database Class
 * Handles database-level operations and provides access to collections
 */

import { AxiosInstance } from 'axios';
import { Collection } from './collection';
import { CollectionInfo } from './types';

export class Database {
  private http: AxiosInstance;
  private name: string;
  private debug: boolean;

  constructor(http: AxiosInstance, name: string, debug: boolean = false) {
    this.http = http;
    this.name = name;
    this.debug = debug;

    if (this.debug) {
      console.log(`[Dudwalls] Database instance created: ${name}`);
    }
  }

  /**
   * Get database name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get all collections in this database
   */
  async getCollections(): Promise<string[]> {
    try {
      const response = await this.http.get(`/${this.name}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new collection in this database
   */
  async createCollection(name: string): Promise<CollectionInfo> {
    try {
      const response = await this.http.post(`/${this.name}`, { name });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a collection and all its documents
   */
  async deleteCollection(name: string): Promise<{ success: boolean }> {
    try {
      const response = await this.http.delete(`/${this.name}/${name}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Rename a collection
   */
  async renameCollection(oldName: string, newName: string): Promise<CollectionInfo> {
    try {
      const response = await this.http.put(`/${this.name}/${oldName}`, { newName });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a collection instance for operations
   */
  collection(name: string): Collection {
    return new Collection(this.http, this.name, name, this.debug);
  }

  /**
   * Check if a collection exists
   */
  async hasCollection(name: string): Promise<boolean> {
    try {
      const collections = await this.getCollections();
      return collections.includes(name);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get collection count
   */
  async getCollectionCount(): Promise<number> {
    try {
      const collections = await this.getCollections();
      return collections.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Drop/delete this entire database
   */
  async drop(): Promise<{ success: boolean }> {
    try {
      const response = await this.http.delete(`/${this.name}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    name: string;
    collections: number;
    totalDocuments: number;
    estimatedSize: number;
  }> {
    try {
      const collections = await this.getCollections();
      let totalDocuments = 0;
      let estimatedSize = 0;

      // Get document count for each collection
      for (const collectionName of collections) {
        try {
          const collection = this.collection(collectionName);
          const documents = await collection.find();
          totalDocuments += documents.length;
          
          // Estimate size (rough calculation)
          const collectionSize = JSON.stringify(documents).length;
          estimatedSize += collectionSize;
        } catch (error) {
          // Skip collections that can't be read
          if (this.debug) {
            console.warn(`[Dudwalls] Could not read collection ${collectionName}:`, error);
          }
        }
      }

      return {
        name: this.name,
        collections: collections.length,
        totalDocuments,
        estimatedSize
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Bulk operations across multiple collections
   */
  async bulkOperations(operations: Array<{
    collection: string;
    operation: 'create' | 'update' | 'delete';
    data?: any;
    id?: string;
  }>): Promise<Array<{ success: boolean; error?: string; result?: any }>> {
    const results = [];

    for (const op of operations) {
      try {
        const collection = this.collection(op.collection);
        let result;

        switch (op.operation) {
          case 'create':
            result = await collection.insertOne(op.data);
            break;
          case 'update':
            if (!op.id) throw new Error('ID required for update operation');
            result = await collection.updateOne(op.id, op.data);
            break;
          case 'delete':
            if (!op.id) throw new Error('ID required for delete operation');
            result = await collection.deleteOne(op.id);
            break;
          default:
            throw new Error(`Unknown operation: ${op.operation}`);
        }

        results.push({ success: true, result });
      } catch (error) {
        results.push({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return results;
  }

  /**
   * Export all data from this database
   */
  async exportData(): Promise<Record<string, any[]>> {
    try {
      const collections = await this.getCollections();
      const exportData: Record<string, any[]> = {};

      for (const collectionName of collections) {
        try {
          const collection = this.collection(collectionName);
          const documents = await collection.find();
          exportData[collectionName] = documents;
        } catch (error) {
          if (this.debug) {
            console.warn(`[Dudwalls] Could not export collection ${collectionName}:`, error);
          }
          exportData[collectionName] = [];
        }
      }

      return exportData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Import data into this database
   */
  async importData(data: Record<string, any[]>, options?: {
    overwrite?: boolean;
    createCollections?: boolean;
  }): Promise<{
    success: boolean;
    imported: number;
    errors: string[];
  }> {
    const opts = {
      overwrite: false,
      createCollections: true,
      ...options
    };

    let imported = 0;
    const errors: string[] = [];

    for (const [collectionName, documents] of Object.entries(data)) {
      try {
        // Create collection if it doesn't exist
        if (opts.createCollections) {
          const hasCollection = await this.hasCollection(collectionName);
          if (!hasCollection) {
            await this.createCollection(collectionName);
          }
        }

        const collection = this.collection(collectionName);

        // Clear collection if overwrite is enabled
        if (opts.overwrite) {
          const existingDocs = await collection.find();
          for (const doc of existingDocs) {
            if (doc.id && typeof doc.id === 'string') {
              await collection.deleteOne(doc.id);
            }
          }
        }

        // Insert documents
        for (const document of documents) {
          try {
            await collection.insertOne(document);
            imported++;
          } catch (error) {
            errors.push(`Failed to import document in ${collectionName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      } catch (error) {
        errors.push(`Failed to import collection ${collectionName}: ${error}`);
      }
    }

    return {
      success: errors.length === 0,
      imported,
      errors
    };
  }
}
