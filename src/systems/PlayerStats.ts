import { GAME_CONFIG } from "@/config/game";

export interface PlayerStats {
  moveSpeed: number;
  maxHp: number;
  pickupRadius: number;
  pistolDamage: number;
  pistolFireRateMs: number;
  pistolRange: number;
  bulletSpeed: number;
}

export function createDefaultStats(): PlayerStats {
  return {
    moveSpeed: GAME_CONFIG.player.moveSpeed,
    maxHp: GAME_CONFIG.player.maxHp,
    pickupRadius: GAME_CONFIG.player.pickupRadius,
    pistolDamage: GAME_CONFIG.weapon.pistolDamage,
    pistolFireRateMs: GAME_CONFIG.weapon.pistolFireRateMs,
    pistolRange: GAME_CONFIG.weapon.pistolRange,
    bulletSpeed: GAME_CONFIG.weapon.bulletSpeed,
  };
}

export function xpToNextLevel(level: number): number {
  return Math.round(8 * Math.pow(Math.max(1, level), 1.5));
}
