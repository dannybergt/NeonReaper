import { describe, expect, it } from "vitest";
import { pickUpgrades, UPGRADE_POOL, type Upgrade } from "@/systems/UpgradeSystem";
import { createDefaultStats } from "@/systems/PlayerStats";

function seedRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x1_0000_0000;
  };
}

describe("UpgradeSystem", () => {
  it("pickUpgrades returns exactly k items when pool >= k", () => {
    const picked = pickUpgrades(3, seedRng(42));
    expect(picked).toHaveLength(3);
  });

  it("pickUpgrades returns unique items", () => {
    const picked = pickUpgrades(3, seedRng(42));
    const ids = new Set(picked.map((u) => u.id));
    expect(ids.size).toBe(picked.length);
  });

  it("pickUpgrades clamps to pool size when k > pool length", () => {
    const picked = pickUpgrades(999, seedRng(1));
    expect(picked).toHaveLength(UPGRADE_POOL.length);
    const ids = new Set(picked.map((u) => u.id));
    expect(ids.size).toBe(UPGRADE_POOL.length);
  });

  it("pickUpgrades is deterministic with same rng seed", () => {
    const a = pickUpgrades(3, seedRng(123)).map((u) => u.id);
    const b = pickUpgrades(3, seedRng(123)).map((u) => u.id);
    expect(a).toEqual(b);
  });

  it("fire_rate_1 reduces pistolFireRateMs by 15%", () => {
    const stats = createDefaultStats();
    const before = stats.pistolFireRateMs;
    const u = UPGRADE_POOL.find((x) => x.id === "fire_rate_1")!;
    u.apply(stats);
    expect(stats.pistolFireRateMs).toBe(Math.round(before * 0.85));
  });

  it("damage_1 increases pistolDamage by 25%", () => {
    const stats = createDefaultStats();
    const before = stats.pistolDamage;
    const u = UPGRADE_POOL.find((x) => x.id === "damage_1")!;
    u.apply(stats);
    expect(stats.pistolDamage).toBe(Math.round(before * 1.25));
  });

  it("max_hp_1 adds flat 25 HP", () => {
    const stats = createDefaultStats();
    const before = stats.maxHp;
    const u = UPGRADE_POOL.find((x) => x.id === "max_hp_1")!;
    u.apply(stats);
    expect(stats.maxHp).toBe(before + 25);
  });

  it("rampage trade-off increases damage and reduces maxHp", () => {
    const stats = createDefaultStats();
    const beforeDmg = stats.pistolDamage;
    const beforeHp = stats.maxHp;
    const u = UPGRADE_POOL.find((x) => x.id === "rampage")!;
    u.apply(stats);
    expect(stats.pistolDamage).toBeGreaterThan(beforeDmg);
    expect(stats.maxHp).toBeLessThan(beforeHp);
  });

  it("applying every upgrade in sequence never produces NaN or non-finite stats", () => {
    const stats = createDefaultStats();
    for (const u of UPGRADE_POOL as readonly Upgrade[]) {
      u.apply(stats);
    }
    for (const v of Object.values(stats)) {
      expect(Number.isFinite(v)).toBe(true);
    }
  });
});
