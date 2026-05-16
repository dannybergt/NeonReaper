export type WeaponId = "rifle" | "shotgun" | "machinegun" | "rocket";

export interface WeaponSpec {
  id: WeaponId;
  label: string;
  shortLabel: string;
  fireRateMs: number;
  bulletsPerShot: number;
  /** Total spread fan in radians; bullets spread evenly across this range, centered on -y. */
  spreadRad: number;
  damagePerBullet: number;
  bulletSpeed: number;
  /** Cosmetic colour for HUD chips / muzzle tinting (RGB hex). */
  tint: number;
}

export const WEAPON_SPECS: Readonly<Record<WeaponId, WeaponSpec>> = {
  rifle: {
    id: "rifle",
    label: "RIFLE",
    shortLabel: "RIF",
    fireRateMs: 320,
    bulletsPerShot: 1,
    spreadRad: 0,
    damagePerBullet: 1,
    bulletSpeed: 760,
    tint: 0xffd24a,
  },
  shotgun: {
    id: "shotgun",
    label: "SHOTGUN",
    shortLabel: "SHT",
    fireRateMs: 720,
    bulletsPerShot: 5,
    spreadRad: 0.9, // ~52°
    damagePerBullet: 1,
    bulletSpeed: 640,
    tint: 0xff9020,
  },
  machinegun: {
    id: "machinegun",
    label: "MACHINEGUN",
    shortLabel: "MG",
    fireRateMs: 110,
    bulletsPerShot: 1,
    spreadRad: 0.12,
    damagePerBullet: 1,
    bulletSpeed: 880,
    tint: 0x80c8ff,
  },
  rocket: {
    id: "rocket",
    label: "ROCKET",
    shortLabel: "RKT",
    fireRateMs: 1400,
    bulletsPerShot: 1,
    spreadRad: 0,
    damagePerBullet: 6,
    bulletSpeed: 540,
    tint: 0xff5050,
  },
};

export interface WeaponState {
  spec: WeaponSpec;
  nextShotAtMs: number;
}

export function createWeaponState(id: WeaponId, nowMs: number): WeaponState {
  return { spec: WEAPON_SPECS[id], nextShotAtMs: nowMs };
}

export interface BulletPlan {
  /** Angle in radians; -PI/2 = straight up. */
  angle: number;
  speed: number;
  damage: number;
  tint: number;
}

/**
 * Returns the bullet plan for a single shot of this weapon.
 * Bullets are centered around -y (straight up).
 */
export function planShot(spec: WeaponSpec): BulletPlan[] {
  const base = -Math.PI / 2;
  const plans: BulletPlan[] = [];
  const n = spec.bulletsPerShot;
  for (let i = 0; i < n; i++) {
    const offset = n === 1 ? 0 : (i / (n - 1) - 0.5) * spec.spreadRad;
    plans.push({
      angle: base + offset,
      speed: spec.bulletSpeed,
      damage: spec.damagePerBullet,
      tint: spec.tint,
    });
  }
  return plans;
}

/** Decide if a weapon is ready to fire, and advance its cooldown if it fires. */
export function tryFire(weapon: WeaponState, nowMs: number): boolean {
  if (nowMs < weapon.nextShotAtMs) return false;
  weapon.nextShotAtMs = nowMs + weapon.spec.fireRateMs;
  return true;
}
