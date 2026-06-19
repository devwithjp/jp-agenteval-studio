// Sub-path this app is mounted at under the unified portfolio domain (multi-zones).
// Must match `basePath` in next.config.ts. basePath auto-prefixes Links/router/assets,
// but NOT raw fetch() — so API calls use apiPath().
export const BASE_PATH = "/live/agenteval";
export const apiPath = (p: string) => `${BASE_PATH}${p}`;
