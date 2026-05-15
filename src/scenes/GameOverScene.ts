import Phaser from "phaser";
import { GAME_CONFIG } from "@/config/game";

export interface GameOverData {
  score: number;
  level: number;
  elapsedSec: number;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
  }

  create(data: GameOverData): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(GAME_CONFIG.palette.bg);

    this.add
      .text(width / 2, height / 2 - 140, "REAPED", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "80px",
        color: "#ff2bd6",
      })
      .setOrigin(0.5)
      .setShadow(0, 0, "#ff2bd6", 18, true, true);

    const mm = Math.floor(data.elapsedSec / 60).toString().padStart(2, "0");
    const ss = Math.floor(data.elapsedSec % 60).toString().padStart(2, "0");

    const stats = [
      `TIME    ${mm}:${ss}`,
      `LEVEL   ${data.level}`,
      `SCORE   ${data.score}`,
    ];

    stats.forEach((line, i) => {
      this.add
        .text(width / 2, height / 2 - 30 + i * 32, line, {
          fontFamily: "system-ui, monospace",
          fontSize: "22px",
          color: "#e0e8ff",
        })
        .setOrigin(0.5);
    });

    const restart = this.makeButton(width / 2, height / 2 + 110, "▶ RETRY  [R]", 0x00ffe1, () =>
      this.scene.start("GameScene"),
    );
    const menu = this.makeButton(width / 2, height / 2 + 160, "MENU  [M / ESC]", 0x7f7fa0, () =>
      this.scene.start("MenuScene"),
    );

    void restart;
    void menu;

    this.input.keyboard?.once("keydown-R", () => this.scene.start("GameScene"));
    this.input.keyboard?.once("keydown-SPACE", () => this.scene.start("GameScene"));
    this.input.keyboard?.once("keydown-ENTER", () => this.scene.start("GameScene"));
    this.input.keyboard?.once("keydown-M", () => this.scene.start("MenuScene"));
    this.input.keyboard?.once("keydown-ESC", () => this.scene.start("MenuScene"));
  }

  private makeButton(x: number, y: number, label: string, color: number, onClick: () => void): Phaser.GameObjects.Text {
    const text = this.add
      .text(x, y, label, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "24px",
        color: `#${color.toString(16).padStart(6, "0")}`,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setShadow(0, 0, `#${color.toString(16).padStart(6, "0")}`, 10, true, true);

    text.on("pointerover", () => text.setScale(1.08));
    text.on("pointerout", () => text.setScale(1));
    text.on("pointerdown", onClick);
    return text;
  }
}
