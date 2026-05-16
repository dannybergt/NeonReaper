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

    // 3D-rendered character atlas (built via scripts/render_sprite.py +
    // scripts/pack_atlas.py from Kenney's CC0 animated-characters-3 pack).
    this.load.atlas("sprites", "atlas/sprites.png", "atlas/sprites.json");

    // Everything else (FX, gates, bullets, environment) still procedural.
    buildAllTextures(this);
  }

  create(): void {
    this.registerAnimations();
    this.scene.start("MenuScene");
  }

  private registerAnimations(): void {
    const chars: Array<{ key: string; prefix: string }> = [
      { key: "walk_player", prefix: "player" },
      { key: "walk_grunt", prefix: "grunt" },
      { key: "walk_shock", prefix: "shock" },
      { key: "walk_heavy", prefix: "heavy" },
    ];
    for (const c of chars) {
      if (this.anims.exists(c.key)) continue;
      this.anims.create({
        key: c.key,
        frames: [
          { key: "sprites", frame: `${c.prefix}_00` },
          { key: "sprites", frame: `${c.prefix}_01` },
          { key: "sprites", frame: `${c.prefix}_02` },
          { key: "sprites", frame: `${c.prefix}_03` },
        ],
        frameRate: 10,
        repeat: -1,
      });
    }
  }
}
