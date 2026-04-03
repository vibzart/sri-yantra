import { describe, it, expect } from "vitest";
import { generateSriYantra, generateMinimalMark } from "../src/svg/renderer.js";
import type { TargetUse } from "../src/core/types.js";

const TARGETS: TargetUse[] = ["favicon", "logo", "hero", "print"];

/** Extract the first stroke-width value from an SVG string */
function extractStrokeWidth(svg: string): number {
  const match = svg.match(/stroke-width="([^"]+)"/);
  return match ? parseFloat(match[1]) : NaN;
}

/** Extract bindu circle radius (the filled circle) */
function extractBinduRadius(svg: string, color: string): number {
  const re = new RegExp(`r="([^"]+)"[^>]*fill="${color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`);
  const match = svg.match(re);
  return match ? parseFloat(match[1]) : NaN;
}

// ─── generateSriYantra ────────────────────────────────────

describe("generateSriYantra", () => {
  describe("SVG structure", () => {
    it("produces valid SVG with xmlns and viewBox", () => {
      const svg = generateSriYantra({ size: 512 });
      expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
      expect(svg).toContain('viewBox="0 0 512 512"');
      expect(svg).toMatch(/<\/svg>$/);
    });

    it("includes all avaranas by default", () => {
      const svg = generateSriYantra({ size: 512 });
      expect(svg).toContain("Trailokya Mohana");     // bhupura
      expect(svg).toContain("16-petal lotus");
      expect(svg).toContain("8-petal lotus");
      expect(svg).toContain("Sarvanandamaya");        // bindu
    });

    it("contains 9 triangle paths", () => {
      const svg = generateSriYantra({ size: 512 });
      const trianglePaths = svg.match(/data-id="[UD]\d"/g);
      expect(trianglePaths).toHaveLength(9);
    });

    it("labels triangles with correct tattva", () => {
      const svg = generateSriYantra({ size: 512 });
      expect(svg).toContain('data-id="U1" data-tattva="shiva"');
      expect(svg).toContain('data-id="D1" data-tattva="shakti"');
    });
  });

  describe("element toggles", () => {
    it("can disable bhupura", () => {
      const svg = generateSriYantra({ bhupura: false });
      expect(svg).not.toContain("Trailokya");
    });

    it("can disable lotuses", () => {
      const svg = generateSriYantra({ sixteenPetalLotus: false, eightPetalLotus: false });
      expect(svg).not.toContain("16-petal");
      expect(svg).not.toContain("8-petal");
    });

    it("can disable bindu", () => {
      const svg = generateSriYantra({ bindu: false });
      expect(svg).not.toContain("Sarvanandamaya");
    });
  });

  describe("colors", () => {
    it("uses default saffron color", () => {
      const svg = generateSriYantra({ size: 256 });
      expect(svg).toContain('stroke="#C9501C"');
    });

    it("supports dual Shiva/Shakti colors", () => {
      const svg = generateSriYantra({
        shivaColor: "#111111",
        shaktiColor: "#222222",
      });
      expect(svg).toContain('stroke="#111111"');
      expect(svg).toContain('stroke="#222222"');
    });

    it("supports custom bindu color", () => {
      const svg = generateSriYantra({ binduColor: "#GOLD00" });
      expect(svg).toContain('fill="#GOLD00"');
    });

    it("supports background fill", () => {
      const svg = generateSriYantra({ background: "#000000" });
      expect(svg).toContain('fill="#000000"');
    });
  });

  describe("fill mode", () => {
    it("triangles are unfilled by default", () => {
      const svg = generateSriYantra({ size: 256 });
      expect(svg).toContain('fill="none"');
    });

    it("filled mode adds fill with opacity", () => {
      const svg = generateSriYantra({ filled: true, fillOpacity: 0.2 });
      expect(svg).toContain('fill-opacity="0.2"');
      expect(svg).not.toMatch(/data-tattva="shiva"[^>]*fill="none"/);
    });
  });

  describe("optical scaling", () => {
    it("favicon has bolder strokes than print at same size", () => {
      const favSw = extractStrokeWidth(generateSriYantra({ size: 512, targetUse: "favicon" }));
      const printSw = extractStrokeWidth(generateSriYantra({ size: 512, targetUse: "print" }));
      expect(favSw).toBeGreaterThan(printSw);
      expect(favSw / printSw).toBeGreaterThan(3);
    });

    it("favicon auto-disables bhupura and lotuses", () => {
      const svg = generateSriYantra({ size: 32, targetUse: "favicon" });
      expect(svg).not.toContain("Trailokya");
      expect(svg).not.toContain("16-petal");
      expect(svg).not.toContain("8-petal");
    });

    it("favicon auto-disable can be overridden", () => {
      const svg = generateSriYantra({ size: 32, targetUse: "favicon", bhupura: true });
      expect(svg).toContain("Trailokya");
    });

    it("hero keeps all elements", () => {
      const svg = generateSriYantra({ size: 512, targetUse: "hero" });
      expect(svg).toContain("Trailokya");
      expect(svg).toContain("16-petal");
    });

    it("stroke widths decrease monotonically from favicon to print", () => {
      const widths = TARGETS.map((t) =>
        extractStrokeWidth(generateSriYantra({ size: 512, targetUse: t })),
      );
      for (let i = 1; i < widths.length; i++) {
        expect(widths[i]).toBeLessThan(widths[i - 1]);
      }
    });
  });

  describe("backwards compatibility", () => {
    it("no targetUse produces default stroke width", () => {
      const sw = extractStrokeWidth(generateSriYantra({ size: 512 }));
      // default strokeWidth = 0.004, size = 512 → 0.004 * 512 = 2.048
      expect(sw).toBe(2.048);
    });

    it("no targetUse includes all elements", () => {
      const svg = generateSriYantra({ size: 512 });
      expect(svg).toContain("Trailokya");
      expect(svg).toContain("16-petal");
      expect(svg).toContain("8-petal");
      expect(svg).toContain("Sarvanandamaya");
    });
  });

  describe("strokeLinecap", () => {
    it("omits linecap attribute when butt (SVG default)", () => {
      const svg = generateSriYantra({ size: 256 });
      expect(svg).not.toContain("stroke-linecap");
    });

    it("adds round linecap", () => {
      const svg = generateSriYantra({ size: 256, strokeLinecap: "round" });
      expect(svg).toContain('stroke-linecap="round"');
    });

    it("adds square linecap", () => {
      const svg = generateSriYantra({ size: 256, strokeLinecap: "square" });
      expect(svg).toContain('stroke-linecap="square"');
    });
  });
});

// ─── generateMinimalMark ──────────────────────────────────

describe("generateMinimalMark", () => {
  describe("SVG structure", () => {
    it("produces valid SVG", () => {
      const svg = generateMinimalMark({ size: 256 });
      expect(svg).toMatch(/^<svg xmlns/);
      expect(svg).toMatch(/<\/svg>$/);
    });

    it("contains exactly 2 triangle paths (U4 + D5)", () => {
      const svg = generateMinimalMark({ size: 256 });
      const ids = svg.match(/data-id="[UD]\d"/g);
      expect(ids).toHaveLength(2);
      expect(svg).toContain('data-id="U4"');
      expect(svg).toContain('data-id="D5"');
    });

    it("always includes bindu", () => {
      const svg = generateMinimalMark({ size: 256 });
      // Bindu is a filled circle (not stroke)
      expect(svg).toMatch(/<circle[^>]+fill="#C9501C"/);
    });
  });

  describe("enclosing circle", () => {
    it("no enclosing circle by default", () => {
      const svg = generateMinimalMark({ size: 256 });
      // Should have only the bindu circle, not an enclosing one
      const circles = svg.match(/<circle/g);
      expect(circles).toHaveLength(1); // just bindu
    });

    it("adds enclosing circle when requested", () => {
      const svg = generateMinimalMark({ size: 256, enclosingCircle: true });
      const circles = svg.match(/<circle/g);
      expect(circles).toHaveLength(2); // enclosing + bindu
    });
  });

  describe("optical scaling", () => {
    it("favicon has bolder strokes than print", () => {
      const favSw = extractStrokeWidth(generateMinimalMark({ size: 512, targetUse: "favicon" }));
      const printSw = extractStrokeWidth(generateMinimalMark({ size: 512, targetUse: "print" }));
      expect(favSw).toBeGreaterThan(printSw);
    });

    it("favicon has larger bindu than print", () => {
      const favBr = extractBinduRadius(
        generateMinimalMark({ size: 512, targetUse: "favicon" }),
        "#C9501C",
      );
      const printBr = extractBinduRadius(
        generateMinimalMark({ size: 512, targetUse: "print" }),
        "#C9501C",
      );
      expect(favBr).toBeGreaterThan(printBr);
    });

    it("explicit strokeWidth overrides preset", () => {
      const svg = generateMinimalMark({
        size: 512,
        targetUse: "favicon",
        strokeWidth: 0.001,
      });
      // 0.001 * 512 = 0.512
      expect(extractStrokeWidth(svg)).toBe(0.512);
    });
  });

  describe("backwards compatibility", () => {
    it("no targetUse produces default stroke width", () => {
      const sw = extractStrokeWidth(generateMinimalMark({ size: 512 }));
      // default strokeWidth = 0.006, size = 512 → 3.072
      expect(sw).toBe(3.072);
    });
  });

  describe("strokeLinecap", () => {
    it("omits linecap by default", () => {
      const svg = generateMinimalMark({ size: 256 });
      expect(svg).not.toContain("stroke-linecap");
    });

    it("adds round linecap", () => {
      const svg = generateMinimalMark({ size: 256, strokeLinecap: "round" });
      expect(svg).toContain('stroke-linecap="round"');
    });
  });
});
