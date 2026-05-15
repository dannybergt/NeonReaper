import { describe, expect, it } from "vitest";
import { BOSS_CONFIG, bulletPatternAngles, shouldSpawnBoss } from "@/systems/BossSystem";

describe("BossSystem", () => {
  it("shouldSpawnBoss false before spawnAtSec", () => {
    expect(shouldSpawnBoss(0, false)).toBe(false);
    expect(shouldSpawnBoss(BOSS_CONFIG.spawnAtSec - 1, false)).toBe(false);
  });

  it("shouldSpawnBoss true exactly at spawnAtSec", () => {
    expect(shouldSpawnBoss(BOSS_CONFIG.spawnAtSec, false)).toBe(true);
  });

  it("shouldSpawnBoss false if already spawned", () => {
    expect(shouldSpawnBoss(BOSS_CONFIG.spawnAtSec, true)).toBe(false);
    expect(shouldSpawnBoss(99_999, true)).toBe(false);
  });

  it("bulletPatternAngles produces exactly count entries", () => {
    expect(bulletPatternAngles(8)).toHaveLength(8);
    expect(bulletPatternAngles(1)).toHaveLength(1);
    expect(bulletPatternAngles(0)).toHaveLength(0);
  });

  it("bulletPatternAngles distributes evenly", () => {
    const angles = bulletPatternAngles(4);
    expect(angles[0]).toBeCloseTo(0, 5);
    expect(angles[1]).toBeCloseTo(Math.PI / 2, 5);
    expect(angles[2]).toBeCloseTo(Math.PI, 5);
    expect(angles[3]).toBeCloseTo((3 * Math.PI) / 2, 5);
  });

  it("bulletPatternAngles applies baseAngle offset", () => {
    const offset = Math.PI / 8;
    const a = bulletPatternAngles(4, offset);
    expect(a[0]).toBeCloseTo(offset, 5);
    expect(a[1]).toBeCloseTo(offset + Math.PI / 2, 5);
  });

  it("BOSS_CONFIG: hp and damage are non-trivial", () => {
    expect(BOSS_CONFIG.hp).toBeGreaterThan(1000);
    expect(BOSS_CONFIG.damage).toBeGreaterThan(20);
    expect(BOSS_CONFIG.bulletCount).toBeGreaterThan(0);
  });
});
