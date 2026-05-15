import Phaser from "phaser";
import { GAME_CONFIG } from "@/config/game";
import { pickUpgrades, type Upgrade } from "@/systems/UpgradeSystem";

const RARITY_COLOR: Record<Upgrade["rarity"], number> = {
  common: 0x00ffe1,
  rare: 0x6aa6ff,
  epic: 0xff2bd6,
};

export class LevelUpScene extends Phaser.Scene {
  private resolved = false;

  constructor() {
    super({ key: "LevelUpScene" });
  }

  create(data: { onPick: (u: Upgrade) => void; level: number }): void {
    this.resolved = false;
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.65);

    this.add
      .text(width / 2, 90, `LEVEL ${data.level}`, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "44px",
        color: "#ff2bd6",
      })
      .setOrigin(0.5)
      .setShadow(0, 0, "#ff2bd6", 14, true, true);

    this.add
      .text(width / 2, 140, "Choose an upgrade", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "18px",
        color: "#a0a8c8",
      })
      .setOrigin(0.5);

    const choices = pickUpgrades(3);
    const cardW = 280;
    const cardH = 340;
    const gap = 28;
    const totalW = choices.length * cardW + (choices.length - 1) * gap;
    const startX = (width - totalW) / 2 + cardW / 2;
    const cardY = height / 2 + 20;

    choices.forEach((upgrade, i) => {
      const x = startX + i * (cardW + gap);
      this.makeCard(x, cardY, cardW, cardH, upgrade, i + 1, () => this.resolve(upgrade, data.onPick));
    });

    this.input.keyboard?.on("keydown-ONE", () => this.resolve(choices[0]!, data.onPick));
    this.input.keyboard?.on("keydown-TWO", () => this.resolve(choices[1]!, data.onPick));
    this.input.keyboard?.on("keydown-THREE", () => this.resolve(choices[2]!, data.onPick));
  }

  private makeCard(
    x: number,
    y: number,
    w: number,
    h: number,
    upgrade: Upgrade,
    index: number,
    onPick: () => void,
  ): void {
    const color = RARITY_COLOR[upgrade.rarity];
    const bg = this.add.rectangle(x, y, w, h, GAME_CONFIG.palette.bg, 0.95).setStrokeStyle(2, color, 0.9);
    bg.setInteractive({ useHandCursor: true });

    const glow = this.add.rectangle(x, y, w + 8, h + 8, color, 0.08).setStrokeStyle(1, color, 0.35);
    glow.setVisible(false);

    this.add
      .text(x, y - h / 2 + 30, `[${index}]`, {
        fontFamily: "system-ui, monospace",
        fontSize: "18px",
        color: "#7f7fa0",
      })
      .setOrigin(0.5);

    this.add
      .text(x, y - 40, upgrade.title, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "24px",
        color: `#${color.toString(16).padStart(6, "0")}`,
        align: "center",
        wordWrap: { width: w - 24 },
      })
      .setOrigin(0.5);

    this.add
      .text(x, y + 30, upgrade.description, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
        color: "#e0e8ff",
        align: "center",
        wordWrap: { width: w - 24 },
      })
      .setOrigin(0.5);

    this.add
      .text(x, y + h / 2 - 28, upgrade.rarity.toUpperCase(), {
        fontFamily: "system-ui, monospace",
        fontSize: "12px",
        color: "#7f7fa0",
      })
      .setOrigin(0.5);

    bg.on("pointerover", () => glow.setVisible(true));
    bg.on("pointerout", () => glow.setVisible(false));
    bg.on("pointerdown", onPick);
  }

  private resolve(upgrade: Upgrade, onPick: (u: Upgrade) => void): void {
    if (this.resolved) return;
    this.resolved = true;
    onPick(upgrade);
    this.scene.stop("LevelUpScene");
  }
}
