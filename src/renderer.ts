/**
 * Sri Yantra SVG Renderer
 *
 * Renders mathematically precise SVG output from computed geometry.
 * Supports full yantra (all 9 avaranas) and minimal mark.
 */

import {
  computeGeometry,
  getMinimalGeometry,
  type Point,
  type SriYantraGeometry,
  type Triangle,
} from "./geometry.js";

export interface RenderOptions {
  /** Output size in pixels (square). Default: 512 */
  size?: number;
  /** Primary stroke color. Default: '#C9501C' (Vibz.Art saffron) */
  color?: string;
  /** Shiva triangle color. Falls back to `color` if not set */
  shivaColor?: string;
  /** Shakti triangle color. Falls back to `color` if not set */
  shaktiColor?: string;
  /** Bindu color. Falls back to `color` if not set */
  binduColor?: string;
  /** Background color. Default: 'none' (transparent) */
  background?: string;
  /** Stroke width relative to size. Default: 0.004 */
  strokeWidth?: number;
  /** Bindu radius relative to size. Default: 0.008 */
  binduRadius?: number;
  /** Include outer circle. Default: true */
  outerCircle?: boolean;
  /** Include 16-petal lotus (avarana 2). Default: true */
  sixteenPetalLotus?: boolean;
  /** Include 8-petal lotus (avarana 3). Default: true */
  eightPetalLotus?: boolean;
  /** Include bhupura / outer square frame (avarana 1). Default: true */
  bhupura?: boolean;
  /** Include bindu point. Default: true */
  bindu?: boolean;
  /** Fill triangles instead of stroke only. Default: false */
  filled?: boolean;
  /** Fill opacity when filled is true. Default: 0.1 */
  fillOpacity?: number;
}

export interface MinimalMarkOptions {
  /** Output size in pixels. Default: 512 */
  size?: number;
  /** Primary color. Default: '#C9501C' */
  color?: string;
  /** Shiva (upward) triangle color. Falls back to `color` */
  shivaColor?: string;
  /** Shakti (downward) triangle color. Falls back to `color` */
  shaktiColor?: string;
  /** Bindu color. Falls back to `color` */
  binduColor?: string;
  /** Background color. Default: 'none' */
  background?: string;
  /** Stroke width relative to size. Default: 0.006 */
  strokeWidth?: number;
  /** Bindu radius relative to size. Default: 0.015 */
  binduRadius?: number;
  /** Include enclosing circle. Default: false */
  enclosingCircle?: boolean;
  /** Fill triangles. Default: false */
  filled?: boolean;
  /** Fill opacity. Default: 0.1 */
  fillOpacity?: number;
}

function triangleToPath(tri: Triangle, scale: number, offset: number): string {
  const [a, b, c] = tri.vertices.map((v) => ({
    x: v.x * scale + offset,
    y: v.y * scale + offset,
  }));
  return `M ${a.x} ${a.y} L ${b.x} ${b.y} L ${c.x} ${c.y} Z`;
}

function petalPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  petalAngle: number,
): string {
  const halfPetal = petalAngle * 0.4;

  const innerLeft = {
    x: cx + innerR * Math.cos(startAngle - halfPetal),
    y: cy + innerR * Math.sin(startAngle - halfPetal),
  };
  const innerRight = {
    x: cx + innerR * Math.cos(startAngle + halfPetal),
    y: cy + innerR * Math.sin(startAngle + halfPetal),
  };
  const outerTip = {
    x: cx + outerR * Math.cos(startAngle),
    y: cy + outerR * Math.sin(startAngle),
  };

  // Quadratic bezier petals
  const cpLeft = {
    x: cx + (innerR + outerR) * 0.55 * Math.cos(startAngle - halfPetal * 0.5),
    y: cy + (innerR + outerR) * 0.55 * Math.sin(startAngle - halfPetal * 0.5),
  };
  const cpRight = {
    x: cx + (innerR + outerR) * 0.55 * Math.cos(startAngle + halfPetal * 0.5),
    y: cy + (innerR + outerR) * 0.55 * Math.sin(startAngle + halfPetal * 0.5),
  };

  return [
    `M ${innerLeft.x} ${innerLeft.y}`,
    `Q ${cpLeft.x} ${cpLeft.y} ${outerTip.x} ${outerTip.y}`,
    `Q ${cpRight.x} ${cpRight.y} ${innerRight.x} ${innerRight.y}`,
  ].join(" ");
}

function renderLotus(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  petalCount: number,
  color: string,
  strokeW: number,
): string {
  const paths: string[] = [];
  const petalAngle = (Math.PI * 2) / petalCount;
  const rotationOffset = -Math.PI / 2; // Start from top

  for (let i = 0; i < petalCount; i++) {
    const angle = rotationOffset + i * petalAngle;
    paths.push(petalPath(cx, cy, innerRadius, outerRadius, angle, petalAngle));
  }

  return `<g fill="none" stroke="${color}" stroke-width="${strokeW}" stroke-linejoin="round">
    ${paths.map((d) => `<path d="${d}"/>`).join("\n    ")}
    <circle cx="${cx}" cy="${cy}" r="${innerRadius}" />
    <circle cx="${cx}" cy="${cy}" r="${outerRadius}" />
  </g>`;
}

function renderBhupura(
  cx: number,
  cy: number,
  size: number,
  color: string,
  strokeW: number,
): string {
  const gateWidth = size * 0.06;
  const gateDepth = size * 0.04;
  const layers = [size * 0.48, size * 0.46, size * 0.44];

  return layers
    .map((half) => {
      const x = cx - half;
      const y = cy - half;
      const w = half * 2;
      const h = half * 2;

      // Square with four gates (openings at cardinal points)
      const gateHalf = gateWidth / 2;

      return `<g fill="none" stroke="${color}" stroke-width="${strokeW}">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" />
      <!-- Gates (T-shaped openings at cardinal points) -->
      <line x1="${cx - gateHalf}" y1="${y}" x2="${cx - gateHalf}" y2="${y - gateDepth}" />
      <line x1="${cx + gateHalf}" y1="${y}" x2="${cx + gateHalf}" y2="${y - gateDepth}" />
      <line x1="${cx - gateHalf}" y1="${y - gateDepth}" x2="${cx + gateHalf}" y2="${y - gateDepth}" />
      <line x1="${cx - gateHalf}" y1="${y + h}" x2="${cx - gateHalf}" y2="${y + h + gateDepth}" />
      <line x1="${cx + gateHalf}" y1="${y + h}" x2="${cx + gateHalf}" y2="${y + h + gateDepth}" />
      <line x1="${cx - gateHalf}" y1="${y + h + gateDepth}" x2="${cx + gateHalf}" y2="${y + h + gateDepth}" />
      <line x1="${x}" y1="${cy - gateHalf}" x2="${x - gateDepth}" y2="${cy - gateHalf}" />
      <line x1="${x}" y1="${cy + gateHalf}" x2="${x - gateDepth}" y2="${cy + gateHalf}" />
      <line x1="${x - gateDepth}" y1="${cy - gateHalf}" x2="${x - gateDepth}" y2="${cy + gateHalf}" />
      <line x1="${x + w}" y1="${cy - gateHalf}" x2="${x + w + gateDepth}" y2="${cy - gateHalf}" />
      <line x1="${x + w}" y1="${cy + gateHalf}" x2="${x + w + gateDepth}" y2="${cy + gateHalf}" />
      <line x1="${x + w + gateDepth}" y1="${cy - gateHalf}" x2="${x + w + gateDepth}" y2="${cy + gateHalf}" />
    </g>`;
    })
    .join("\n");
}

/**
 * Generate a complete Sri Yantra SVG.
 *
 * Includes all nine avaranas as described in Soundarya Lahari verse 11:
 *   1. Bhupura (three nested squares with gates)
 *   2. Sixteen-petalled lotus
 *   3. Eight-petalled lotus
 *   4-7. The 43 triangles formed by 9 interlocking triangles
 *   8. Central triangle
 *   9. Bindu
 */
export function generateSriYantra(options: RenderOptions = {}): string {
  const {
    size = 512,
    color = "#C9501C",
    shivaColor,
    shaktiColor,
    binduColor,
    background = "none",
    strokeWidth = 0.004,
    binduRadius = 0.008,
    outerCircle = true,
    sixteenPetalLotus = true,
    eightPetalLotus = true,
    bhupura = true,
    bindu = true,
    filled = false,
    fillOpacity = 0.1,
  } = options;

  const geo = computeGeometry();
  const sw = strokeWidth * size;
  const br = binduRadius * size;

  // Coordinate mapping: geometry is in [0, 1], we need padding for bhupura
  const padding = bhupura ? size * 0.05 : size * 0.02;
  const drawSize = size - padding * 2;

  const cx = size / 2;
  const cy = size / 2;
  const circleR = geo.outerCircleRadius * drawSize;

  const shivaC = shivaColor ?? color;
  const shaktiC = shaktiColor ?? color;
  const binduC = binduColor ?? color;

  const elements: string[] = [];

  // Background
  if (background !== "none") {
    elements.push(
      `<rect width="${size}" height="${size}" fill="${background}" />`,
    );
  }

  // Avarana 1: Bhupura (three nested squares with gates)
  if (bhupura) {
    elements.push(
      `<!-- Avarana 1: Trailokya Mohana Chakra (त्रैलोक्य मोहन चक्र) -->`,
    );
    elements.push(renderBhupura(cx, cy, size, color, sw));
  }

  // Avarana 2: Sixteen-petalled lotus
  if (sixteenPetalLotus) {
    elements.push(
      `<!-- Avarana 2: Sarvashaparipuraka Chakra (सर्वाशापरिपूरक चक्र) — 16-petal lotus -->`,
    );
    elements.push(
      renderLotus(cx, cy, circleR * 1.05, circleR * 1.22, 16, color, sw),
    );
  }

  // Avarana 3: Eight-petalled lotus
  if (eightPetalLotus) {
    elements.push(
      `<!-- Avarana 3: Sarvasankshobhana Chakra (सर्वसंक्षोभण चक्र) — 8-petal lotus -->`,
    );
    elements.push(
      renderLotus(cx, cy, circleR * 0.96, circleR * 1.05, 8, color, sw),
    );
  }

  // Outer circle
  if (outerCircle) {
    elements.push(
      `<circle cx="${cx}" cy="${cy}" r="${circleR}" fill="none" stroke="${color}" stroke-width="${sw}" />`,
    );
  }

  // Avaranas 4-8: The nine interlocking triangles
  elements.push(
    `<!-- Avaranas 4-8: Nine interlocking triangles (4 Shiva ↑ + 5 Shakti ↓) = 43 sub-triangles -->`,
  );

  for (const tri of geo.triangles) {
    const triColor = tri.tattva === "shiva" ? shivaC : shaktiC;
    const fillAttr = filled
      ? `fill="${triColor}" fill-opacity="${fillOpacity}"`
      : `fill="none"`;
    const path = triangleToPath(tri, drawSize, padding);
    elements.push(
      `<path d="${path}" ${fillAttr} stroke="${triColor}" stroke-width="${sw}" stroke-linejoin="miter" data-id="${tri.id}" data-tattva="${tri.tattva}" />`,
    );
  }

  // Avarana 9: Bindu
  if (bindu) {
    elements.push(
      `<!-- Avarana 9: Sarvanandamaya Chakra (सर्वानन्दमय चक्र) — Bindu -->`,
    );
    const bx = geo.bindu.x * drawSize + padding;
    const by = geo.bindu.y * drawSize + padding;
    elements.push(`<circle cx="${bx}" cy="${by}" r="${br}" fill="${binduC}" />`);
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`,
    `  <!-- Sri Yantra — Generated by @vibzart/sri-yantra -->`,
    `  <!-- Shastra: Soundarya Lahari, Verse 11 (Adi Shankaracharya) -->`,
    `  <!-- सर्वे भवन्तु सुखिनः — May all beings be happy -->`,
    ...elements.map((e) => `  ${e}`),
    `</svg>`,
  ].join("\n");
}

/**
 * Generate the minimal mark — the innermost Shiva-Shakti interlock + bindu.
 *
 * This extracts only:
 *   - U4 (smallest Shiva/upward triangle)
 *   - D5 (smallest Shakti/downward triangle)
 *   - Bindu (center point)
 *
 * Representing Avaranas 8 (Sarvasiddhiprada) and 9 (Sarvanandamaya) —
 * the bestower of all attainments and the point of total bliss.
 */
export function generateMinimalMark(options: MinimalMarkOptions = {}): string {
  const {
    size = 512,
    color = "#C9501C",
    shivaColor,
    shaktiColor,
    binduColor,
    background = "none",
    strokeWidth = 0.006,
    binduRadius = 0.015,
    enclosingCircle = false,
    filled = false,
    fillOpacity = 0.1,
  } = options;

  const geo = getMinimalGeometry();
  const sw = strokeWidth * size;
  const br = binduRadius * size;

  // Find bounding box of the minimal triangles and center them
  const allPoints = geo.triangles.flatMap((t) => t.vertices);
  const minX = Math.min(...allPoints.map((p) => p.x));
  const maxX = Math.max(...allPoints.map((p) => p.x));
  const minY = Math.min(...allPoints.map((p) => p.y));
  const maxY = Math.max(...allPoints.map((p) => p.y));

  const geoWidth = maxX - minX;
  const geoHeight = maxY - minY;
  const geoCx = (minX + maxX) / 2;
  const geoCy = (minY + maxY) / 2;

  // Scale to fit with padding
  const padding = size * 0.1;
  const availableSize = size - padding * 2;
  const scale = availableSize / Math.max(geoWidth, geoHeight);

  const cx = size / 2;
  const cy = size / 2;

  const shivaC = shivaColor ?? color;
  const shaktiC = shaktiColor ?? color;
  const binduC = binduColor ?? color;

  const elements: string[] = [];

  if (background !== "none") {
    elements.push(
      `<rect width="${size}" height="${size}" fill="${background}" />`,
    );
  }

  if (enclosingCircle) {
    const circleR = (availableSize / 2) * 1.05;
    elements.push(
      `<circle cx="${cx}" cy="${cy}" r="${circleR}" fill="none" stroke="${color}" stroke-width="${sw}" />`,
    );
  }

  for (const tri of geo.triangles) {
    const triColor = tri.tattva === "shiva" ? shivaC : shaktiC;
    const fillAttr = filled
      ? `fill="${triColor}" fill-opacity="${fillOpacity}"`
      : `fill="none"`;

    const transformedVertices = tri.vertices.map((v) => ({
      x: (v.x - geoCx) * scale + cx,
      y: (v.y - geoCy) * scale + cy,
    }));

    const [a, b, c] = transformedVertices;
    const path = `M ${a.x} ${a.y} L ${b.x} ${b.y} L ${c.x} ${c.y} Z`;

    elements.push(
      `<path d="${path}" ${fillAttr} stroke="${triColor}" stroke-width="${sw}" stroke-linejoin="miter" data-id="${tri.id}" data-tattva="${tri.tattva}" />`,
    );
  }

  // Bindu
  const bx = (geo.bindu.x - geoCx) * scale + cx;
  const by = (geo.bindu.y - geoCy) * scale + cy;
  elements.push(`<circle cx="${bx}" cy="${by}" r="${br}" fill="${binduC}" />`);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`,
    `  <!-- Minimal Mark — Innermost Sri Yantra (Avaranas 8-9) -->`,
    `  <!-- @vibzart/sri-yantra -->`,
    ...elements.map((e) => `  ${e}`),
    `</svg>`,
  ].join("\n");
}
