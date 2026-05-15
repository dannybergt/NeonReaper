export type Rng = () => number;

export interface SpawnArea {
  centerX: number;
  centerY: number;
  halfWidth: number;
  halfHeight: number;
  buffer: number;
}

export interface SpawnPoint {
  x: number;
  y: number;
  side: "top" | "right" | "bottom" | "left";
}

/**
 * Pick a spawn position on a rectangle just outside the visible viewport.
 * Uniform across the 4 sides (each side equally likely), then uniform along
 * that side. This is what the survivor-genre actually expects — a circle
 * around the player makes enemies feel like they always come from the same
 * direction because viewport is wider than tall (vertical points sit further
 * outside the visible area than horizontal ones).
 */
export function pickSpawnPoint(area: SpawnArea, rng: Rng = Math.random): SpawnPoint {
  const sideRoll = rng();
  const along = rng();
  const xExtent = area.halfWidth + area.buffer;
  const yExtent = area.halfHeight + area.buffer;
  // 0..0.25 → top, 0.25..0.5 → right, 0.5..0.75 → bottom, 0.75..1 → left
  if (sideRoll < 0.25) {
    return {
      x: area.centerX - xExtent + along * 2 * xExtent,
      y: area.centerY - yExtent,
      side: "top",
    };
  }
  if (sideRoll < 0.5) {
    return {
      x: area.centerX + xExtent,
      y: area.centerY - yExtent + along * 2 * yExtent,
      side: "right",
    };
  }
  if (sideRoll < 0.75) {
    return {
      x: area.centerX - xExtent + along * 2 * xExtent,
      y: area.centerY + yExtent,
      side: "bottom",
    };
  }
  return {
    x: area.centerX - xExtent,
    y: area.centerY - yExtent + along * 2 * yExtent,
    side: "left",
  };
}
