import { describe, expect, it } from "vitest";
import { createSquad } from "@/systems/Squad";
import { createEnemyGroup } from "@/systems/EnemyGroup";
import { resolveCombatTick } from "@/systems/Combat";

describe("Combat.resolveCombatTick", () => {
  it("both sides lose troops simultaneously", () => {
    const s = createSquad(10, 300, 600);
    const e = createEnemyGroup({ tier: "grunt", troops: 10, laneX: 0 }, 0);
    const res = resolveCombatTick(s, e, 0.5);
    expect(res.squadLost).toBeGreaterThan(0);
    expect(res.enemyLost).toBeGreaterThan(0);
    expect(s.troops).toBeLessThan(10);
    expect(e.troops).toBeLessThan(10);
  });

  it("squad wipes weaker grunt over many ticks", () => {
    const s = createSquad(20, 300, 600);
    const e = createEnemyGroup({ tier: "grunt", troops: 5, laneX: 0 }, 0);
    for (let i = 0; i < 50 && e.troops > 0 && s.troops > 0; i++) {
      resolveCombatTick(s, e, 0.5);
    }
    expect(e.troops).toBe(0);
    expect(s.troops).toBeGreaterThan(0);
  });

  it("heavy enemy decimates equal squad", () => {
    const s = createSquad(10, 300, 600);
    const e = createEnemyGroup({ tier: "heavy", troops: 10, laneX: 0 }, 0);
    for (let i = 0; i < 50 && e.troops > 0 && s.troops > 0; i++) {
      resolveCombatTick(s, e, 0.4);
    }
    // Heavy has higher dmgPerTroop than squad's default — squad should fall first or be very low
    expect(s.troops).toBeLessThan(e.troops);
  });

  it("returns zero deltas when either side is already empty", () => {
    const s = createSquad(0, 300, 600);
    const e = createEnemyGroup({ tier: "grunt", troops: 10, laneX: 0 }, 0);
    const res = resolveCombatTick(s, e, 0.5);
    expect(res.squadLost).toBe(0);
    expect(res.enemyLost).toBe(0);
  });

  it("damageTier boosts squad output", () => {
    const sLow = createSquad(10, 300, 600);
    const eLow = createEnemyGroup({ tier: "grunt", troops: 50, laneX: 0 }, 0);
    const sHigh = createSquad(10, 300, 600);
    sHigh.damageTier = 5;
    const eHigh = createEnemyGroup({ tier: "grunt", troops: 50, laneX: 0 }, 0);
    resolveCombatTick(sLow, eLow, 0.5);
    resolveCombatTick(sHigh, eHigh, 0.5);
    expect(50 - eHigh.troops).toBeGreaterThan(50 - eLow.troops);
  });
});
