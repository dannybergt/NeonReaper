export const GAME_CONFIG = {
  width: 1280,
  height: 720,
  bgColor: "#05050a",
  palette: {
    bg: 0x05050a,
    grid: 0x14142a,
    player: 0x00ffe1,
    playerGlow: 0x80ffff,
    enemy: 0xff2bd6,
    enemyGlow: 0xff80f0,
    bullet: 0xfff070,
    bulletGlow: 0xffffaa,
    xp: 0x80ff80,
    text: 0xe0e8ff,
    accent: 0xff2bd6,
  },
  player: {
    moveSpeed: 220,
    maxHp: 100,
    pickupRadius: 80,
  },
  weapon: {
    pistolDamage: 12,
    pistolFireRateMs: 350,
    pistolRange: 380,
    bulletSpeed: 620,
  },
  enemy: {
    walkerSpeed: 70,
    walkerHp: 24,
    walkerDamage: 8,
  },
  spawner: {
    initialIntervalMs: 1500,
    minIntervalMs: 250,
    rampDownPerSec: 6,
  },
} as const;

export type GameConfig = typeof GAME_CONFIG;
