export type CurseStatKey = "pistolFireRateMs" | "pistolRange" | "incomingDamage";

export interface CurseDef {
  id: string;
  label: string;
  durationMs: number;
  mults: Partial<Record<CurseStatKey, number>>;
}

export interface ActiveCurse {
  def: CurseDef;
  expireAtMs: number;
}

export interface CurseState {
  active: ActiveCurse[];
}

export const CURSE_POOL: readonly CurseDef[] = [
  {
    id: "heavy_hand",
    label: "Heavy Hand",
    durationMs: 25_000,
    mults: { pistolFireRateMs: 1.3 },
  },
  {
    id: "brittle_bones",
    label: "Brittle Bones",
    durationMs: 25_000,
    mults: { incomingDamage: 1.25 },
  },
  {
    id: "foggy_aim",
    label: "Foggy Aim",
    durationMs: 25_000,
    mults: { pistolRange: 0.7 },
  },
] as const;

export type Rng = () => number;

export function createCurseState(): CurseState {
  return { active: [] };
}

export function pickCurse(rng: Rng = Math.random, pool: readonly CurseDef[] = CURSE_POOL): CurseDef {
  const idx = Math.floor(rng() * pool.length) % pool.length;
  return pool[idx]!;
}

export function addCurse(state: CurseState, def: CurseDef, nowMs: number): void {
  state.active.push({ def, expireAtMs: nowMs + def.durationMs });
}

export function tickCurses(state: CurseState, nowMs: number): void {
  if (state.active.length === 0) return;
  state.active = state.active.filter((c) => c.expireAtMs > nowMs);
}

export function effectiveMult(state: CurseState, key: CurseStatKey): number {
  let m = 1;
  for (const c of state.active) {
    const v = c.def.mults[key];
    if (typeof v === "number") m *= v;
  }
  return m;
}

export function remainingSec(curse: ActiveCurse, nowMs: number): number {
  return Math.max(0, (curse.expireAtMs - nowMs) / 1000);
}
