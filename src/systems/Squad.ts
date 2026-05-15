export interface SquadState {
  troops: number;
  damageTier: number;
  fireRateMs: number;
  bulletSpeed: number;
}

export function createSquad(initialTroops: number, fireRateMs: number, bulletSpeed: number): SquadState {
  return {
    troops: initialTroops,
    damageTier: 1,
    fireRateMs,
    bulletSpeed,
  };
}

export function applyTroopDelta(squad: SquadState, delta: number): void {
  squad.troops = Math.max(0, Math.floor(squad.troops + delta));
}

export function applyTroopMult(squad: SquadState, factor: number): void {
  squad.troops = Math.max(0, Math.floor(squad.troops * factor));
}

export function applyDamageDelta(squad: SquadState, delta: number): void {
  squad.damageTier = Math.max(1, squad.damageTier + delta);
}

export function applyDamageMult(squad: SquadState, factor: number): void {
  squad.damageTier = Math.max(1, Math.floor(squad.damageTier * factor));
}

export function isDefeated(squad: SquadState): boolean {
  return squad.troops <= 0;
}

export function damagePerVolley(squad: SquadState, bulletDamage: number): number {
  return squad.troops * bulletDamage * squad.damageTier;
}
