import type { GateSpec } from "@/systems/Gates";
import type { EnemyGroupSpec } from "@/systems/EnemyGroup";

export type WaveEventKind = "gatePair" | "enemyGroup" | "boss";

export interface WaveEvent {
  /** Distance from wave start measured in scrolled world-pixels. */
  distance: number;
  kind: WaveEventKind;
  gates?: [GateSpec, GateSpec];
  enemy?: EnemyGroupSpec;
  bossHp?: number;
}

export interface Wave {
  id: number;
  events: WaveEvent[];
  totalDistance: number;
}

export function buildWave1(): Wave {
  const events: WaveEvent[] = [
    { distance: 600, kind: "gatePair", gates: [
      { kind: "addTroops", amount: 5 },
      { kind: "trapTroops", amount: 3 },
    ] },
    { distance: 1100, kind: "enemyGroup", enemy: { tier: "grunt", troops: 6, laneX: 0 } },
    { distance: 1700, kind: "gatePair", gates: [
      { kind: "multTroops", amount: 2 },
      { kind: "addTroops", amount: 8 },
    ] },
    { distance: 2300, kind: "enemyGroup", enemy: { tier: "grunt", troops: 10, laneX: -80 } },
    { distance: 2350, kind: "enemyGroup", enemy: { tier: "shocktrooper", troops: 4, laneX: 80 } },
    { distance: 2900, kind: "gatePair", gates: [
      { kind: "addDamage", amount: 1 },
      { kind: "trapTroops", amount: 5 },
    ] },
    { distance: 3500, kind: "enemyGroup", enemy: { tier: "heavy", troops: 8, laneX: 0 } },
    { distance: 4100, kind: "gatePair", gates: [
      { kind: "multDamage", amount: 2 },
      { kind: "addTroops", amount: 12 },
    ] },
    { distance: 4800, kind: "boss", bossHp: 220 },
  ];
  return {
    id: 1,
    events,
    totalDistance: 5200,
  };
}
