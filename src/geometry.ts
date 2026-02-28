/**
 * Sri Yantra Geometry — Core Mathematical Engine
 *
 * Coordinates derived from Type III (mathematically rigid) construction,
 * verified against the Soundarya Lahari verse 11 specification:
 *
 *   चतुर्भिः श्रीकण्ठैः शिवयुवतिभिः पञ्चभिरपि
 *   प्रभिन्नाभिः शम्भोर्नवभिरपि मूलप्रकृतिभिः ।
 *   चतुश्चत्वारिंशद्वसुदलकलाश्चत्रिवलय-
 *   त्रिरेखाभिः सार्धं तव शरणकोणाः परिणताः ॥ ११ ॥
 *
 * "By four Shrikanthas (Shiva triangles), by five Shiva-consorts
 * (Shakti triangles), nine root-natures in all, pierced by Shambhu
 * (the Bindu) — forty-three angles of Your dwelling are evolved,
 * along with eight and sixteen petals, three circles, and three lines."
 *
 * Structure (Soundarya Lahari v.11):
 *   - 4 upward triangles (Shiva / श्रीकण्ठ)
 *   - 5 downward triangles (Shakti / शिवयुवती)
 *   - 43 sub-triangles formed by intersections
 *   - 18 Marma Sthanas (triple intersection points)
 *   - Bindu at center (Sarvanandamaya Chakra)
 *
 * References:
 *   - Soundarya Lahari, Adi Shankaracharya (8th century CE)
 *   - Sri Vidya Ratna Sutram
 *   - "Sri Yantra Geometry" — sriyantraresearch.com
 *   - Type III construction via TeXample.net (verified coordinates)
 */

export interface Point {
  x: number;
  y: number;
}

export interface Triangle {
  /** Identifier: U1-U4 (Shiva/upward), D1-D5 (Shakti/downward) */
  id: string;
  /** Three vertices of the triangle */
  vertices: [Point, Point, Point];
  /** Direction: 'up' for Shiva, 'down' for Shakti */
  direction: "up" | "down";
  /** Tattva represented */
  tattva: "shiva" | "shakti";
}

export interface SriYantraGeometry {
  /** The nine interlocking triangles */
  triangles: Triangle[];
  /** Center point — Bindu (Sarvanandamaya Chakra) */
  bindu: Point;
  /** Outer circle radius */
  outerCircleRadius: number;
  /** The outer circle center */
  center: Point;
}

/**
 * Raw triangle data from Type III (mathematically rigid) construction.
 *
 * Each entry: [leftX, topOrBaseY, peakOrBaseY, rightX, type]
 * - type 0 = downward (Shakti), type 1 = upward (Shiva)
 *
 * These coordinates are computed from systems of linear and circular
 * equations ensuring precise superposition at all 18 marma points
 * (tri-rekha sangama — where exactly three lines meet).
 *
 * The coordinate system uses a 300x300 unit space with center at (150, 150).
 * The outer circle has radius 100 units in this space.
 */
const RAW_TRIANGLES: [number, number, number, number, number][] = [
  // D1: Largest downward triangle — all 3 vertices touch outer circle
  [53.65669559977147, 123.20508075688774, 250, 246.34330440022853, 0],
  // U1: Largest upward triangle — all 3 vertices touch outer circle
  [52.984011026495736, 174.24660560764943, 50, 247.01598897350425, 1],
  // U3: Upward, fully enclosed
  [98.71823312733801, 220.03828947357886, 123.20508075688774, 201.281766872662, 1],
  // U2: Upward
  [78.26467997914015, 197.92315674002487, 78.10499177949904, 221.73532002085986, 1],
  // D3: Downward, fully enclosed
  [90.4856922951427, 78.10499177949904, 160.66014976539617, 209.51430770485734, 0],
  // D2: Downward — apex touches base of U1
  [80.98384838952128, 103.12199145016105, 220.03828947357886, 219.0161516104787, 0],
  // U4: Smallest upward triangle
  [114.9488500600036, 160.66014976539617, 103.12199145016105, 185.0511499399964, 1],
  // D4: Downward, fully enclosed
  [116.35142605010424, 134.30757626706648, 197.92315674002487, 183.64857394989576, 0],
  // D5: Smallest downward — forms innermost triangle around bindu
  [124.61190803072795, 144.79777263138968, 174.24660560764943, 175.38809196927207, 0],
];

/**
 * Triangle identifiers matching the canonical naming convention.
 * U = Upward (Shiva), D = Downward (Shakti)
 */
const TRIANGLE_IDS = ["D1", "U1", "U3", "U2", "D3", "D2", "U4", "D4", "D5"];

/**
 * Parse raw coordinate data into Triangle objects.
 *
 * For downward triangles (Shakti): base at top, apex points down
 *   - Left vertex: (leftX, topY)
 *   - Right vertex: (rightX, topY)
 *   - Apex: (midX, bottomY)
 *
 * For upward triangles (Shiva): base at bottom, apex points up
 *   - Left vertex: (leftX, bottomY)
 *   - Right vertex: (rightX, bottomY)
 *   - Apex: (midX, topY)
 */
function parseTriangle(
  raw: [number, number, number, number, number],
  id: string,
): Triangle {
  const [leftX, y1, y2, rightX, type] = raw;
  const midX = (leftX + rightX) / 2;
  const direction = type === 1 ? "up" : "down";

  let vertices: [Point, Point, Point];

  if (direction === "down") {
    // Downward: y1 is the top (base), y2 is the bottom (apex)
    vertices = [
      { x: leftX, y: y1 },
      { x: rightX, y: y1 },
      { x: midX, y: y2 },
    ];
  } else {
    // Upward: y1 is the bottom (base), y2 is the top (apex)
    vertices = [
      { x: leftX, y: y1 },
      { x: rightX, y: y1 },
      { x: midX, y: y2 },
    ];
  }

  return {
    id,
    vertices,
    direction,
    tattva: direction === "up" ? "shiva" : "shakti",
  };
}

/**
 * Compute the full Sri Yantra geometry.
 *
 * Returns normalized coordinates in a [0, 1] unit space
 * (divide raw 300-unit coords by 300) for easy scaling to any output size.
 */
export function computeGeometry(): SriYantraGeometry {
  const SPACE = 300;
  const CENTER = 150;
  const RADIUS = 100;

  const triangles = RAW_TRIANGLES.map((raw, i) => {
    const tri = parseTriangle(raw, TRIANGLE_IDS[i]);
    // Normalize to [0, 1]
    return {
      ...tri,
      vertices: tri.vertices.map((v) => ({
        x: v.x / SPACE,
        y: v.y / SPACE,
      })) as [Point, Point, Point],
    };
  });

  return {
    triangles,
    bindu: { x: CENTER / SPACE, y: CENTER / SPACE },
    outerCircleRadius: RADIUS / SPACE,
    center: { x: CENTER / SPACE, y: CENTER / SPACE },
  };
}

/**
 * Get only the innermost triangles for the minimal mark.
 *
 * Extracts the smallest Shiva triangle (U4) and smallest Shakti triangle (D5)
 * plus the bindu — representing Avaranas 8 and 9:
 *   - Avarana 8: Sarvasiddhiprada Chakra (central triangle)
 *   - Avarana 9: Sarvanandamaya Chakra (bindu)
 */
export function getMinimalGeometry(): SriYantraGeometry {
  const full = computeGeometry();
  const u4 = full.triangles.find((t) => t.id === "U4")!;
  const d5 = full.triangles.find((t) => t.id === "D5")!;

  return {
    triangles: [u4, d5],
    bindu: full.bindu,
    outerCircleRadius: full.outerCircleRadius,
    center: full.center,
  };
}

/**
 * The Nine Avaranas (enclosures) of the Sri Yantra.
 *
 * Each avarana is a layer of the yantra from outermost to innermost,
 * as described in the Sri Vidya tradition and Lalita Sahasranama.
 */
export const NINE_AVARANAS = [
  {
    number: 1,
    sanskrit: "त्रैलोक्य मोहन चक्र",
    transliteration: "Trailokya Mohana Chakra",
    meaning: "Enchanter of the Three Worlds",
    form: "Bhupura (three nested square enclosures)",
  },
  {
    number: 2,
    sanskrit: "सर्वाशापरिपूरक चक्र",
    transliteration: "Sarvashaparipuraka Chakra",
    meaning: "Fulfiller of All Desires",
    form: "Sixteen-petalled lotus",
  },
  {
    number: 3,
    sanskrit: "सर्वसंक्षोभण चक्र",
    transliteration: "Sarvasankshobhana Chakra",
    meaning: "Agitator of All",
    form: "Eight-petalled lotus",
  },
  {
    number: 4,
    sanskrit: "सर्वसौभाग्यदायक चक्र",
    transliteration: "Sarvasaubhagyadayaka Chakra",
    meaning: "Bestower of All Fortune",
    form: "Fourteen triangles (outermost ring)",
  },
  {
    number: 5,
    sanskrit: "सर्वार्थसाधक चक्र",
    transliteration: "Sarvarthasadhaka Chakra",
    meaning: "Accomplisher of All Purposes",
    form: "Ten triangles (outer ring)",
  },
  {
    number: 6,
    sanskrit: "सर्वरक्षाकर चक्र",
    transliteration: "Sarvarakshakara Chakra",
    meaning: "Protector of All",
    form: "Ten triangles (inner ring)",
  },
  {
    number: 7,
    sanskrit: "सर्वरोगहर चक्र",
    transliteration: "Sarvarogahara Chakra",
    meaning: "Remover of All Afflictions",
    form: "Eight triangles",
  },
  {
    number: 8,
    sanskrit: "सर्वसिद्धिप्रद चक्र",
    transliteration: "Sarvasiddhiprada Chakra",
    meaning: "Bestower of All Attainments",
    form: "Central triangle",
  },
  {
    number: 9,
    sanskrit: "सर्वानन्दमय चक्र",
    transliteration: "Sarvanandamaya Chakra",
    meaning: "Full of All Bliss",
    form: "Bindu (the point)",
  },
] as const;
