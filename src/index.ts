/**
 * @vibzart/sri-yantra
 *
 * Mathematically precise Sri Yantra SVG generator.
 * Shastra-validated sacred geometry.
 *
 * Structure per Soundarya Lahari verse 11 (Adi Shankaracharya):
 *   - 4 upward triangles (Shiva)
 *   - 5 downward triangles (Shakti)
 *   - 43 sub-triangles
 *   - 18 Marma Sthanas (triple intersection points)
 *   - 16-petal lotus, 8-petal lotus
 *   - 3 concentric circles
 *   - Bhupura (3 nested squares with 4 gates)
 *   - Bindu (center point)
 *
 * @example
 * ```ts
 * import { generateSriYantra, generateMinimalMark } from '@vibzart/sri-yantra'
 *
 * // Full yantra
 * const fullSvg = generateSriYantra({ size: 1024, color: '#C9501C' })
 *
 * // Minimal mark (favicon/icon)
 * const miniSvg = generateMinimalMark({ size: 64, color: '#C9501C' })
 * ```
 *
 * @see https://vibz.art/tools/sri-yantra
 * @license MIT
 */

export { generateSriYantra, generateMinimalMark } from "./renderer.js";
export type { RenderOptions, MinimalMarkOptions } from "./renderer.js";

export {
  computeGeometry,
  getMinimalGeometry,
  NINE_AVARANAS,
} from "./geometry.js";
export type {
  Point,
  Triangle,
  SriYantraGeometry,
} from "./geometry.js";
