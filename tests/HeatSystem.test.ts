import { describe, expect, it } from "vitest";
import {
  createDefaultHeat,
  fireRateMultiplier,
  heatRatio,
  isOverheated,
  registerShot,
  tickHeat,
} from "@/systems/HeatSystem";

describe("HeatSystem", () => {
  it("starts cold", () => {
    const h = createDefaultHeat();
    expect(h.current).toBe(0);
    expect(isOverheated(h)).toBe(false);
    expect(fireRateMultiplier(h)).toBe(1);
  });

  it("registerShot increases heat but clamps to max", () => {
    const h = createDefaultHeat();
    for (let i = 0; i < 1000; i++) registerShot(h);
    expect(h.current).toBe(h.max);
  });

  it("tickHeat decays current heat over time", () => {
    const h = createDefaultHeat();
    h.current = 60;
    tickHeat(h, 1);
    expect(h.current).toBeCloseTo(60 - h.decayPerSec, 5);
  });

  it("tickHeat never goes negative", () => {
    const h = createDefaultHeat();
    h.current = 5;
    tickHeat(h, 99);
    expect(h.current).toBe(0);
  });

  it("fireRateMultiplier penalizes above threshold", () => {
    const h = createDefaultHeat();
    h.current = h.penaltyThreshold + 1;
    expect(fireRateMultiplier(h)).toBeGreaterThan(1);
    h.current = h.max;
    expect(fireRateMultiplier(h)).toBeCloseTo(h.penaltyMult, 5);
  });

  it("isOverheated flips at threshold", () => {
    const h = createDefaultHeat();
    h.current = h.penaltyThreshold - 0.01;
    expect(isOverheated(h)).toBe(false);
    h.current = h.penaltyThreshold;
    expect(isOverheated(h)).toBe(true);
  });

  it("heatRatio is clamped [0,1]", () => {
    const h = createDefaultHeat();
    h.current = -50;
    expect(heatRatio(h)).toBe(0);
    h.current = h.max * 2;
    expect(heatRatio(h)).toBe(1);
  });

  it("sustained fire eventually overheats; rest cools below threshold", () => {
    const h = createDefaultHeat();
    for (let i = 0; i < 50; i++) registerShot(h);
    expect(isOverheated(h)).toBe(true);
    tickHeat(h, 10);
    expect(isOverheated(h)).toBe(false);
  });
});
