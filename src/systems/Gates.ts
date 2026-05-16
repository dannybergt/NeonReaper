import type { SquadState } from "@/systems/Squad";
import { applyDamageDelta, applyDamageMult, applyTroopDelta, applyTroopMult } from "@/systems/Squad";

export type GateKind = "addTroops" | "multTroops" | "trapTroops" | "addDamage" | "multDamage";

export interface GateSpec {
  kind: GateKind;
  amount: number;
}

export interface GateRuntime {
  spec: GateSpec;
  laneX: number;
  worldY: number;
  consumed: boolean;
}

export interface GateVisual {
  label: string;
  fillColor: number;
  edgeColor: number;
  positive: boolean;
}

export function applyGate(squad: SquadState, spec: GateSpec): void {
  switch (spec.kind) {
    case "addTroops":
      applyTroopDelta(squad, spec.amount);
      return;
    case "multTroops":
      applyTroopMult(squad, spec.amount);
      return;
    case "trapTroops":
      applyTroopDelta(squad, -Math.abs(spec.amount));
      return;
    case "addDamage":
      applyDamageDelta(squad, spec.amount);
      return;
    case "multDamage":
      applyDamageMult(squad, spec.amount);
      return;
  }
}

export function gateVisual(spec: GateSpec, palette: {
  gateBuffFill: number; gateBuffEdge: number;
  gateMultFill: number; gateMultEdge: number;
  gateTrapFill: number; gateTrapEdge: number;
  gateDmgFill: number; gateDmgEdge: number;
}): GateVisual {
  switch (spec.kind) {
    case "addTroops":
      return {
        label: `+${spec.amount}`,
        fillColor: palette.gateBuffFill,
        edgeColor: palette.gateBuffEdge,
        positive: true,
      };
    case "multTroops":
      return {
        label: `×${spec.amount}`,
        fillColor: palette.gateMultFill,
        edgeColor: palette.gateMultEdge,
        positive: true,
      };
    case "trapTroops":
      return {
        label: `−${Math.abs(spec.amount)}`,
        fillColor: palette.gateTrapFill,
        edgeColor: palette.gateTrapEdge,
        positive: false,
      };
    case "addDamage":
      return {
        label: `+${spec.amount} DMG`,
        fillColor: palette.gateDmgFill,
        edgeColor: palette.gateDmgEdge,
        positive: true,
      };
    case "multDamage":
      return {
        label: `×${spec.amount} DMG`,
        fillColor: palette.gateDmgFill,
        edgeColor: palette.gateDmgEdge,
        positive: true,
      };
  }
}

export type Rng = () => number;

/** Choose a balanced pair: typically one positive + one risky alternative. */
export function rollGatePair(rng: Rng = Math.random): [GateSpec, GateSpec] {
  const positives: GateSpec[] = [
    { kind: "addTroops", amount: 5 },
    { kind: "addTroops", amount: 8 },
    { kind: "multTroops", amount: 2 },
    { kind: "addDamage", amount: 1 },
    { kind: "multDamage", amount: 2 },
  ];
  const risks: GateSpec[] = [
    { kind: "trapTroops", amount: 3 },
    { kind: "trapTroops", amount: 6 },
    { kind: "addTroops", amount: 2 },
    { kind: "addTroops", amount: 12 },
    { kind: "addDamage", amount: 2 },
  ];
  const a = positives[Math.floor(rng() * positives.length)]!;
  const b = risks[Math.floor(rng() * risks.length)]!;
  return rng() < 0.5 ? [a, b] : [b, a];
}
