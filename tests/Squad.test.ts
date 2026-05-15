import { describe, expect, it } from "vitest";
import {
  applyDamageDelta,
  applyDamageMult,
  applyTroopDelta,
  applyTroopMult,
  createSquad,
  damagePerVolley,
  isDefeated,
} from "@/systems/Squad";

describe("Squad", () => {
  it("createSquad initializes correctly", () => {
    const s = createSquad(8, 300, 600);
    expect(s.troops).toBe(8);
    expect(s.damageTier).toBe(1);
    expect(s.fireRateMs).toBe(300);
  });

  it("applyTroopDelta clamps at 0", () => {
    const s = createSquad(3, 300, 600);
    applyTroopDelta(s, -10);
    expect(s.troops).toBe(0);
  });

  it("applyTroopMult floors", () => {
    const s = createSquad(7, 300, 600);
    applyTroopMult(s, 2.5);
    expect(s.troops).toBe(17);
  });

  it("damageTier never drops below 1", () => {
    const s = createSquad(5, 300, 600);
    applyDamageDelta(s, -10);
    expect(s.damageTier).toBe(1);
  });

  it("applyDamageMult multiplies and floors", () => {
    const s = createSquad(5, 300, 600);
    applyDamageDelta(s, 2);
    applyDamageMult(s, 2);
    expect(s.damageTier).toBe(6);
  });

  it("isDefeated triggers at 0 troops", () => {
    const s = createSquad(2, 300, 600);
    expect(isDefeated(s)).toBe(false);
    applyTroopDelta(s, -5);
    expect(isDefeated(s)).toBe(true);
  });

  it("damagePerVolley scales with troops and tier", () => {
    const s = createSquad(10, 300, 600);
    applyDamageDelta(s, 2);
    expect(damagePerVolley(s, 1)).toBe(10 * 1 * 3);
  });
});
