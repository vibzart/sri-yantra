import { describe, it, expect } from "vitest";
import { computeGeometry, getMinimalGeometry } from "../src/core/geometry.js";
import {
  prepareForRender,
  prepareMinimalForRender,
  prepareLotus,
  prepareBhupura,
} from "../src/core/transform.js";

describe("prepareForRender", () => {
  const geo = computeGeometry();

  it("maps all 9 triangles to pixel space", () => {
    const prepared = prepareForRender(geo, {
      size: 512,
      padding: 0.05,
      strokeWidth: 0.004,
      binduRadius: 0.008,
    });
    expect(prepared.triangles).toHaveLength(9);
  });

  it("all screen vertices are within the canvas bounds", () => {
    const size = 512;
    const prepared = prepareForRender(geo, {
      size,
      padding: 0.05,
      strokeWidth: 0.004,
      binduRadius: 0.008,
    });
    for (const tri of prepared.triangles) {
      for (const v of tri.screenVertices) {
        expect(v.x).toBeGreaterThanOrEqual(0);
        expect(v.x).toBeLessThanOrEqual(size);
        expect(v.y).toBeGreaterThanOrEqual(0);
        expect(v.y).toBeLessThanOrEqual(size);
      }
    }
  });

  it("generates valid SVG path data for each triangle", () => {
    const prepared = prepareForRender(geo, {
      size: 256,
      padding: 0.05,
      strokeWidth: 0.004,
      binduRadius: 0.008,
    });
    for (const tri of prepared.triangles) {
      expect(tri.pathData).toMatch(/^M .+ L .+ L .+ Z$/);
    }
  });

  it("stroke width scales with size", () => {
    const small = prepareForRender(geo, {
      size: 256,
      padding: 0.05,
      strokeWidth: 0.004,
      binduRadius: 0.008,
    });
    const large = prepareForRender(geo, {
      size: 1024,
      padding: 0.05,
      strokeWidth: 0.004,
      binduRadius: 0.008,
    });
    expect(large.strokeWidth).toBeGreaterThan(small.strokeWidth);
    expect(large.strokeWidth / small.strokeWidth).toBeCloseTo(4, 1);
  });

  it("bindu is positioned at the center", () => {
    const size = 512;
    const prepared = prepareForRender(geo, {
      size,
      padding: 0.05,
      strokeWidth: 0.004,
      binduRadius: 0.008,
    });
    // Bindu should be near center of canvas
    expect(prepared.bindu.x).toBeCloseTo(size / 2, -1);
    expect(prepared.bindu.y).toBeCloseTo(size / 2, -1);
  });
});

describe("prepareMinimalForRender", () => {
  const geo = getMinimalGeometry();

  it("maps 2 triangles to pixel space", () => {
    const prepared = prepareMinimalForRender(geo, {
      size: 512,
      padding: 0.1,
      strokeWidth: 0.006,
      binduRadius: 0.015,
    });
    expect(prepared.triangles).toHaveLength(2);
  });

  it("centers the geometry in the canvas", () => {
    const size = 512;
    const prepared = prepareMinimalForRender(geo, {
      size,
      padding: 0.1,
      strokeWidth: 0.006,
      binduRadius: 0.015,
    });
    expect(prepared.center.x).toBeCloseTo(size / 2, 0);
    expect(prepared.center.y).toBeCloseTo(size / 2, 0);
  });
});

describe("prepareLotus", () => {
  it("generates correct number of petals", () => {
    const lotus16 = prepareLotus(256, 256, 100, 120, 16);
    expect(lotus16.petalPaths).toHaveLength(16);

    const lotus8 = prepareLotus(256, 256, 80, 100, 8);
    expect(lotus8.petalPaths).toHaveLength(8);
  });

  it("petal paths are valid SVG quadratic curves", () => {
    const lotus = prepareLotus(256, 256, 100, 120, 8);
    for (const path of lotus.petalPaths) {
      expect(path).toMatch(/^M .+ Q .+ Q .+/);
    }
  });
});

describe("prepareBhupura", () => {
  it("generates 3 concentric layers", () => {
    const bhupura = prepareBhupura(256, 256, 512);
    expect(bhupura.layers).toHaveLength(3);
  });

  it("each layer has 4 gates (N/S/E/W)", () => {
    const bhupura = prepareBhupura(256, 256, 512);
    for (const layer of bhupura.layers) {
      expect(layer.gates).toHaveLength(4);
    }
  });

  it("layers are nested (outer to inner)", () => {
    const bhupura = prepareBhupura(256, 256, 512);
    for (let i = 1; i < bhupura.layers.length; i++) {
      expect(bhupura.layers[i].width).toBeLessThan(bhupura.layers[i - 1].width);
    }
  });
});
