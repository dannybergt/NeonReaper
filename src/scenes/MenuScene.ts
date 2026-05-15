import Phaser from "phaser";
import { GAME_CONFIG } from "@/config/game";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2 - 80, "REAPER", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "84px",
        color: "#f0e8c8",
      })
      .setOrigin(0.5)
      .setShadow(0, 4, "#000000", 8, true, true);

    this.add
      .text(width / 2, height / 2 - 16, "POST-APOCALYPTIC AUTO-SHOOTER", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        color: "#8a8a82",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const startText = this.add
      .text(width / 2, height / 2 + 70, "▶  ENTER THE STREETS", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "26px",
        color: "#ff8c2b",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setShadow(0, 2, "#000000", 6, true, true);

    startText.on("pointerover", () => startText.setScale(1.08));
    startText.on("pointerout", () => startText.setScale(1));
    startText.on("pointerdown", () => this.scene.start("GameScene"));

    this.input.keyboard?.once("keydown-ENTER", () => this.scene.start("GameScene"));
    this.input.keyboard?.once("keydown-SPACE", () => this.scene.start("GameScene"));

    this.cameras.main.setBackgroundColor(GAME_CONFIG.palette.bg);
  }
}
