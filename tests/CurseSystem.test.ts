import { describe, expect, it } from "vitest";
import {
  addCurse,
  createCurseState,
  CURSE_POOL,
  effectiveMult,
  pickCurse,
  remainingSec,
  tickCurses,
  type CurseDef,
} from "@/systems/CurseSystem";

function seedRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x1_0000_0000;
  };
}

const TEST_POOL: readonly CurseDef[] = [
  { id: "a", label: "A", durationMs: 1000, mults: { pistolFireRateMs: 1.5 } },
  { id: "b", label: "B", durationMs: 1000, mults: { pistolRange: 0.5 } },
];

describe("CurseSystem", () => {
  it("empty state has no multipliers", () => {
    const s = createCurseState();
    expect(effectiveMult(s, "pistolFireRateMs")).toBe(1);
    expect(effectiveMult(s, "pistolRange")).toBe(1);
    expect(effectiveMult(s, "incomingDamage")).toBe(1);
  });

  it("addCurse stores curse with future expire", () => {
    const s = createCurseState();
    addCurse(s, TEST_POOL[0]!, 1000);
    expect(s.active).toHaveLength(1);
    expect(s.active[0]!.expireAtMs).toBe(2000);
  });

  it("tickCurses removes expired entries", () => {
    const s = createCurseState();
    addCurse(s, TEST_POOL[0]!, 1000);
    tickCurses(s, 1500);
    expect(s.active).toHaveLength(1);
    tickCurses(s, 2001);
    expect(s.active).toHaveLength(0);
  });

  it("stacks of same curse multiply", () => {
    const s = createCurseState();
    addCurse(s, TEST_POOL[0]!, 0);
    addCurse(s, TEST_POOL[0]!, 0);
    expect(effectiveMult(s, "pistolFireRateMs")).toBeCloseTo(1.5 * 1.5, 5);
  });

  it("different curses combine multiplicatively", () => {
    const s = createCurseState();
    addCurse(s, TEST_POOL[0]!, 0);
    addCurse(s, TEST_POOL[1]!, 0);
    expect(effectiveMult(s, "pistolFireRateMs")).toBeCloseTo(1.5, 5);
    expect(effectiveMult(s, "pistolRange")).toBeCloseTo(0.5, 5);
  });

  it("pickCurse is deterministic with seeded rng", () => {
    const a = pickCurse(seedRng(42), TEST_POOL);
    const b = pickCurse(seedRng(42), TEST_POOL);
    expect(a.id).toBe(b.id);
  });

  it("remainingSec reflects future expire", () => {
    const c = { def: TEST_POOL[0]!, expireAtMs: 5000 };
    expect(remainingSec(c, 4000)).toBeCloseTo(1, 5);
    expect(remainingSec(c, 6000)).toBe(0);
  });

  it("default pool curses cover all 3 stat keys", () => {
    const seen = new Set<string>();
    for (const c of CURSE_POOL) {
      for (const k of Object.keys(c.mults)) seen.add(k);
    }
    expect(seen).toContain("pistolFireRateMs");
    expect(seen).toContain("pistolRange");
    expect(seen).toContain("incomingDamage");
  });
});
