import { describe, expect, it } from "vitest";
import {
  curseEliteChance,
  ENEMY_TYPES,
  pickEnemyType,
  rollCursedElite,
  spawnWeights,
} from "@/systems/EnemyTypes";

function seedRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x1_0000_0000;
  };
}

describe("EnemyTypes", () => {
  it("walker is the only spawnable early (<30s)", () => {
    const w = spawnWeights(0);
    expect(w.find((x) => x.id === "walker")!.weight).toBeGreaterThan(0);
    expect(w.find((x) => x.id === "runner")!.weight).toBe(0);
    expect(w.find((x) => x.id === "brute")!.weight).toBe(0);
  });

  it("runner unlocks at 30s", () => {
    expect(spawnWeights(29).find((x) => x.id === "runner")!.weight).toBe(0);
    expect(spawnWeights(45).find((x) => x.id === "runner")!.weight).toBeGreaterThan(0);
  });

  it("brute unlocks at 90s", () => {
    expect(spawnWeights(89).find((x) => x.id === "brute")!.weight).toBe(0);
    expect(spawnWeights(120).find((x) => x.id === "brute")!.weight).toBeGreaterThan(0);
  });

  it("pickEnemyType is deterministic with same rng seed", () => {
    const a = Array.from({ length: 100 }, (_, i) => pickEnemyType(60 + i, seedRng(7)));
    const b = Array.from({ length: 100 }, (_, i) => pickEnemyType(60 + i, seedRng(7)));
    expect(a).toEqual(b);
  });

  it("at t=0 only walker spawns", () => {
    const picks = new Set<string>();
    for (let i = 0; i < 50; i++) picks.add(pickEnemyType(0, seedRng(i + 1)));
    expect(picks).toEqual(new Set(["walker"]));
  });

  it("late game (300s) can spawn all three types over many rolls", () => {
    const seen = new Set<string>();
    const rng = seedRng(99);
    for (let i = 0; i < 500 && seen.size < 3; i++) seen.add(pickEnemyType(300, rng));
    expect(seen).toEqual(new Set(["walker", "runner", "brute"]));
  });

  it("brute deals more damage than walker and runner", () => {
    expect(ENEMY_TYPES.brute.damage).toBeGreaterThan(ENEMY_TYPES.walker.damage);
    expect(ENEMY_TYPES.brute.damage).toBeGreaterThan(ENEMY_TYPES.runner.damage);
  });

  it("runner is faster than walker and brute", () => {
    expect(ENEMY_TYPES.runner.speed).toBeGreaterThan(ENEMY_TYPES.walker.speed);
    expect(ENEMY_TYPES.runner.speed).toBeGreaterThan(ENEMY_TYPES.brute.speed);
  });

  it("curseEliteChance is 0 before unlock", () => {
    expect(curseEliteChance(0)).toBe(0);
    expect(curseEliteChance(179)).toBe(0);
  });

  it("curseEliteChance ramps after unlock and caps", () => {
    expect(curseEliteChance(180)).toBe(0);
    const mid = curseEliteChance(180 + 120);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(0.18);
    expect(curseEliteChance(180 + 240)).toBeCloseTo(0.18, 5);
    expect(curseEliteChance(99_999)).toBeCloseTo(0.18, 5);
  });

  it("rollCursedElite never fires before unlock", () => {
    const rng = seedRng(7);
    for (let i = 0; i < 500; i++) expect(rollCursedElite(50, rng)).toBe(false);
  });
});
