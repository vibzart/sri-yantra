/**
 * @vibzart/sri-yantra
 *
 * Mathematically precise Sri Yantra SVG generator.
 * Shastra-validated sacred geometry.
 *
 * Default export includes core geometry + SVG renderers (zero dependencies).
 * For 3D rendering: import from '@vibzart/sri-yantra/three'
 * For React components: import from '@vibzart/sri-yantra/react'
 * For Canvas rendering: import from '@vibzart/sri-yantra/canvas'
 *
 * @see https://vibz.art/tools/sri-yantra
 * @license MIT
 */

// Core geometry (zero dependencies)
export {
  computeGeometry,
  getMinimalGeometry,
  computeMarmaPoints,
  segmentIntersection,
  prepareForRender,
  prepareMinimalForRender,
  prepareLotus,
  prepareBhupura,
  NINE_AVARANAS,
} from "./core/index.js";

export type {
  Point,
  Triangle,
  SriYantraGeometry,
  MarmaPoint,
  SubTriangle,
  Avarana,
  PreparedGeometry,
  PreparedTriangle,
  PreparedLotus,
  PreparedBhupura,
  BaseRenderOptions,
} from "./core/index.js";

// SVG renderers (zero dependencies)
export {
  generateSriYantra,
  generateMinimalMark,
  generateAnimatedSriYantra,
} from "./svg/index.js";

export type {
  RenderOptions,
  MinimalMarkOptions,
  AnimatedSvgOptions,
  AnimationPreset,
} from "./svg/index.js";
