export const GAME_CONFIG = {
  width: 1280,
  height: 720,
  bgColor: "#1a1c20",
  palette: {
    bg: 0x1a1c20,
    asphalt: 0x24272c,
    asphaltLight: 0x3a3d42,
    laneMark: 0xe8c948,
    rubble: 0x4a4d52,

    playerBody: 0x7a8a4e,
    playerBodyDark: 0x4d5a30,
    playerHelm: 0x2a2f1e,
    playerSkin: 0xdcb480,
    playerWeapon: 0x222428,
    playerWeaponMetal: 0x70747a,

    walker: 0x4a3a2a,
    walkerDark: 0x2e2418,
    walkerSkin: 0x7a8260,
    walkerBlood: 0x6a1818,

    runner: 0x903a1a,
    runnerDark: 0x501a0a,
    runnerSkin: 0xa07050,

    brute: 0x32363c,
    bruteDark: 0x1a1c20,
    brutePlate: 0x5a5e64,
    bruteEye: 0xff2828,

    boss: 0x4a1428,
    bossCore: 0xff2828,
    bossHighlight: 0xff8050,

    cursedAura: 0x6cff5a,
    cursedAuraDark: 0x2a8030,

    bullet: 0xffd24a,
    bulletGlow: 0xff8c2b,
    bulletTrail: 0xffeac8,
    muzzleFlash: 0xffd870,

    enemyBullet: 0xff3a3a,
    enemyBulletGlow: 0xff8050,

    gem: 0x60c8ff,
    gemBright: 0xc8e8ff,
    gemDark: 0x205080,

    hitSpark: 0xfff0a0,
    bloodSpark: 0xa42020,
    smoke: 0x40444a,

    text: 0xf0e8c8,
    textDim: 0x8a8a82,
    accentWarm: 0xff8c2b,
    accentDanger: 0xff2828,
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
  spawner: {
    initialIntervalMs: 1500,
    minIntervalMs: 250,
    rampDownPerSec: 6,
    offscreenBuffer: 80,
  },
  xp: {
    gemMagnetSpeed: 460,
    gemPickupRadius: 18,
    gemDespawnMs: 30_000,
  },
} as const;

export type GameConfig = typeof GAME_CONFIG;
