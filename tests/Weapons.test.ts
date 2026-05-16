import { describe, expect, it } from "vitest";
import { createWeaponState, planShot, tryFire, WEAPON_SPECS } from "@/systems/Weapons";

describe("Weapons", () => {
  it("createWeaponState is ready immediately at nowMs", () => {
    const w = createWeaponState("rifle", 1000);
    expect(tryFire(w, 1000)).toBe(true);
    // Second immediate fire is rejected
    expect(tryFire(w, 1001)).toBe(false);
  });

  it("tryFire respects fireRateMs cooldown", () => {
    const w = createWeaponState("rifle", 0);
    tryFire(w, 0);
    expect(tryFire(w, WEAPON_SPECS.rifle.fireRateMs - 1)).toBe(false);
    expect(tryFire(w, WEAPON_SPECS.rifle.fireRateMs)).toBe(true);
  });

  it("planShot rifle is single straight-up bullet", () => {
    const shots = planShot(WEAPON_SPECS.rifle);
    expect(shots).toHaveLength(1);
    expect(shots[0]!.angle).toBeCloseTo(-Math.PI / 2, 5);
  });

  it("planShot shotgun produces fan around -y", () => {
    const shots = planShot(WEAPON_SPECS.shotgun);
    expect(shots).toHaveLength(WEAPON_SPECS.shotgun.bulletsPerShot);
    const angles = shots.map((s) => s.angle);
    const min = Math.min(...angles);
    const max = Math.max(...angles);
    expect(max - min).toBeCloseTo(WEAPON_SPECS.shotgun.spreadRad, 5);
    expect((max + min) / 2).toBeCloseTo(-Math.PI / 2, 5);
  });

  it("planShot uses weapon damage and speed", () => {
    const shots = planShot(WEAPON_SPECS.rocket);
    expect(shots[0]!.damage).toBe(WEAPON_SPECS.rocket.damagePerBullet);
    expect(shots[0]!.speed).toBe(WEAPON_SPECS.rocket.bulletSpeed);
  });

  it("each weapon spec has reasonable values", () => {
    for (const id of Object.keys(WEAPON_SPECS) as (keyof typeof WEAPON_SPECS)[]) {
      const s = WEAPON_SPECS[id];
      expect(s.fireRateMs).toBeGreaterThan(0);
      expect(s.bulletsPerShot).toBeGreaterThan(0);
      expect(s.bulletSpeed).toBeGreaterThan(0);
      expect(s.damagePerBullet).toBeGreaterThan(0);
    }
  });
});
