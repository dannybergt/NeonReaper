export type EnemyTypeId = "walker" | "runner" | "brute";

export interface EnemyStats {
  id: EnemyTypeId;
  textureKey: string;
  hp: number;
  speed: number;
  damage: number;
  xpReward: number;
  scoreReward: number;
  bodyRadius: number;
}

export const ENEMY_TYPES: Readonly<Record<EnemyTypeId, EnemyStats>> = {
  walker: {
    id: "walker",
    textureKey: "tex_enemy_walker",
    hp: 24,
    speed: 70,
    damage: 8,
    xpReward: 1,
    scoreReward: 10,
    bodyRadius: 12,
  },
  runner: {
    id: "runner",
    textureKey: "tex_enemy_runner",
    hp: 12,
    speed: 140,
    damage: 6,
    xpReward: 1,
    scoreReward: 15,
    bodyRadius: 9,
  },
  brute: {
    id: "brute",
    textureKey: "tex_enemy_brute",
    hp: 110,
    speed: 42,
    damage: 22,
    xpReward: 3,
    scoreReward: 40,
    bodyRadius: 18,
  },
} as const;

export type Rng = () => number;

export const CURSE_ELITE = {
  unlockSec: 180,
  baseChance: 0.0,
  maxChance: 0.18,
  rampSec: 240,
  hpMult: 1.5,
  damageMult: 1.5,
  xpMult: 3,
  scoreMult: 4,
} as const;

export function curseEliteChance(elapsedSec: number): number {
  if (elapsedSec < CURSE_ELITE.unlockSec) return 0;
  const t = Math.min(1, (elapsedSec - CURSE_ELITE.unlockSec) / CURSE_ELITE.rampSec);
  return CURSE_ELITE.baseChance + (CURSE_ELITE.maxChance - CURSE_ELITE.baseChance) * t;
}

export function rollCursedElite(elapsedSec: number, rng: Rng = Math.random): boolean {
  return rng() < curseEliteChance(elapsedSec);
}

interface Weight {
  id: EnemyTypeId;
  weight: number;
}

export function spawnWeights(elapsedSec: number): Weight[] {
  const walker = 1;
  const runner = elapsedSec < 30 ? 0 : Math.min(1.0, (elapsedSec - 30) / 60);
  const brute = elapsedSec < 90 ? 0 : Math.min(0.6, (elapsedSec - 90) / 120);
  return [
    { id: "walker", weight: walker },
    { id: "runner", weight: runner },
    { id: "brute", weight: brute },
  ];
}

export function pickEnemyType(elapsedSec: number, rng: Rng = Math.random): EnemyTypeId {
  const weights = spawnWeights(elapsedSec);
  const total = weights.reduce((sum, w) => sum + w.weight, 0);
  if (total <= 0) return "walker";
  let roll = rng() * total;
  for (const w of weights) {
    if (roll < w.weight) return w.id;
    roll -= w.weight;
  }
  return weights[weights.length - 1]!.id;
}
