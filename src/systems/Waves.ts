import type { GateSpec } from "@/systems/Gates";
import type { EnemyGroupSpec } from "@/systems/EnemyGroup";
import type { WeaponCrateSpec } from "@/systems/WeaponCrate";

export type WaveEventKind = "gatePair" | "enemyGroup" | "weaponCrate" | "boss";

export interface WaveEvent {
  distance: number;
  kind: WaveEventKind;
  gates?: [GateSpec, GateSpec];
  enemy?: EnemyGroupSpec;
  crate?: WeaponCrateSpec;
  bossHp?: number;
}

export interface Wave {
  id: number;
  events: WaveEvent[];
  totalDistance: number;
}

export function buildWave1(): Wave {
  const events: WaveEvent[] = [
    { distance: 500, kind: "gatePair", gates: [
      { kind: "addTroops", amount: 8 },
      { kind: "trapTroops", amount: 3 },
    ] },
    { distance: 950, kind: "enemyGroup", enemy: { tier: "grunt", troops: 22, laneX: 0 } },
    { distance: 1450, kind: "weaponCrate", crate: { drop: "shotgun", hp: 24, laneX: 0 } },
    { distance: 1900, kind: "gatePair", gates: [
      { kind: "multTroops", amount: 2 },
      { kind: "addTroops", amount: 10 },
    ] },
    { distance: 2350, kind: "enemyGroup", enemy: { tier: "grunt", troops: 30, laneX: -80 } },
    { distance: 2400, kind: "enemyGroup", enemy: { tier: "shocktrooper", troops: 14, laneX: 80 } },
    { distance: 2900, kind: "gatePair", gates: [
      { kind: "addDamage", amount: 1 },
      { kind: "trapTroops", amount: 6 },
    ] },
    { distance: 3300, kind: "weaponCrate", crate: { drop: "machinegun", hp: 36, laneX: 0 } },
    { distance: 3800, kind: "enemyGroup", enemy: { tier: "heavy", troops: 24, laneX: 0 } },
    { distance: 4250, kind: "gatePair", gates: [
      { kind: "multDamage", amount: 2 },
      { kind: "addTroops", amount: 14 },
    ] },
    { distance: 4700, kind: "enemyGroup", enemy: { tier: "shocktrooper", troops: 20, laneX: -80 } },
    { distance: 4760, kind: "enemyGroup", enemy: { tier: "heavy", troops: 16, laneX: 80 } },
    { distance: 5400, kind: "boss", bossHp: 320 },
  ];
  return {
    id: 1,
    events,
    totalDistance: 5800,
  };
}
