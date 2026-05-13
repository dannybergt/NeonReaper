import Phaser from "phaser";
import { GAME_CONFIG } from "@/config/game";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload(): void {
    const { width, height } = this.scale;

    const barBg = this.add.rectangle(width / 2, height / 2, 420, 8, 0x14142a);
    const bar = this.add.rectangle(width / 2 - 210, height / 2, 0, 8, GAME_CONFIG.palette.accent).setOrigin(0, 0.5);
    barBg.setStrokeStyle(1, GAME_CONFIG.palette.accent, 0.6);

    this.add
      .text(width / 2, height / 2 - 36, "NEONREAPER", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "32px",
        color: "#ff2bd6",
      })
      .setOrigin(0.5)
      .setShadow(0, 0, "#ff2bd6", 12, true, true);

    this.load.on("progress", (value: number) => {
      bar.width = 420 * value;
    });

    this.generateProceduralTextures();
  }

  create(): void {
    this.scene.start("MenuScene");
  }

  private generateProceduralTextures(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    const p = GAME_CONFIG.palette;

    g.fillStyle(p.player, 1).fillCircle(16, 16, 14);
    g.lineStyle(2, p.playerGlow, 0.8).strokeCircle(16, 16, 14);
    g.generateTexture("tex_player", 32, 32);
    g.clear();

    g.fillStyle(p.enemy, 1).fillCircle(14, 14, 12);
    g.lineStyle(2, p.enemyGlow, 0.7).strokeCircle(14, 14, 12);
    g.generateTexture("tex_enemy_walker", 28, 28);
    g.clear();

    g.fillStyle(p.bullet, 1).fillCircle(4, 4, 3);
    g.generateTexture("tex_bullet", 8, 8);
    g.clear();

    g.fillStyle(p.xp, 1).fillRect(0, 0, 8, 8);
    g.generateTexture("tex_xp", 8, 8);
    g.clear();

    g.destroy();
  }
}
