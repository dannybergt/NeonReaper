import { describe, expect, it } from "vitest";
import { pickSpawnPoint, type SpawnArea } from "@/systems/SpawnZone";

function seedRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x1_0000_0000;
  };
}

const AREA: SpawnArea = {
  centerX: 0,
  centerY: 0,
  halfWidth: 640,
  halfHeight: 360,
  buffer: 80,
};

describe("SpawnZone.pickSpawnPoint", () => {
  it("always sits on one of the four borders", () => {
    const rng = seedRng(1);
    for (let i = 0; i < 200; i++) {
      const p = pickSpawnPoint(AREA, rng);
      const xExtent = AREA.halfWidth + AREA.buffer;
      const yExtent = AREA.halfHeight + AREA.buffer;
      const onTop = Math.abs(p.y - (AREA.centerY - yExtent)) < 1e-6;
      const onBottom = Math.abs(p.y - (AREA.centerY + yExtent)) < 1e-6;
      const onLeft = Math.abs(p.x - (AREA.centerX - xExtent)) < 1e-6;
      const onRight = Math.abs(p.x - (AREA.centerX + xExtent)) < 1e-6;
      expect(onTop || onBottom || onLeft || onRight).toBe(true);
    }
  });

  it("hits all four sides with even-ish distribution over 4000 rolls", () => {
    const rng = seedRng(42);
    const counts = { top: 0, right: 0, bottom: 0, left: 0 };
    const N = 4000;
    for (let i = 0; i < N; i++) {
      counts[pickSpawnPoint(AREA, rng).side]++;
    }
    // Each side should be roughly N/4 = 1000. Allow ±15% tolerance.
    const min = N * 0.25 * 0.85;
    const max = N * 0.25 * 1.15;
    for (const v of Object.values(counts)) {
      expect(v).toBeGreaterThan(min);
      expect(v).toBeLessThan(max);
    }
  });

  it("respects center offset (player at +1000, +1000)", () => {
    const a: SpawnArea = { centerX: 1000, centerY: 1000, halfWidth: 100, halfHeight: 100, buffer: 10 };
    const rng = seedRng(7);
    for (let i = 0; i < 50; i++) {
      const p = pickSpawnPoint(a, rng);
      expect(p.x).toBeGreaterThanOrEqual(890);
      expect(p.x).toBeLessThanOrEqual(1110);
      expect(p.y).toBeGreaterThanOrEqual(890);
      expect(p.y).toBeLessThanOrEqual(1110);
    }
  });

  it("is deterministic with same rng seed", () => {
    const a = pickSpawnPoint(AREA, seedRng(99));
    const b = pickSpawnPoint(AREA, seedRng(99));
    expect(a).toEqual(b);
  });
});
