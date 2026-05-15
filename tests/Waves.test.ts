import { describe, expect, it } from "vitest";
import { buildWave1 } from "@/systems/Waves";

describe("Waves.buildWave1", () => {
  it("has monotonically increasing distances", () => {
    const w = buildWave1();
    for (let i = 1; i < w.events.length; i++) {
      expect(w.events[i]!.distance).toBeGreaterThanOrEqual(w.events[i - 1]!.distance);
    }
  });

  it("ends with a boss event", () => {
    const w = buildWave1();
    const last = w.events[w.events.length - 1]!;
    expect(last.kind).toBe("boss");
    expect(last.bossHp).toBeGreaterThan(0);
  });

  it("includes both gates and enemy groups", () => {
    const w = buildWave1();
    const kinds = new Set(w.events.map((e) => e.kind));
    expect(kinds.has("gatePair")).toBe(true);
    expect(kinds.has("enemyGroup")).toBe(true);
    expect(kinds.has("boss")).toBe(true);
  });

  it("totalDistance is at least the last event distance", () => {
    const w = buildWave1();
    const lastDist = w.events[w.events.length - 1]!.distance;
    expect(w.totalDistance).toBeGreaterThanOrEqual(lastDist);
  });
});
