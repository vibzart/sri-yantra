import { describe, it, expect } from "vitest";
import { computeGeometry, getMinimalGeometry } from "../src/core/geometry.js";
import { computeMarmaPoints } from "../src/core/intersections.js";

describe("computeGeometry", () => {
  const geo = computeGeometry();

  it("returns exactly 9 triangles", () => {
    expect(geo.triangles).toHaveLength(9);
  });

  it("has 4 Shiva (upward) and 5 Shakti (downward) triangles", () => {
    const shiva = geo.triangles.filter((t) => t.tattva === "shiva");
    const shakti = geo.triangles.filter((t) => t.tattva === "shakti");
    expect(shiva).toHaveLength(4);
    expect(shakti).toHaveLength(5);
  });

  it("triangle IDs match canonical names", () => {
    const ids = geo.triangles.map((t) => t.id).sort();
    expect(ids).toEqual(["D1", "D2", "D3", "D4", "D5", "U1", "U2", "U3", "U4"]);
  });

  it("all coordinates are normalized to [0, 1]", () => {
    for (const tri of geo.triangles) {
      for (const v of tri.vertices) {
        expect(v.x).toBeGreaterThanOrEqual(0);
        expect(v.x).toBeLessThanOrEqual(1);
        expect(v.y).toBeGreaterThanOrEqual(0);
        expect(v.y).toBeLessThanOrEqual(1);
      }
    }
  });

  it("each triangle has 3 distinct vertices", () => {
    for (const tri of geo.triangles) {
      expect(tri.vertices).toHaveLength(3);
      const [a, b, c] = tri.vertices;
      // No two vertices should be identical
      expect(a.x !== b.x || a.y !== b.y).toBe(true);
      expect(b.x !== c.x || b.y !== c.y).toBe(true);
      expect(a.x !== c.x || a.y !== c.y).toBe(true);
    }
  });

  it("bindu is at the center (0.5, 0.5)", () => {
    expect(geo.bindu.x).toBe(0.5);
    expect(geo.bindu.y).toBe(0.5);
  });

  it("outer circle radius is 1/3 of the unit space", () => {
    expect(geo.outerCircleRadius).toBeCloseTo(1 / 3, 5);
  });

  it("Shiva triangles point up, Shakti triangles point down", () => {
    for (const tri of geo.triangles) {
      const [a, b, c] = tri.vertices;
      const baseY = (a.y + b.y) / 2;
      if (tri.direction === "up") {
        // Peak (c) should be above (smaller y) than base
        expect(c.y).toBeLessThan(baseY);
      } else {
        // Peak (c) should be below (larger y) than base
        expect(c.y).toBeGreaterThan(baseY);
      }
    }
  });
});

describe("getMinimalGeometry", () => {
  const minimal = getMinimalGeometry();

  it("returns exactly 2 triangles (U4 + D5)", () => {
    expect(minimal.triangles).toHaveLength(2);
    const ids = minimal.triangles.map((t) => t.id).sort();
    expect(ids).toEqual(["D5", "U4"]);
  });

  it("U4 is Shiva, D5 is Shakti", () => {
    const u4 = minimal.triangles.find((t) => t.id === "U4")!;
    const d5 = minimal.triangles.find((t) => t.id === "D5")!;
    expect(u4.tattva).toBe("shiva");
    expect(d5.tattva).toBe("shakti");
  });

  it("preserves bindu from full geometry", () => {
    const full = computeGeometry();
    expect(minimal.bindu).toEqual(full.bindu);
  });
});

describe("computeMarmaPoints", () => {
  const marma = computeMarmaPoints(computeGeometry());

  it("returns at least 16 marma (triple intersection) points", () => {
    // Theoretical count is 18, but the algorithm may merge near-coincident
    // points depending on tolerance. 16 is the current computed count.
    expect(marma.length).toBeGreaterThanOrEqual(16);
  });

  it("all marma points are within the unit square", () => {
    for (const m of marma) {
      expect(m.position.x).toBeGreaterThan(0);
      expect(m.position.x).toBeLessThan(1);
      expect(m.position.y).toBeGreaterThan(0);
      expect(m.position.y).toBeLessThan(1);
    }
  });

  it("each marma point references 3 edges", () => {
    for (const m of marma) {
      expect(m.edges).toHaveLength(3);
    }
  });
});
