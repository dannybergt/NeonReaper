import Phaser from "phaser";
import { GAME_CONFIG } from "@/config/game";

type Pal = typeof GAME_CONFIG.palette;
type G = Phaser.GameObjects.Graphics;

const PI = Math.PI;

// ── Player squad soldier — small top-down, 18×22, faces -y (up) ──
function buildPlayerSoldier(g: G, p: Pal): void {
  const W = 20;
  const H = 24;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();

  // Shadow
  g.fillStyle(0x000000, 0.35).fillEllipse(cx, H - 4, 14, 5);

  // Body torso (slightly tall oval, dark khaki edge + brighter fill)
  g.fillStyle(p.playerBodyDark, 1).fillEllipse(cx, cy + 2, 14, 14);
  g.fillStyle(p.playerBody, 1).fillEllipse(cx, cy + 2, 11, 11);

  // Belt line across mid-torso
  g.fillStyle(p.playerBodyDark, 0.85).fillRect(cx - 6, cy + 4, 12, 1.5);

  // Shoulder pads
  g.fillStyle(p.playerBodyDark, 1).fillCircle(cx - 6, cy - 1, 2.5);
  g.fillStyle(p.playerBodyDark, 1).fillCircle(cx + 6, cy - 1, 2.5);

  // Helmet (faces -y, so brim at front=top)
  g.fillStyle(p.playerHelm, 1).fillCircle(cx, cy - 6, 5);
  g.fillStyle(p.playerSkin, 1).fillCircle(cx, cy - 5, 3.2);
  // Visor strip
  g.fillStyle(p.playerHelm, 1).fillRect(cx - 3, cy - 8, 6, 1.5);

  // Rifle pointing up (-y)
  g.fillStyle(p.playerWeapon, 1).fillRect(cx + 4, cy - 9, 2.5, 10);
  // Rifle stock under body
  g.fillStyle(p.playerWeapon, 1).fillRect(cx + 3.5, cy + 1, 3, 3);

  g.generateTexture("tex_soldier", W, H);
  g.clear();
}

// ── Enemy soldier (grunt) — brown zombie marching down (+y), 18×24 ──
function buildEnemySoldier(g: G, p: Pal): void {
  const W = 20;
  const H = 24;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();
  g.fillStyle(0x000000, 0.35).fillEllipse(cx, H - 4, 14, 5);

  // Torso
  g.fillStyle(p.enemyBodyDark, 1).fillEllipse(cx, cy + 2, 14, 14);
  g.fillStyle(p.enemyBody, 1).fillEllipse(cx, cy + 2, 11, 11);
  // Tattered rag highlights
  g.fillStyle(p.enemyBodyDark, 0.7).fillRect(cx - 5, cy + 4, 10, 1);
  g.fillStyle(p.enemyTrim, 0.6).fillRect(cx - 4, cy + 6, 8, 1);

  // Arms extended forward (downward = +y)
  g.fillStyle(p.enemySkin, 1).fillCircle(cx - 5, cy + 8, 2.4);
  g.fillStyle(p.enemySkin, 1).fillCircle(cx + 5, cy + 8, 2.4);

  // Head — gaunt skull, smaller than helmet
  g.fillStyle(p.enemyBodyDark, 1).fillCircle(cx, cy - 4, 4.6);
  g.fillStyle(p.enemySkin, 1).fillCircle(cx, cy - 4, 3.6);
  // Sunken eyes (front=bottom because marching down)
  g.fillStyle(0x100808, 1).fillRect(cx - 2.4, cy - 3, 1.5, 1.5);
  g.fillStyle(0x100808, 1).fillRect(cx + 0.8, cy - 3, 1.5, 1.5);

  g.generateTexture("tex_enemy_soldier", W, H);
  g.clear();
}

// ── Shocktrooper enemy: red-orange tinted, slightly bigger ──
function buildEnemyShock(g: G, p: Pal): void {
  void p;
  const W = 22;
  const H = 26;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();
  g.fillStyle(0x000000, 0.4).fillEllipse(cx, H - 4, 16, 5);

  g.fillStyle(0x4d1808, 1).fillEllipse(cx, cy + 2, 16, 16);
  g.fillStyle(0x983218, 1).fillEllipse(cx, cy + 2, 13, 13);

  // Spiked shoulder pads
  g.fillStyle(0x2a0808, 1).fillTriangle(cx - 8, cy - 1, cx - 6, cy - 5, cx - 4, cy - 1);
  g.fillStyle(0x2a0808, 1).fillTriangle(cx + 4, cy - 1, cx + 6, cy - 5, cx + 8, cy - 1);

  // Belt
  g.fillStyle(0x2a0808, 0.85).fillRect(cx - 7, cy + 5, 14, 1.5);

  // Head with iron mask
  g.fillStyle(0x1a1a1a, 1).fillCircle(cx, cy - 5, 5.2);
  g.fillStyle(0x4a4a4a, 1).fillCircle(cx, cy - 5, 4);
  g.fillStyle(0xff5050, 1).fillRect(cx - 2.5, cy - 5, 5, 1.4);

  g.generateTexture("tex_enemy_shock", W, H);
  g.clear();
}

// ── Heavy enemy: dark steel armored, 24×28 ──
function buildEnemyHeavy(g: G, p: Pal): void {
  void p;
  const W = 26;
  const H = 30;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();
  g.fillStyle(0x000000, 0.45).fillEllipse(cx, H - 4, 20, 6);

  // Torso
  g.fillStyle(0x141518, 1).fillCircle(cx, cy + 2, 11);
  g.fillStyle(0x32363c, 1).fillCircle(cx, cy + 2, 9);
  // Chest plate
  g.fillStyle(0x5a5e64, 1).fillRect(cx - 6, cy - 1, 12, 8);
  g.fillStyle(0x141518, 0.85).fillRect(cx - 6, cy - 1, 12, 1);
  g.fillStyle(0x141518, 1).fillCircle(cx - 4, cy + 1, 0.8);
  g.fillStyle(0x141518, 1).fillCircle(cx + 4, cy + 1, 0.8);
  g.fillStyle(0x141518, 1).fillCircle(cx - 4, cy + 5, 0.8);
  g.fillStyle(0x141518, 1).fillCircle(cx + 4, cy + 5, 0.8);

  // Shoulder spikes
  g.fillStyle(0x141518, 1).fillTriangle(cx - 11, cy + 1, cx - 8, cy - 4, cx - 5, cy + 1);
  g.fillStyle(0x141518, 1).fillTriangle(cx + 5, cy + 1, cx + 8, cy - 4, cx + 11, cy + 1);

  // Helmet with red eye-slit
  g.fillStyle(0x141518, 1).fillCircle(cx, cy - 7, 5.5);
  g.fillStyle(0x32363c, 1).fillCircle(cx, cy - 7, 4.2);
  g.fillStyle(0xff2828, 1).fillRect(cx - 3, cy - 7, 6, 1.6);
  g.fillStyle(0xfff0a0, 0.7).fillRect(cx - 2, cy - 7, 4, 0.8);

  g.generateTexture("tex_enemy_heavy", W, H);
  g.clear();
}

// ── Boss: huge mutant Reaper Lord, 192×140 ──
function buildBoss(g: G, p: Pal): void {
  const W = 200;
  const H = 144;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();
  g.fillStyle(0x000000, 0.55).fillEllipse(cx, H - 12, 140, 22);

  // Outer mass
  g.fillStyle(0x140404, 1).fillEllipse(cx, cy, 180, 120);
  g.fillStyle(p.boss, 1).fillEllipse(cx, cy, 168, 110);
  // Core glow
  g.fillStyle(p.bossCore, 0.85).fillEllipse(cx, cy + 4, 90, 56);
  g.fillStyle(p.bossHighlight, 0.95).fillEllipse(cx, cy + 4, 60, 36);
  g.fillStyle(0xffe8e0, 1).fillEllipse(cx, cy + 4, 28, 18);

  // Tendrils radiating
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * PI * 2;
    const r1 = 56;
    const r2 = 84;
    const x1 = cx + Math.cos(a) * r1 * 0.95;
    const y1 = cy + Math.sin(a) * r1 * 0.7;
    const x2 = cx + Math.cos(a) * r2 * 0.95;
    const y2 = cy + Math.sin(a) * r2 * 0.7;
    g.lineStyle(4, p.bossCore, 0.7).lineBetween(x1, y1, x2, y2);
  }
  g.lineStyle(0, 0x000000, 0);

  // Spike crown along top edge
  for (let i = 0; i < 12; i++) {
    const x = 30 + i * 12;
    g.fillStyle(0x140404, 1).fillTriangle(x, 16, x + 6, 0, x + 12, 16);
  }

  g.generateTexture("tex_boss", W, H);
  g.clear();
}

// ── Bullets ──
function buildBullet(g: G, p: Pal): void {
  const W = 8;
  const H = 14;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();
  g.fillStyle(p.bulletGlow, 0.85).fillEllipse(cx, cy, 6, 12);
  g.fillStyle(p.bullet, 1).fillEllipse(cx, cy, 3.5, 8);
  g.fillStyle(0xffffff, 0.85).fillEllipse(cx, cy - 2, 1.5, 3);
  g.generateTexture("tex_bullet", W, H);
  g.clear();
}

function buildEnemyBullet(g: G, p: Pal): void {
  const W = 10;
  const H = 14;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();
  g.fillStyle(0xff8050, 0.6).fillEllipse(cx, cy, 8, 12);
  g.fillStyle(p.enemyBullet, 1).fillEllipse(cx, cy, 4, 8);
  g.fillStyle(0xfff0c0, 0.85).fillEllipse(cx, cy + 2, 1.5, 3);
  g.generateTexture("tex_enemy_bullet", W, H);
  g.clear();
}

function buildMuzzleFlash(g: G, p: Pal): void {
  const W = 14;
  const H = 18;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();
  g.fillStyle(p.muzzleFlash, 0.85).fillEllipse(cx, cy, 12, 16);
  g.fillStyle(0xffffff, 0.95).fillEllipse(cx, cy, 7, 10);
  g.fillStyle(p.bulletGlow, 0.7).fillEllipse(cx, cy - 4, 4, 6);
  g.generateTexture("tex_muzzle_flash", W, H);
  g.clear();
}

// ── Particles ──
function buildHitSpark(g: G, p: Pal): void {
  const W = 8;
  const H = 8;
  g.clear();
  g.fillStyle(p.hitSpark, 1).fillCircle(W / 2, H / 2, 3);
  g.fillStyle(0xffffff, 0.9).fillCircle(W / 2, H / 2, 1.5);
  g.generateTexture("tex_hit_spark", W, H);
  g.clear();
}

function buildSmokePuff(g: G, p: Pal): void {
  const W = 18;
  const H = 18;
  g.clear();
  g.fillStyle(p.smoke, 0.55).fillCircle(W / 2, H / 2, 8);
  g.fillStyle(p.smoke, 0.85).fillCircle(W / 2, H / 2, 5);
  g.generateTexture("tex_smoke", W, H);
  g.clear();
}

// ── Asphalt lane tile (tall, scrolls vertically) ──
function buildLaneTile(g: G, p: Pal): void {
  const W = 256;
  const H = 256;
  g.clear();
  // Base asphalt
  g.fillStyle(p.asphalt, 1).fillRect(0, 0, W, H);
  // Subtle noise blobs
  g.fillStyle(p.asphaltLight, 0.18).fillCircle(40, 80, 24);
  g.fillStyle(p.asphaltLight, 0.14).fillCircle(170, 160, 30);
  g.fillStyle(p.asphaltLight, 0.16).fillCircle(220, 30, 18);
  g.fillStyle(0x000000, 0.18).fillCircle(80, 220, 14);
  // Cracks
  g.lineStyle(1, 0x000000, 0.5).lineBetween(0, 50, W, 58);
  g.lineStyle(1, 0x000000, 0.4).lineBetween(W / 2 + 30, 0, W / 2 + 40, H);
  g.lineStyle(0, 0x000000, 0);
  // Center lane markings (yellow dashes)
  for (let y = 16; y < H; y += 64) {
    g.fillStyle(p.laneMark, 0.85).fillRect(W / 2 - 3, y, 6, 28);
  }
  g.generateTexture("tex_lane_tile", W, H);
  g.clear();
}

// ── Lane edge curb ──
function buildLaneEdge(g: G, p: Pal): void {
  const W = 80;
  const H = 256;
  g.clear();
  g.fillStyle(p.laneEdge, 1).fillRect(0, 0, W, H);
  g.fillStyle(p.laneEdgeHi, 1).fillRect(W - 6, 0, 4, H);
  g.fillStyle(p.laneEdgeHi, 0.5).fillRect(W - 12, 0, 2, H);
  // Rivets
  for (let y = 24; y < H; y += 48) {
    g.fillStyle(0x141518, 1).fillCircle(W - 30, y, 3);
    g.fillStyle(0x70747a, 0.7).fillCircle(W - 30, y - 1, 1);
  }
  g.generateTexture("tex_lane_edge", W, H);
  g.clear();
}

// ── Gate frame: two pylons + crossbar, color-tinted at runtime ──
function buildGateFrame(g: G): void {
  const W = 200;
  const H = 92;
  g.clear();

  // Crossbar shadow
  g.fillStyle(0x000000, 0.35).fillRect(8, 18, W - 16, 12);

  // Crossbar (top)
  g.fillStyle(0xffffff, 1).fillRect(8, 8, W - 16, 14);
  g.fillStyle(0xffffff, 0.3).fillRect(8, 8, W - 16, 4);

  // Pylons (left + right)
  g.fillStyle(0xffffff, 1).fillRect(4, 8, 14, H - 12);
  g.fillStyle(0xffffff, 1).fillRect(W - 18, 8, 14, H - 12);
  g.fillStyle(0x000000, 0.25).fillRect(4, H - 12, 14, 8);
  g.fillStyle(0x000000, 0.25).fillRect(W - 18, H - 12, 14, 8);

  // Pylon top caps
  g.fillStyle(0xffffff, 1).fillRect(0, 4, 22, 8);
  g.fillStyle(0xffffff, 1).fillRect(W - 22, 4, 22, 8);

  g.generateTexture("tex_gate_frame", W, H);
  g.clear();
}

export function buildAllTextures(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const p = GAME_CONFIG.palette;

  buildLaneTile(g, p);
  buildLaneEdge(g, p);
  buildPlayerSoldier(g, p);
  buildEnemySoldier(g, p);
  buildEnemyShock(g, p);
  buildEnemyHeavy(g, p);
  buildBoss(g, p);
  buildBullet(g, p);
  buildEnemyBullet(g, p);
  buildMuzzleFlash(g, p);
  buildHitSpark(g, p);
  buildSmokePuff(g, p);
  buildGateFrame(g);

  g.destroy();
}
