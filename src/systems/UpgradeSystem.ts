import type { PlayerStats } from "@/systems/PlayerStats";

export type Rarity = "common" | "rare" | "epic";

export interface Upgrade {
  id: string;
  title: string;
  description: string;
  rarity: Rarity;
  apply: (stats: PlayerStats) => void;
}

export const UPGRADE_POOL: readonly Upgrade[] = [
  {
    id: "fire_rate_1",
    title: "Trigger Discipline",
    description: "-15% Pistol cooldown",
    rarity: "common",
    apply: (s) => {
      s.pistolFireRateMs = Math.max(60, Math.round(s.pistolFireRateMs * 0.85));
    },
  },
  {
    id: "damage_1",
    title: "Hollow Points",
    description: "+25% Pistol damage",
    rarity: "common",
    apply: (s) => {
      s.pistolDamage = Math.round(s.pistolDamage * 1.25);
    },
  },
  {
    id: "range_1",
    title: "Long Barrel",
    description: "+20% Pistol range",
    rarity: "common",
    apply: (s) => {
      s.pistolRange = Math.round(s.pistolRange * 1.2);
    },
  },
  {
    id: "bullet_speed_1",
    title: "Mag Boost",
    description: "+25% Bullet speed",
    rarity: "common",
    apply: (s) => {
      s.bulletSpeed = Math.round(s.bulletSpeed * 1.25);
    },
  },
  {
    id: "move_speed_1",
    title: "Light Boots",
    description: "+15% Move speed",
    rarity: "common",
    apply: (s) => {
      s.moveSpeed = Math.round(s.moveSpeed * 1.15);
    },
  },
  {
    id: "max_hp_1",
    title: "Trauma Plate",
    description: "+25 Max HP",
    rarity: "common",
    apply: (s) => {
      s.maxHp += 25;
    },
  },
  {
    id: "pickup_radius_1",
    title: "Mag-Lock",
    description: "+50% XP pickup radius",
    rarity: "rare",
    apply: (s) => {
      s.pickupRadius = Math.round(s.pickupRadius * 1.5);
    },
  },
  {
    id: "rampage",
    title: "Rampage",
    description: "+50% damage, -10% Max HP",
    rarity: "epic",
    apply: (s) => {
      s.pistolDamage = Math.round(s.pistolDamage * 1.5);
      s.maxHp = Math.max(20, Math.round(s.maxHp * 0.9));
    },
  },
] as const;

export type Rng = () => number;

export function pickUpgrades(count: number, rng: Rng = Math.random, pool: readonly Upgrade[] = UPGRADE_POOL): Upgrade[] {
  const n = Math.min(count, pool.length);
  const indices = pool.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j]!, indices[i]!];
  }
  return indices.slice(0, n).map((i) => pool[i]!);
}
