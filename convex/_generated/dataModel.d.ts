/* eslint-disable */
/**
 * Generated data model types.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  DataModelFromSchemaDefinition,
  DocumentByName,
  TableNamesInDataModel,
  SystemTableNames,
} from "convex/server";
import type { GenericId } from "convex/values";

/**
 * No `schema.ts` file found for this project.
 */

/**
 * The names of all of your Convex tables.
 */
export type TableNames = string;

/**
 * The type of a document stored in Convex.
 */
export type Doc<TableName extends TableNames> = Record<string, any>;

/**
 * An identifier for a document in Convex.
 */
export type Id<TableName extends TableNames | SystemTableNames> =
  GenericId<TableName>;
