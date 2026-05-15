export type EnemyTier = "grunt" | "shocktrooper" | "heavy";

export interface EnemyGroupSpec {
  tier: EnemyTier;
  troops: number;
  laneX: number;
}

export interface EnemyGroupRuntime {
  spec: EnemyGroupSpec;
  troops: number;
  worldY: number;
  alive: boolean;
}

export const ENEMY_TIER_STATS: Readonly<Record<EnemyTier, { dmgPerTroop: number; color: number; spriteKey: string }>> =
  {
    grunt: { dmgPerTroop: 0.6, color: 0x6a3a2a, spriteKey: "tex_enemy_soldier" },
    shocktrooper: { dmgPerTroop: 0.9, color: 0x903a1a, spriteKey: "tex_enemy_shock" },
    heavy: { dmgPerTroop: 1.4, color: 0x32363c, spriteKey: "tex_enemy_heavy" },
  };

export function createEnemyGroup(spec: EnemyGroupSpec, spawnWorldY: number): EnemyGroupRuntime {
  return {
    spec,
    troops: spec.troops,
    worldY: spawnWorldY,
    alive: true,
  };
}

export function isEnemyGroupDefeated(g: EnemyGroupRuntime): boolean {
  return g.troops <= 0;
}
