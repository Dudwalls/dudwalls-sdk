"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.VERSION = exports.connect = exports.createClient = exports.Collection = exports.Database = exports.DudwallsClient = void 0;
// Main exports
var client_1 = require("./client");
Object.defineProperty(exports, "DudwallsClient", { enumerable: true, get: function () { return client_1.DudwallsClient; } });
var database_1 = require("./database");
Object.defineProperty(exports, "Database", { enumerable: true, get: function () { return database_1.Database; } });
var collection_1 = require("./collection");
Object.defineProperty(exports, "Collection", { enumerable: true, get: function () { return collection_1.Collection; } });
// Type exports
__exportStar(require("./types"), exports);
// Utility exports
var utils_1 = require("./utils");
Object.defineProperty(exports, "createClient", { enumerable: true, get: function () { return utils_1.createClient; } });
Object.defineProperty(exports, "connect", { enumerable: true, get: function () { return utils_1.connect; } });
// Version
exports.VERSION = '1.0.0';
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
var client_2 = require("./client");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return client_2.DudwallsClient; } });
//# sourceMappingURL=index.js.map