export interface HeatState {
  current: number;
  max: number;
  decayPerSec: number;
  perShot: number;
  penaltyThreshold: number;
  penaltyMult: number;
}

export function createDefaultHeat(): HeatState {
  return {
    current: 0,
    max: 100,
    decayPerSec: 18,
    perShot: 4.5,
    penaltyThreshold: 70,
    penaltyMult: 1.7,
  };
}

export function tickHeat(h: HeatState, dtSec: number): void {
  if (dtSec <= 0) return;
  h.current = Math.max(0, h.current - h.decayPerSec * dtSec);
}

export function registerShot(h: HeatState): void {
  h.current = Math.min(h.max, h.current + h.perShot);
}

export function fireRateMultiplier(h: HeatState): number {
  if (h.current < h.penaltyThreshold) return 1;
  const over = (h.current - h.penaltyThreshold) / (h.max - h.penaltyThreshold || 1);
  return 1 + (h.penaltyMult - 1) * Math.min(1, Math.max(0, over));
}

export function heatRatio(h: HeatState): number {
  if (h.max <= 0) return 0;
  return Math.max(0, Math.min(1, h.current / h.max));
}

export function isOverheated(h: HeatState): boolean {
  return h.current >= h.penaltyThreshold;
}
