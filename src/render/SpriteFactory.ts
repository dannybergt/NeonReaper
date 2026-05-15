import Phaser from "phaser";
import { GAME_CONFIG } from "@/config/game";

type Pal = typeof GAME_CONFIG.palette;
type G = Phaser.GameObjects.Graphics;

const PI = Math.PI;

function outlined(g: G, x: number, y: number, r: number, fill: number, edge: number, edgeAlpha = 0.85): void {
  g.fillStyle(edge, edgeAlpha).fillCircle(x, y, r + 1.5);
  g.fillStyle(fill, 1).fillCircle(x, y, r);
}

// ── Player: top-down survivor with rifle, faces +x (east) ──
// Texture is rendered facing right (0 rad). In-game rotation set per shot dir.
function buildPlayer(g: G, p: Pal): void {
  const W = 40;
  const H = 40;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();

  // Faint shadow
  g.fillStyle(0x000000, 0.3).fillEllipse(cx, cy + 8, 24, 10);

  // Body torso (oval, khaki vest)
  g.fillStyle(p.playerBodyDark, 1).fillCircle(cx, cy, 12);
  g.fillStyle(p.playerBody, 1).fillCircle(cx, cy, 10);

  // Belt / harness line
  g.fillStyle(p.playerBodyDark, 0.8).fillRect(cx - 9, cy - 1, 18, 2);

  // Shoulders (small dark pads at sides perpendicular to facing)
  g.fillStyle(p.playerBodyDark, 1).fillCircle(cx, cy - 8, 4);
  g.fillStyle(p.playerBodyDark, 1).fillCircle(cx, cy + 8, 4);

  // Head + helmet
  g.fillStyle(p.playerHelm, 1).fillCircle(cx + 2, cy, 7);
  g.fillStyle(p.playerSkin, 1).fillCircle(cx + 3, cy, 5);
  // Front-facing visor line (faces +x)
  g.fillStyle(p.playerHelm, 1).fillRect(cx + 4, cy - 4, 4, 1.5);
  // Forward chin shadow
  g.fillStyle(p.playerHelm, 0.5).fillTriangle(cx + 7, cy - 2, cx + 9, cy, cx + 7, cy + 2);

  // Weapon — rifle barrel pointing +x
  g.fillStyle(p.playerWeapon, 1).fillRect(cx + 6, cy - 2, 14, 4);
  g.fillStyle(p.playerWeaponMetal, 1).fillRect(cx + 18, cy - 1, 3, 2);
  // Grip nub under barrel
  g.fillStyle(p.playerWeapon, 1).fillRect(cx + 8, cy + 2, 4, 3);

  g.generateTexture("tex_player", W, H);
  g.clear();
}

// ── Walker zombie: shambling, brown ragged, ~28x32 ──
function buildWalker(g: G, p: Pal): void {
  const W = 32;
  const H = 36;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();
  g.fillStyle(0x000000, 0.3).fillEllipse(cx, cy + 9, 18, 6);

  // Body
  g.fillStyle(p.walkerDark, 1).fillCircle(cx, cy + 2, 11);
  g.fillStyle(p.walker, 1).fillCircle(cx, cy + 2, 9);
  // Tattered rag streaks
  g.fillStyle(p.walkerDark, 0.7).fillRect(cx - 8, cy + 6, 16, 2);
  g.fillStyle(p.walkerDark, 0.6).fillRect(cx - 5, cy + 1, 10, 1);

  // Arms outstretched (top-down: blobs slightly forward = +x by convention)
  g.fillStyle(p.walkerSkin, 1).fillCircle(cx + 6, cy - 4, 3);
  g.fillStyle(p.walkerSkin, 1).fillCircle(cx + 6, cy + 8, 3);

  // Head — gaunt
  outlined(g, cx, cy - 7, 6, p.walkerSkin, p.walkerDark, 0.9);
  // Sunken eyes
  g.fillStyle(0x100808, 1).fillRect(cx - 3, cy - 8, 2, 2);
  g.fillStyle(0x100808, 1).fillRect(cx + 1, cy - 8, 2, 2);
  // Blood smear on mouth
  g.fillStyle(p.walkerBlood, 0.85).fillRect(cx - 2, cy - 4, 4, 1);

  g.generateTexture("tex_enemy_walker", W, H);
  g.clear();
}

// ── Runner: skinny sprinter, orange tint, ~22x30 ──
function buildRunner(g: G, p: Pal): void {
  const W = 26;
  const H = 30;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();
  g.fillStyle(0x000000, 0.3).fillEllipse(cx, cy + 8, 14, 5);

  g.fillStyle(p.runnerDark, 1).fillEllipse(cx, cy + 2, 14, 18);
  g.fillStyle(p.runner, 1).fillEllipse(cx, cy + 2, 11, 15);

  // Legs implied (small darker pads)
  g.fillStyle(p.runnerDark, 1).fillCircle(cx - 3, cy + 8, 2);
  g.fillStyle(p.runnerDark, 1).fillCircle(cx + 3, cy + 8, 2);

  // Arms forward (sprinting posture)
  g.fillStyle(p.runnerSkin, 1).fillCircle(cx + 5, cy - 3, 2.4);
  g.fillStyle(p.runnerSkin, 1).fillCircle(cx + 5, cy + 7, 2.4);

  // Head
  outlined(g, cx, cy - 7, 5, p.runnerSkin, p.runnerDark, 0.9);
  g.fillStyle(0x180000, 1).fillRect(cx - 2, cy - 8, 1.5, 1.5);
  g.fillStyle(0x180000, 1).fillRect(cx + 1, cy - 8, 1.5, 1.5);

  g.generateTexture("tex_enemy_runner", W, H);
  g.clear();
}

// ── Brute: armored tank, dark steel, ~44x44 ──
function buildBrute(g: G, p: Pal): void {
  const W = 48;
  const H = 48;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();
  g.fillStyle(0x000000, 0.4).fillEllipse(cx, cy + 12, 30, 9);

  // Massive torso
  g.fillStyle(p.bruteDark, 1).fillCircle(cx, cy + 1, 18);
  g.fillStyle(p.brute, 1).fillCircle(cx, cy + 1, 16);

  // Chest armor plate
  g.fillStyle(p.brutePlate, 1).fillRect(cx - 9, cy - 4, 18, 12);
  g.fillStyle(p.bruteDark, 0.85).fillRect(cx - 9, cy - 4, 18, 1);
  g.fillStyle(p.bruteDark, 0.85).fillRect(cx - 9, cy + 7, 18, 1);
  // Plate rivets
  g.fillStyle(p.bruteDark, 1).fillCircle(cx - 7, cy - 2, 1);
  g.fillStyle(p.bruteDark, 1).fillCircle(cx + 7, cy - 2, 1);
  g.fillStyle(p.bruteDark, 1).fillCircle(cx - 7, cy + 5, 1);
  g.fillStyle(p.bruteDark, 1).fillCircle(cx + 7, cy + 5, 1);

  // Shoulder spikes
  g.fillStyle(p.bruteDark, 1).fillTriangle(cx - 14, cy - 10, cx - 10, cy - 14, cx - 6, cy - 10);
  g.fillStyle(p.bruteDark, 1).fillTriangle(cx + 6, cy - 10, cx + 10, cy - 14, cx + 14, cy - 10);
  g.fillStyle(p.bruteDark, 1).fillTriangle(cx - 14, cy + 10, cx - 10, cy + 14, cx - 6, cy + 10);
  g.fillStyle(p.bruteDark, 1).fillTriangle(cx + 6, cy + 10, cx + 10, cy + 14, cx + 14, cy + 10);

  // Helmet head
  outlined(g, cx + 4, cy, 7, p.brute, p.bruteDark, 1);
  // Eye slit glowing red
  g.fillStyle(p.bruteEye, 1).fillRect(cx + 2, cy - 1, 6, 2);
  g.fillStyle(0xfff0a0, 0.7).fillRect(cx + 3, cy - 0.5, 4, 1);

  g.generateTexture("tex_enemy_brute", W, H);
  g.clear();
}

// ── Boss: Reaper Lord, giant mutant, 96x96 ──
function buildBoss(g: G, p: Pal): void {
  const W = 96;
  const H = 96;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();
  g.fillStyle(0x000000, 0.5).fillEllipse(cx, cy + 30, 60, 16);

  // Outer dark mass
  g.fillStyle(0x180808, 1).fillCircle(cx, cy, 42);
  // Inner body
  g.fillStyle(p.boss, 1).fillCircle(cx, cy, 38);
  // Glowing core
  g.fillStyle(p.bossCore, 0.85).fillCircle(cx, cy, 18);
  g.fillStyle(p.bossHighlight, 0.95).fillCircle(cx, cy, 10);
  g.fillStyle(0xffe8e0, 1).fillCircle(cx, cy, 4);

  // Vein-like tendrils radiating out
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * PI * 2;
    const ex = cx + Math.cos(a) * 30;
    const ey = cy + Math.sin(a) * 30;
    g.lineStyle(3, p.bossCore, 0.7).lineBetween(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16, ex, ey);
  }
  g.lineStyle(0, 0x000000, 0);

  // Spikes around silhouette
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * PI * 2 + 0.13;
    const r1 = 40;
    const r2 = 48;
    const x1 = cx + Math.cos(a) * r1;
    const y1 = cy + Math.sin(a) * r1;
    const x2 = cx + Math.cos(a) * r2;
    const y2 = cy + Math.sin(a) * r2;
    const px = cx + Math.cos(a + 0.06) * r1;
    const py = cy + Math.sin(a + 0.06) * r1;
    g.fillStyle(0x180808, 1).fillTriangle(x1, y1, x2, y2, px, py);
  }

  g.generateTexture("tex_boss", W, H);
  g.clear();
}

// ── Bullets ──
function buildBullet(g: G, p: Pal): void {
  const W = 12;
  const H = 12;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();
  // Trail glow
  g.fillStyle(p.bulletTrail, 0.5).fillEllipse(cx, cy, 12, 5);
  // Core
  g.fillStyle(p.bulletGlow, 1).fillEllipse(cx, cy, 8, 4);
  g.fillStyle(p.bullet, 1).fillEllipse(cx, cy, 5, 2.5);
  // Highlight
  g.fillStyle(0xffffff, 0.85).fillEllipse(cx + 1, cy, 2, 1.5);
  g.generateTexture("tex_bullet", W, H);
  g.clear();
}

function buildEnemyBullet(g: G, p: Pal): void {
  const W = 12;
  const H = 12;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();
  g.fillStyle(p.enemyBulletGlow, 0.6).fillCircle(cx, cy, 5.5);
  g.fillStyle(p.enemyBullet, 1).fillCircle(cx, cy, 4);
  g.fillStyle(0xfff0c0, 0.85).fillCircle(cx - 1, cy - 1, 1.5);
  g.generateTexture("tex_enemy_bullet", W, H);
  g.clear();
}

function buildMuzzleFlash(g: G, p: Pal): void {
  const W = 22;
  const H = 12;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();
  // Star burst — three overlapping ellipses
  g.fillStyle(p.muzzleFlash, 0.85).fillEllipse(cx, cy, 22, 9);
  g.fillStyle(0xffffff, 0.95).fillEllipse(cx, cy, 14, 5);
  g.fillStyle(p.bulletGlow, 0.7).fillEllipse(cx + 5, cy, 8, 3);
  g.generateTexture("tex_muzzle_flash", W, H);
  g.clear();
}

// ── Gem: hex loot crystal ──
function buildGem(g: G, p: Pal): void {
  const W = 14;
  const H = 14;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();
  // Hex
  const r = 5;
  const pts: number[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * PI * 2 - PI / 2;
    pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  g.fillStyle(p.gemDark, 1).fillPoints(
    [
      { x: pts[0]!, y: pts[1]! },
      { x: pts[2]!, y: pts[3]! },
      { x: pts[4]!, y: pts[5]! },
      { x: pts[6]!, y: pts[7]! },
      { x: pts[8]!, y: pts[9]! },
      { x: pts[10]!, y: pts[11]! },
    ],
    true,
  );
  g.fillStyle(p.gem, 1).fillCircle(cx, cy, 3.5);
  g.fillStyle(p.gemBright, 0.95).fillCircle(cx - 1, cy - 1, 1.5);
  g.generateTexture("tex_xp", W, H);
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
  const W = 16;
  const H = 16;
  g.clear();
  g.fillStyle(p.smoke, 0.55).fillCircle(W / 2, H / 2, 7);
  g.fillStyle(p.smoke, 0.85).fillCircle(W / 2, H / 2, 4);
  g.generateTexture("tex_smoke", W, H);
  g.clear();
}

// ── Asphalt tile + rubble ──
function buildAsphaltTile(g: G, p: Pal): void {
  const W = 128;
  const H = 128;
  g.clear();
  // Base
  g.fillStyle(p.asphalt, 1).fillRect(0, 0, W, H);
  // Subtle noise blobs
  g.fillStyle(p.asphaltLight, 0.18).fillCircle(20, 40, 18);
  g.fillStyle(p.asphaltLight, 0.14).fillCircle(80, 90, 24);
  g.fillStyle(p.asphaltLight, 0.16).fillCircle(110, 18, 14);
  g.fillStyle(0x000000, 0.18).fillCircle(50, 100, 10);
  // Cracks
  g.lineStyle(1, 0x000000, 0.5).lineBetween(0, 24, W, 30);
  g.lineStyle(1, 0x000000, 0.4).lineBetween(60, 0, 70, H);
  // Lane marking strip (yellow dashed)
  for (let y = 8; y < H; y += 32) {
    g.fillStyle(p.laneMark, 0.85).fillRect(W / 2 - 2, y, 4, 14);
  }
  g.lineStyle(0, 0x000000, 0);
  g.generateTexture("tex_asphalt", W, H);
  g.clear();
}

function buildRubble(g: G, p: Pal): void {
  const W = 28;
  const H = 18;
  g.clear();
  g.fillStyle(0x000000, 0.4).fillEllipse(W / 2, H - 2, 22, 4);
  g.fillStyle(p.rubble, 1).fillTriangle(2, H - 4, 14, 4, 24, H - 4);
  g.fillStyle(0x80848a, 0.7).fillTriangle(6, H - 4, 14, 8, 22, H - 4);
  g.fillStyle(p.rubble, 1).fillRect(18, H - 8, 8, 6);
  g.fillStyle(0x000000, 0.4).fillRect(20, H - 4, 4, 2);
  g.generateTexture("tex_rubble", W, H);
  g.clear();
}

export function buildAllTextures(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const p = GAME_CONFIG.palette;

  buildAsphaltTile(g, p);
  buildRubble(g, p);
  buildPlayer(g, p);
  buildWalker(g, p);
  buildRunner(g, p);
  buildBrute(g, p);
  buildBoss(g, p);
  buildBullet(g, p);
  buildEnemyBullet(g, p);
  buildMuzzleFlash(g, p);
  buildGem(g, p);
  buildHitSpark(g, p);
  buildSmokePuff(g, p);

  g.destroy();
}

export const SPRITE_KEYS = [
  "tex_player",
  "tex_enemy_walker",
  "tex_enemy_runner",
  "tex_enemy_brute",
  "tex_boss",
  "tex_bullet",
  "tex_enemy_bullet",
  "tex_muzzle_flash",
  "tex_xp",
  "tex_hit_spark",
  "tex_smoke",
  "tex_asphalt",
  "tex_rubble",
] as const;
