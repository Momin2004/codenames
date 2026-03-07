/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as DataTypes from "../DataTypes.js";
import type * as DeckFunctions from "../DeckFunctions.js";
import type * as DeckTemplate from "../DeckTemplate.js";
import type * as GameFunctions from "../GameFunctions.js";
import type * as LobbyFunctions from "../LobbyFunctions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  DataTypes: typeof DataTypes;
  DeckFunctions: typeof DeckFunctions;
  DeckTemplate: typeof DeckTemplate;
  GameFunctions: typeof GameFunctions;
  LobbyFunctions: typeof LobbyFunctions;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
