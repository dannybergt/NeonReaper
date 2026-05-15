import Phaser from "phaser";
import { GAME_CONFIG } from "@/config/game";
import { buildAllTextures } from "@/render/SpriteFactory";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload(): void {
    const { width, height } = this.scale;

    const barBg = this.add.rectangle(width / 2, height / 2, 420, 8, 0x14142a);
    const bar = this.add
      .rectangle(width / 2 - 210, height / 2, 0, 8, GAME_CONFIG.palette.accentWarm)
      .setOrigin(0, 0.5);
    barBg.setStrokeStyle(1, GAME_CONFIG.palette.accentWarm, 0.6);

    this.add
      .text(width / 2, height / 2 - 36, "LOADING", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "32px",
        color: `#${GAME_CONFIG.palette.accentWarm.toString(16).padStart(6, "0")}`,
      })
      .setOrigin(0.5)
      .setShadow(0, 2, "#000000", 4, true, true);

    this.load.on("progress", (value: number) => {
      bar.width = 420 * value;
    });

    buildAllTextures(this);
  }

  create(): void {
    this.scene.start("MenuScene");
  }
}
