import { describe, expect, it } from "vitest";
import { applyGate, gateVisual, rollGatePair, type GateSpec } from "@/systems/Gates";
import { createSquad, type SquadState } from "@/systems/Squad";
import { GAME_CONFIG } from "@/config/game";

function squad(initial = 10, dmg = 1): SquadState {
  const s = createSquad(initial, 300, 600);
  s.damageTier = dmg;
  return s;
}

function seedRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x1_0000_0000;
  };
}

describe("Gates.applyGate", () => {
  it("addTroops increases troops", () => {
    const s = squad(10);
    applyGate(s, { kind: "addTroops", amount: 5 });
    expect(s.troops).toBe(15);
  });

  it("multTroops multiplies", () => {
    const s = squad(10);
    applyGate(s, { kind: "multTroops", amount: 2 });
    expect(s.troops).toBe(20);
  });

  it("trapTroops always subtracts (negative or positive amount)", () => {
    const a = squad(10);
    applyGate(a, { kind: "trapTroops", amount: 3 });
    expect(a.troops).toBe(7);
    const b = squad(10);
    applyGate(b, { kind: "trapTroops", amount: -3 });
    expect(b.troops).toBe(7);
  });

  it("trapTroops clamps at 0", () => {
    const s = squad(2);
    applyGate(s, { kind: "trapTroops", amount: 100 });
    expect(s.troops).toBe(0);
  });

  it("addDamage and multDamage stack", () => {
    const s = squad(5, 1);
    applyGate(s, { kind: "addDamage", amount: 1 });
    applyGate(s, { kind: "multDamage", amount: 2 });
    expect(s.damageTier).toBe(4);
  });
});

describe("Gates.gateVisual", () => {
  it("labels reflect spec kind and amount", () => {
    expect(gateVisual({ kind: "addTroops", amount: 5 }, GAME_CONFIG.palette).label).toBe("+5");
    expect(gateVisual({ kind: "multTroops", amount: 2 }, GAME_CONFIG.palette).label).toBe("×2");
    expect(gateVisual({ kind: "trapTroops", amount: 3 }, GAME_CONFIG.palette).label).toBe("−3");
    expect(gateVisual({ kind: "addDamage", amount: 1 }, GAME_CONFIG.palette).label).toBe("+1 DMG");
    expect(gateVisual({ kind: "multDamage", amount: 2 }, GAME_CONFIG.palette).label).toBe("×2 DMG");
  });

  it("positive flag matches kind", () => {
    expect(gateVisual({ kind: "addTroops", amount: 5 }, GAME_CONFIG.palette).positive).toBe(true);
    expect(gateVisual({ kind: "trapTroops", amount: 5 }, GAME_CONFIG.palette).positive).toBe(false);
  });
});

describe("Gates.rollGatePair", () => {
  it("returns 2 specs", () => {
    const pair = rollGatePair(seedRng(1));
    expect(pair).toHaveLength(2);
  });

  it("deterministic with same seed", () => {
    const a = rollGatePair(seedRng(99));
    const b = rollGatePair(seedRng(99));
    expect(a[0]).toEqual(b[0]);
    expect(a[1]).toEqual(b[1]);
  });

  it("all kinds covered across many rolls", () => {
    const rng = seedRng(42);
    const kinds = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const [a, b] = rollGatePair(rng);
      kinds.add(a.kind);
      kinds.add(b.kind);
    }
    expect(kinds.has("addTroops")).toBe(true);
    expect(kinds.has("multTroops") || kinds.has("multDamage")).toBe(true);
    expect(kinds.has("trapTroops")).toBe(true);
  });
});

const _allKinds: GateSpec["kind"][] = ["addTroops", "multTroops", "trapTroops", "addDamage", "multDamage"];
void _allKinds;
