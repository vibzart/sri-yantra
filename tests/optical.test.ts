import { describe, it, expect } from "vitest";
import {
  resolveFullYantraOptics,
  resolveMinimalMarkOptics,
  faviconOverrides,
} from "../src/core/optical.js";
import type { TargetUse } from "../src/core/types.js";

const TARGETS: TargetUse[] = ["favicon", "logo", "hero", "print"];

describe("resolveFullYantraOptics", () => {
  it("returns defaults when no targetUse", () => {
    const result = resolveFullYantraOptics(undefined, undefined, undefined, 0.004, 0.008);
    expect(result.strokeWidth).toBe(0.004);
    expect(result.binduRadius).toBe(0.008);
  });

  it("stroke width decreases from favicon to print", () => {
    const widths = TARGETS.map(
      (t) => resolveFullYantraOptics(t, undefined, undefined, 0.004, 0.008).strokeWidth,
    );
    for (let i = 1; i < widths.length; i++) {
      expect(widths[i]).toBeLessThan(widths[i - 1]);
    }
  });

  it("bindu radius decreases from favicon to print", () => {
    const radii = TARGETS.map(
      (t) => resolveFullYantraOptics(t, undefined, undefined, 0.004, 0.008).binduRadius,
    );
    for (let i = 1; i < radii.length; i++) {
      expect(radii[i]).toBeLessThan(radii[i - 1]);
    }
  });

  it("explicit strokeWidth overrides preset", () => {
    const result = resolveFullYantraOptics("favicon", 0.001, undefined, 0.004, 0.008);
    expect(result.strokeWidth).toBe(0.001);
  });

  it("explicit binduRadius overrides preset", () => {
    const result = resolveFullYantraOptics("favicon", undefined, 0.05, 0.004, 0.008);
    expect(result.binduRadius).toBe(0.05);
  });

  it("explicit values can override both independently", () => {
    const result = resolveFullYantraOptics("print", 0.02, 0.03, 0.004, 0.008);
    expect(result.strokeWidth).toBe(0.02);
    expect(result.binduRadius).toBe(0.03);
  });
});

describe("resolveMinimalMarkOptics", () => {
  it("returns defaults when no targetUse", () => {
    const result = resolveMinimalMarkOptics(undefined, undefined, undefined, 0.006, 0.015);
    expect(result.strokeWidth).toBe(0.006);
    expect(result.binduRadius).toBe(0.015);
    expect(result.padding).toBe(0.1);
  });

  it("stroke width decreases from favicon to print", () => {
    const widths = TARGETS.map(
      (t) => resolveMinimalMarkOptics(t, undefined, undefined, 0.006, 0.015).strokeWidth,
    );
    for (let i = 1; i < widths.length; i++) {
      expect(widths[i]).toBeLessThan(widths[i - 1]);
    }
  });

  it("explicit strokeWidth overrides preset", () => {
    const result = resolveMinimalMarkOptics("favicon", 0.001, undefined, 0.006, 0.015);
    expect(result.strokeWidth).toBe(0.001);
  });

  it("all presets have positive padding", () => {
    for (const t of TARGETS) {
      const result = resolveMinimalMarkOptics(t, undefined, undefined, 0.006, 0.015);
      expect(result.padding).toBeGreaterThan(0);
    }
  });
});

describe("faviconOverrides", () => {
  it("returns overrides only for favicon", () => {
    const result = faviconOverrides("favicon");
    expect(result.bhupura).toBe(false);
    expect(result.sixteenPetalLotus).toBe(false);
    expect(result.eightPetalLotus).toBe(false);
  });

  it("returns empty object for non-favicon targets", () => {
    for (const t of ["logo", "hero", "print"] as TargetUse[]) {
      const result = faviconOverrides(t);
      expect(result).toEqual({});
    }
  });

  it("returns empty object when undefined", () => {
    expect(faviconOverrides(undefined)).toEqual({});
  });
});
