import type { SquadState } from "@/systems/Squad";
import type { EnemyGroupRuntime } from "@/systems/EnemyGroup";
import { ENEMY_TIER_STATS } from "@/systems/EnemyGroup";

export interface CombatResult {
  squadLost: number;
  enemyLost: number;
}

/**
 * One combat tick between squad and a single enemy group.
 * Both sides deal damage simultaneously, proportional to their troop count.
 */
export function resolveCombatTick(
  squad: SquadState,
  enemy: EnemyGroupRuntime,
  dmgPerTroopPerTick: number,
): CombatResult {
  if (squad.troops <= 0 || enemy.troops <= 0) return { squadLost: 0, enemyLost: 0 };

  const enemyDpsPerTroop = ENEMY_TIER_STATS[enemy.spec.tier].dmgPerTroop;
  const squadIncoming = Math.min(squad.troops, enemy.troops * enemyDpsPerTroop * dmgPerTroopPerTick);
  const enemyIncoming = Math.min(enemy.troops, squad.troops * dmgPerTroopPerTick * squad.damageTier);

  squad.troops = Math.max(0, squad.troops - squadIncoming);
  enemy.troops = Math.max(0, enemy.troops - enemyIncoming);
  if (enemy.troops <= 0) enemy.alive = false;

  return {
    squadLost: squadIncoming,
    enemyLost: enemyIncoming,
  };
}
