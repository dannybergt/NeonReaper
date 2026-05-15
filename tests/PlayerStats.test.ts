import { describe, expect, it } from "vitest";
import { xpToNextLevel, createDefaultStats } from "@/systems/PlayerStats";

describe("PlayerStats", () => {
  it("xpToNextLevel is monotonically increasing", () => {
    let prev = -1;
    for (let lvl = 1; lvl <= 20; lvl++) {
      const xp = xpToNextLevel(lvl);
      expect(xp).toBeGreaterThan(prev);
      prev = xp;
    }
  });

  it("xpToNextLevel(1) is 8", () => {
    expect(xpToNextLevel(1)).toBe(8);
  });

  it("xpToNextLevel(0) is clamped to level 1", () => {
    expect(xpToNextLevel(0)).toBe(xpToNextLevel(1));
  });

  it("createDefaultStats returns a fresh independent object each call", () => {
    const a = createDefaultStats();
    const b = createDefaultStats();
    a.moveSpeed = 9999;
    expect(b.moveSpeed).not.toBe(9999);
  });
});
