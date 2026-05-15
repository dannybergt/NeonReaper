import { describe, expect, it } from "vitest";
import { createWeaponCrate, damageCrate } from "@/systems/WeaponCrate";
import { addWeapon, createSquad } from "@/systems/Squad";

describe("WeaponCrate", () => {
  it("starts with full hp and is not consumed", () => {
    const c = createWeaponCrate({ drop: "shotgun", hp: 30, laneX: 0 }, 0);
    expect(c.hp).toBe(30);
    expect(c.maxHp).toBe(30);
    expect(c.consumed).toBe(false);
  });

  it("damageCrate returns false until last hit", () => {
    const c = createWeaponCrate({ drop: "shotgun", hp: 5, laneX: 0 }, 0);
    expect(damageCrate(c, 2)).toBe(false);
    expect(c.hp).toBe(3);
    expect(damageCrate(c, 2)).toBe(false);
    expect(c.hp).toBe(1);
    expect(damageCrate(c, 5)).toBe(true);
    expect(c.consumed).toBe(true);
    expect(c.hp).toBe(0);
  });

  it("damageCrate is idempotent after consumption", () => {
    const c = createWeaponCrate({ drop: "shotgun", hp: 1, laneX: 0 }, 0);
    expect(damageCrate(c, 5)).toBe(true);
    expect(damageCrate(c, 5)).toBe(false); // already consumed
  });

  it("squad addWeapon prevents duplicates", () => {
    const s = createSquad(8, 300, 600);
    expect(addWeapon(s, "shotgun", 100)).toBe(true);
    expect(addWeapon(s, "shotgun", 200)).toBe(false);
    expect(s.weapons).toHaveLength(2);
  });

  it("squad addWeapon stacks distinct weapons", () => {
    const s = createSquad(8, 300, 600);
    addWeapon(s, "shotgun", 100);
    addWeapon(s, "machinegun", 200);
    expect(s.weapons).toHaveLength(3);
    expect(s.weapons.map((w) => w.spec.id).sort()).toEqual(["machinegun", "rifle", "shotgun"]);
  });
});
