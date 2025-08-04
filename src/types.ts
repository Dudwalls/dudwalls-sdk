/**
 * Dudwalls SDK Types
 * Complete type definitions for the Dudwalls NoSQL Database
 */

export interface DudwallsConfig {
  /** Your Dudwalls API endpoint (e.g., 'https://your-dudwalls-instance.com') */
  endpoint: string;
  /** Your API key from Dudwalls dashboard */
  apiKey: string;
  /** Request timeout in milliseconds (default: 10000) */
  timeout?: number;
  /** Enable debug logging (default: false) */
  debug?: boolean;
  /** Custom headers to include with requests */
  headers?: Record<string, string>;
}

export interface DudwallsDocument {
  /** Document ID (auto-generated if not provided) */
  id?: string;
  /** Document data - can be any JSON-serializable object */
  [key: string]: any;
}

export interface DudwallsQuery {
  /** Filter conditions */
  where?: Record<string, any>;
  /** Fields to include/exclude */
  select?: string[] | Record<string, boolean>;
  /** Sort order */
  orderBy?: Record<string, 'asc' | 'desc'>;
  /** Limit number of results */
  limit?: number;
  /** Skip number of results */
  skip?: number;
}

export interface DudwallsResponse<T = any> {
  /** Response data */
  data: T;
  /** Response status code */
  status: number;
  /** Response headers */
  headers: Record<string, string>;
  /** Request timestamp */
  timestamp: string;
}

export interface DudwallsError {
  /** Error message */
  message: string;
  /** Error code */
  code: string;
  /** HTTP status code */
  status: number;
  /** Additional error details */
  details?: any;
}

export interface DatabaseInfo {
  /** Database name */
  name: string;
  /** Creation timestamp */
  createdAt?: string;
  /** Last modified timestamp */
  updatedAt?: string;
  /** Number of collections */
  collections?: number;
  /** Database size in bytes */
  size?: number;
}

export interface CollectionInfo {
  /** Collection name */
  name: string;
  /** Creation timestamp */
  createdAt?: string;
  /** Last modified timestamp */
  updatedAt?: string;
  /** Number of documents */
  documents?: number;
  /** Collection size in bytes */
  size?: number;
}

export interface DocumentInfo {
  /** Document ID */
  id: string;
  /** Creation timestamp */
  createdAt?: string;
  /** Last modified timestamp */
  updatedAt?: string;
  /** Document size in bytes */
  size?: number;
}

export interface BulkOperation {
  /** Operation type */
  operation: 'create' | 'update' | 'delete';
  /** Document ID (required for update/delete) */
  id?: string;
  /** Document data (required for create/update) */
  data?: DudwallsDocument;
}

export interface BulkResult {
  /** Number of successful operations */
  success: number;
  /** Number of failed operations */
  failed: number;
  /** Detailed results for each operation */
  results: Array<{
    operation: BulkOperation;
    success: boolean;
    error?: string;
    data?: DudwallsDocument;
  }>;
}

export interface RealtimeOptions {
  /** Event types to listen for */
  events?: ('create' | 'update' | 'delete')[];
  /** Filter conditions for realtime updates */
  filter?: Record<string, any>;
  /** Reconnection options */
  reconnect?: {
    enabled: boolean;
    maxAttempts: number;
    delay: number;
  };
}

export interface RealtimeEvent {
  /** Event type */
  type: 'create' | 'update' | 'delete';
  /** Database name */
  database: string;
  /** Collection name */
  collection: string;
  /** Document ID */
  documentId: string;
  /** Document data (for create/update events) */
  data?: DudwallsDocument;
  /** Event timestamp */
  timestamp: string;
}

export type RealtimeCallback = (event: RealtimeEvent) => void;
export type ErrorCallback = (error: DudwallsError) => void;

// Language-specific interfaces for SDK generation
export interface SDKLanguageConfig {
  /** Language name */
  language: 'javascript' | 'typescript' | 'python' | 'php' | 'java' | 'go' | 'csharp' | 'ruby';
  /** Package/module name */
  packageName?: string;
  /** Version */
  version?: string;
  /** Additional configuration */
  config?: Record<string, any>;
}

export interface GeneratedSDK {
  /** Language */
  language: string;
  /** Generated code */
  code: string;
  /** Installation instructions */
  installation: string;
  /** Usage examples */
  examples: string[];
  /** Documentation */
  documentation: string;
}
