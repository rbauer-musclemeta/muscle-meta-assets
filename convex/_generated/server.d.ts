/* eslint-disable */
/**
 * Generated utilities for implementing server-side Convex query and mutation functions.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  GenericActionCtx,
  GenericMutationCtx,
  GenericQueryCtx,
  GenericDatabaseReader,
  GenericDatabaseWriter,
} from "convex/server";
import type { DataModel } from "./dataModel.js";

/**
 * Define a query in this Convex app's public API.
 */
export declare const query: import("convex/server").QueryBuilder<DataModel, "public">;

/**
 * Define a mutation in this Convex app's public API.
 */
export declare const mutation: import("convex/server").MutationBuilder<DataModel, "public">;

/**
 * Define an action in this Convex app's public API.
 */
export declare const action: import("convex/server").ActionBuilder<DataModel, "public">;

/**
 * Define a query that is only accessible from other Convex functions (not from the client).
 */
export declare const internalQuery: import("convex/server").QueryBuilder<DataModel, "internal">;

/**
 * Define a mutation that is only accessible from other Convex functions (not from the client).
 */
export declare const internalMutation: import("convex/server").MutationBuilder<DataModel, "internal">;

/**
 * Define an action that is only accessible from other Convex functions (not from the client).
 */
export declare const internalAction: import("convex/server").ActionBuilder<DataModel, "internal">;

/**
 * Define an HTTP action.
 */
export declare const httpAction: import("convex/server").HttpActionBuilder;
