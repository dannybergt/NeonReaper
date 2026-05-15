import Phaser from "phaser";
import { GAME_CONFIG } from "@/config/game";
import { BootScene } from "@/scenes/BootScene";
import { PreloadScene } from "@/scenes/PreloadScene";
import { MenuScene } from "@/scenes/MenuScene";
import { GameScene } from "@/scenes/GameScene";
import { LevelUpScene } from "@/scenes/LevelUpScene";
import { GameOverScene } from "@/scenes/GameOverScene";

const fallback = document.querySelector(".boot-fallback");
fallback?.remove();

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: GAME_CONFIG.bgColor,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  pixelArt: false,
  antialias: true,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { x: 0, y: 0 },
    },
  },
  scene: [BootScene, PreloadScene, MenuScene, GameScene, LevelUpScene, GameOverScene],
  render: {
    powerPreference: "high-performance",
  },
});
