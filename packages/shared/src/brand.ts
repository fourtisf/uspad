/**
 * The product's name as users see it (owner, 2026-11-02: 金牛 jinniu on jinniu.fun; it was hwai on hwai.ai
 * from 2026-10-31, and uspad on uspad.fun before that).
 * - BRAND is the name in Chinese copy.
 * - BRAND_LATIN is the name in English copy and wherever text stays ASCII: the API's messages, the wallet
 *   sign-in statement, the PlatformConfig's name.
 * The web copy, the API's messages, the sign-in statement, alerts and new coins' metadata take them from here.
 * Internal names (`@divvy/*`, DIVVY_* env vars, `divvy:` Redis keys, server paths) stay as they are.
 */
export const BRAND = "红利";
export const BRAND_LATIN = "hongli";
export const DOMAIN = "hongli.fun";
