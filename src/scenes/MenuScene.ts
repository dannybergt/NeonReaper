import Phaser from "phaser";
import { GAME_CONFIG } from "@/config/game";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2 - 80, "NEONREAPER", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "72px",
        color: "#ff2bd6",
      })
      .setOrigin(0.5)
      .setShadow(0, 0, "#ff2bd6", 18, true, true);

    this.add
      .text(width / 2, height / 2 - 20, "Phase 0 — Scaffold", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
        color: "#7f7fa0",
      })
      .setOrigin(0.5);

    const startText = this.add
      .text(width / 2, height / 2 + 60, "▶ START", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "28px",
        color: "#00ffe1",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setShadow(0, 0, "#00ffe1", 12, true, true);

    startText.on("pointerover", () => startText.setScale(1.08));
    startText.on("pointerout", () => startText.setScale(1));
    startText.on("pointerdown", () => this.scene.start("GameScene"));

    this.input.keyboard?.once("keydown-ENTER", () => this.scene.start("GameScene"));
    this.input.keyboard?.once("keydown-SPACE", () => this.scene.start("GameScene"));

    this.cameras.main.setBackgroundColor(GAME_CONFIG.palette.bg);
  }
}
