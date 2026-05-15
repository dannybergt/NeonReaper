import type { WeaponId } from "@/systems/Weapons";

export interface WeaponCrateSpec {
  drop: WeaponId;
  hp: number;
  laneX: number;
}

export interface WeaponCrateRuntime {
  spec: WeaponCrateSpec;
  hp: number;
  maxHp: number;
  worldY: number;
  consumed: boolean;
}

export function createWeaponCrate(spec: WeaponCrateSpec, spawnWorldY: number): WeaponCrateRuntime {
  return {
    spec,
    hp: spec.hp,
    maxHp: spec.hp,
    worldY: spawnWorldY,
    consumed: false,
  };
}

export function damageCrate(crate: WeaponCrateRuntime, amount: number): boolean {
  if (crate.consumed) return false;
  crate.hp = Math.max(0, crate.hp - amount);
  if (crate.hp <= 0) {
    crate.consumed = true;
    return true;
  }
  return false;
}
