export const BOSS_CONFIG = {
  spawnAtSec: 300,
  hp: 2500,
  speed: 36,
  damage: 35,
  xpReward: 50,
  scoreReward: 500,
  attackIntervalMs: 2000,
  bulletCount: 8,
  bulletSpeed: 220,
  bulletDamage: 10,
  bulletLifetimeMs: 4500,
  textureKey: "tex_boss",
  bodyRadius: 36,
  rotationPerShot: Math.PI / 16,
  spawnExtraSpawnRateBoost: 0.75,
} as const;

export function shouldSpawnBoss(elapsedSec: number, alreadySpawned: boolean): boolean {
  return !alreadySpawned && elapsedSec >= BOSS_CONFIG.spawnAtSec;
}

export function bulletPatternAngles(count: number, baseAngle = 0): number[] {
  if (count <= 0) return [];
  const step = (Math.PI * 2) / count;
  return Array.from({ length: count }, (_, i) => baseAngle + i * step);
}
