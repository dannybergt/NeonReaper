import Phaser from "phaser";
import { GAME_CONFIG } from "@/config/game";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(GAME_CONFIG.palette.bg);

    // Background asphalt strip
    this.add.tileSprite(width / 2, height / 2, width, height, "tex_lane_tile").setAlpha(0.7);
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.45);

    this.add
      .text(width / 2, height / 2 - 200, "REAPER", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "92px",
        color: "#f0e8c8",
      })
      .setOrigin(0.5)
      .setShadow(0, 4, "#000000", 10, true, true);

    this.add
      .text(width / 2, height / 2 - 130, "LANE-SQUAD DEFENSE", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
        color: "#8a8a82",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 30, "← → to steer your squad", {
        fontFamily: "system-ui, monospace",
        fontSize: "16px",
        color: "#a8a89a",
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height / 2, "drag with mouse / finger", {
        fontFamily: "system-ui, monospace",
        fontSize: "16px",
        color: "#a8a89a",
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height / 2 + 30, "pass through buff gates, dodge traps", {
        fontFamily: "system-ui, monospace",
        fontSize: "16px",
        color: "#a8a89a",
      })
      .setOrigin(0.5);

    const startText = this.add
      .text(width / 2, height / 2 + 140, "▶  ENTER THE LANE", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "30px",
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
  }
}
