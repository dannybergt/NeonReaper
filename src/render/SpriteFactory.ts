import Phaser from "phaser";
import { GAME_CONFIG } from "@/config/game";

type Pal = typeof GAME_CONFIG.palette;
type G = Phaser.GameObjects.Graphics;

const PI = Math.PI;

// ────────────────────────────────────────────────────────────────────
// Squad soldier — 36×44, top-down, faces -y (up). Detailed: ground
// shadow, body with shading + harness, shoulder pads, rucksack hump,
// helmet with brim, visor, ear-protection, rifle with foregrip + stock.
// ────────────────────────────────────────────────────────────────────
function buildPlayerSoldier(g: G, p: Pal): void {
  const W = 40;
  const H = 48;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();

  // Long ground shadow (deformed ellipse)
  g.fillStyle(0x000000, 0.4).fillEllipse(cx, H - 6, 28, 9);
  g.fillStyle(0x000000, 0.22).fillEllipse(cx, H - 4, 32, 11);

  // Boots peeking out (forward = -y)
  g.fillStyle(0x101010, 1).fillRect(cx - 7, cy - 11, 4, 4);
  g.fillStyle(0x101010, 1).fillRect(cx + 3, cy - 11, 4, 4);

  // Legs (visible through formation top-down)
  g.fillStyle(p.playerBodyDark, 1).fillRect(cx - 7, cy - 7, 4, 8);
  g.fillStyle(p.playerBodyDark, 1).fillRect(cx + 3, cy - 7, 4, 8);

  // Body torso (oval, dark edge + main fill + highlight)
  g.fillStyle(0x000000, 0.45).fillEllipse(cx, cy + 3, 24, 26);
  g.fillStyle(p.playerBodyDark, 1).fillEllipse(cx, cy + 2, 22, 24);
  g.fillStyle(p.playerBody, 1).fillEllipse(cx, cy + 2, 18, 20);
  // Body highlight (top-left lit)
  g.fillStyle(0xa0b070, 0.55).fillEllipse(cx - 3, cy - 2, 9, 9);

  // Tactical harness X-strap
  g.fillStyle(p.playerBodyDark, 0.95).fillRect(cx - 1, cy - 7, 2, 16);
  g.fillStyle(p.playerBodyDark, 0.95).fillRect(cx - 7, cy + 2, 14, 2);
  // Mag pouches on harness
  g.fillStyle(0x141518, 1).fillRect(cx - 6, cy + 5, 3, 4);
  g.fillStyle(0x141518, 1).fillRect(cx + 3, cy + 5, 3, 4);
  g.fillStyle(0x404448, 0.7).fillRect(cx - 5.8, cy + 5.4, 2.4, 0.8);
  g.fillStyle(0x404448, 0.7).fillRect(cx + 3.2, cy + 5.4, 2.4, 0.8);

  // Backpack hump (below torso center = behind in top-down)
  g.fillStyle(0x2a2618, 1).fillEllipse(cx, cy + 9, 16, 9);
  g.fillStyle(0x4a4030, 1).fillEllipse(cx, cy + 9, 13, 6);
  g.fillStyle(0x141518, 0.9).fillRect(cx - 1, cy + 8, 2, 5);

  // Shoulder pads
  g.fillStyle(0x141518, 1).fillCircle(cx - 9, cy - 2, 4);
  g.fillStyle(0x141518, 1).fillCircle(cx + 9, cy - 2, 4);
  g.fillStyle(p.playerBodyDark, 1).fillCircle(cx - 9, cy - 2, 2.6);
  g.fillStyle(p.playerBodyDark, 1).fillCircle(cx + 9, cy - 2, 2.6);

  // Head (in -y direction)
  // Helmet body
  g.fillStyle(0x000000, 0.55).fillCircle(cx, cy - 11, 9);
  g.fillStyle(p.playerHelm, 1).fillCircle(cx, cy - 11, 8);
  g.fillStyle(0x3a3f25, 1).fillCircle(cx, cy - 11, 6.8);
  // Helmet brim
  g.fillStyle(0x141518, 1).fillRect(cx - 8, cy - 13.5, 16, 2);
  // Face / skin patch under visor
  g.fillStyle(p.playerSkin, 1).fillEllipse(cx, cy - 9, 7, 4);
  // Visor (full strip)
  g.fillStyle(0x141518, 1).fillRect(cx - 7, cy - 11, 14, 2);
  g.fillStyle(0x4a6080, 0.85).fillRect(cx - 6, cy - 10.7, 12, 1.2);
  // Helmet straps
  g.fillStyle(p.playerHelm, 1).fillRect(cx - 7, cy - 8, 1.5, 2);
  g.fillStyle(p.playerHelm, 1).fillRect(cx + 5.5, cy - 8, 1.5, 2);
  // Antenna/comm bit on top
  g.fillStyle(p.playerHelm, 1).fillRect(cx + 5, cy - 17, 1, 5);
  g.fillStyle(0xff5050, 1).fillRect(cx + 4.5, cy - 18, 2, 1.5);

  // Rifle — pointing up (-y), on right side
  // Stock (under body)
  g.fillStyle(0x141518, 1).fillRect(cx + 7, cy + 4, 4, 7);
  g.fillStyle(0x2a2418, 1).fillRect(cx + 7.4, cy + 4.4, 3.2, 6);
  // Receiver
  g.fillStyle(0x141518, 1).fillRect(cx + 7, cy - 4, 4, 9);
  g.fillStyle(0x32363c, 1).fillRect(cx + 7.4, cy - 3.5, 3.2, 8.5);
  // Foregrip
  g.fillStyle(p.playerWeapon, 1).fillRect(cx + 6.4, cy - 8, 1.5, 3);
  // Barrel
  g.fillStyle(0x141518, 1).fillRect(cx + 8, cy - 18, 2.4, 14);
  g.fillStyle(0x4a4e54, 1).fillRect(cx + 8.4, cy - 18, 1.6, 14);
  // Muzzle
  g.fillStyle(0x141518, 1).fillCircle(cx + 9.2, cy - 18, 1.6);
  // Optic
  g.fillStyle(0x141518, 1).fillRect(cx + 7, cy - 6, 4, 3);
  g.fillStyle(0xff8050, 0.9).fillCircle(cx + 9, cy - 4.5, 0.9);

  g.generateTexture("tex_soldier", W, H);
  g.clear();
}

// ────────────────────────────────────────────────────────────────────
// Enemy grunt zombie — 32×42, marches down (+y). Detailed: rotting
// skin texture, exposed ribs, torn clothing, lopsided posture,
// hanging arms reaching forward (down in world).
// ────────────────────────────────────────────────────────────────────
function buildEnemySoldier(g: G, p: Pal): void {
  const W = 36;
  const H = 44;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();

  // Ground shadow
  g.fillStyle(0x000000, 0.42).fillEllipse(cx, H - 5, 24, 7);
  g.fillStyle(0x000000, 0.2).fillEllipse(cx, H - 4, 28, 9);

  // Legs (dragging)
  g.fillStyle(p.enemyBodyDark, 1).fillRect(cx - 5, cy + 8, 3, 6);
  g.fillStyle(p.enemyBodyDark, 1).fillRect(cx + 2, cy + 7, 3, 7);

  // Torso — irregular rotting silhouette
  g.fillStyle(0x000000, 0.55).fillEllipse(cx, cy + 3, 22, 22);
  g.fillStyle(p.enemyBodyDark, 1).fillEllipse(cx, cy + 2, 20, 20);
  g.fillStyle(p.enemyBody, 1).fillEllipse(cx + 1, cy + 1, 16, 16);
  // Decay highlight (sickly bright spot)
  g.fillStyle(0x8a7a4a, 0.4).fillEllipse(cx - 2, cy - 2, 7, 6);

  // Torn shirt patches
  g.fillStyle(p.enemyTrim, 0.75).fillRect(cx - 6, cy + 4, 6, 2);
  g.fillStyle(p.enemyTrim, 0.6).fillRect(cx + 2, cy + 5, 5, 1.5);
  g.fillStyle(p.enemyBodyDark, 0.7).fillRect(cx - 4, cy + 7, 9, 1);

  // Exposed ribs (light bone strips)
  g.fillStyle(0xc8b894, 0.7).fillRect(cx - 2, cy, 1.4, 3);
  g.fillStyle(0xc8b894, 0.7).fillRect(cx + 1, cy, 1.4, 3);

  // Dripping wound on side
  g.fillStyle(p.enemyTrim, 1).fillCircle(cx + 6, cy + 2, 1.8);
  g.fillStyle(p.enemyTrim, 0.7).fillRect(cx + 5.5, cy + 3.5, 1, 3);

  // Arms outstretched (forward = +y)
  // Left arm
  g.fillStyle(p.enemyBodyDark, 1).fillEllipse(cx - 9, cy + 9, 5, 9);
  g.fillStyle(p.enemySkin, 1).fillCircle(cx - 9, cy + 13, 3);
  // Right arm
  g.fillStyle(p.enemyBodyDark, 1).fillEllipse(cx + 10, cy + 9, 5, 9);
  g.fillStyle(p.enemySkin, 1).fillCircle(cx + 10, cy + 13, 3);
  // Fingers (small dark stubs)
  g.fillStyle(0x4a3018, 1).fillRect(cx - 11, cy + 15, 0.8, 1.5);
  g.fillStyle(0x4a3018, 1).fillRect(cx - 9, cy + 15, 0.8, 1.5);
  g.fillStyle(0x4a3018, 1).fillRect(cx + 9, cy + 15, 0.8, 1.5);
  g.fillStyle(0x4a3018, 1).fillRect(cx + 11, cy + 15, 0.8, 1.5);

  // Head — gaunt skull
  g.fillStyle(0x000000, 0.5).fillCircle(cx, cy - 8, 7);
  g.fillStyle(p.enemyBodyDark, 1).fillCircle(cx, cy - 8, 6.5);
  g.fillStyle(p.enemySkin, 1).fillCircle(cx, cy - 8, 5.4);
  // Hair tufts (sparse)
  g.fillStyle(p.enemyBodyDark, 1).fillRect(cx - 3, cy - 14, 2, 2);
  g.fillStyle(p.enemyBodyDark, 1).fillRect(cx + 1, cy - 14, 2, 2);
  // Sunken eyes glowing faint red
  g.fillStyle(0x100808, 1).fillRect(cx - 3.2, cy - 8.5, 2.2, 2);
  g.fillStyle(0x100808, 1).fillRect(cx + 1, cy - 8.5, 2.2, 2);
  g.fillStyle(0xff4040, 0.6).fillRect(cx - 2.6, cy - 8, 1.2, 1);
  g.fillStyle(0xff4040, 0.6).fillRect(cx + 1.6, cy - 8, 1.2, 1);
  // Open mouth / jawline
  g.fillStyle(0x180404, 1).fillRect(cx - 2, cy - 4.5, 4, 1.6);
  g.fillStyle(0xc8b894, 0.85).fillRect(cx - 1.5, cy - 4, 0.8, 1);
  g.fillStyle(0xc8b894, 0.85).fillRect(cx + 0.7, cy - 4, 0.8, 1);
  // Blood drool
  g.fillStyle(p.enemyTrim, 0.85).fillRect(cx - 0.5, cy - 3, 1, 3);

  g.generateTexture("tex_enemy_soldier", W, H);
  g.clear();
}

// ────────────────────────────────────────────────────────────────────
// Shocktrooper — 36×46, redder, masked, spikes, taller silhouette
// ────────────────────────────────────────────────────────────────────
function buildEnemyShock(g: G, p: Pal): void {
  void p;
  const W = 40;
  const H = 48;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();

  g.fillStyle(0x000000, 0.45).fillEllipse(cx, H - 5, 28, 8);

  // Legs
  g.fillStyle(0x301008, 1).fillRect(cx - 5, cy + 8, 4, 8);
  g.fillStyle(0x301008, 1).fillRect(cx + 1, cy + 8, 4, 8);

  // Torso — armored, red-orange
  g.fillStyle(0x000000, 0.6).fillEllipse(cx, cy + 2, 26, 26);
  g.fillStyle(0x4d1808, 1).fillEllipse(cx, cy + 1, 24, 24);
  g.fillStyle(0x983218, 1).fillEllipse(cx, cy, 19, 19);
  // Highlight
  g.fillStyle(0xc85040, 0.5).fillEllipse(cx - 3, cy - 3, 9, 8);

  // Chest plate riveted armor
  g.fillStyle(0x2a0808, 1).fillRect(cx - 8, cy - 4, 16, 12);
  g.fillStyle(0x4d1808, 1).fillRect(cx - 7, cy - 3, 14, 10);
  g.fillStyle(0x2a0808, 1).fillCircle(cx - 5, cy - 2, 0.9);
  g.fillStyle(0x2a0808, 1).fillCircle(cx + 5, cy - 2, 0.9);
  g.fillStyle(0x2a0808, 1).fillCircle(cx - 5, cy + 5, 0.9);
  g.fillStyle(0x2a0808, 1).fillCircle(cx + 5, cy + 5, 0.9);

  // Shoulder spikes (more aggressive)
  g.fillStyle(0x2a0808, 1).fillTriangle(cx - 14, cy + 1, cx - 11, cy - 8, cx - 6, cy);
  g.fillStyle(0x2a0808, 1).fillTriangle(cx + 6, cy, cx + 11, cy - 8, cx + 14, cy + 1);
  g.fillStyle(0x602020, 1).fillTriangle(cx - 12.5, cy, cx - 11, cy - 5, cx - 8, cy);
  g.fillStyle(0x602020, 1).fillTriangle(cx + 8, cy, cx + 11, cy - 5, cx + 12.5, cy);

  // Arms
  g.fillStyle(0x2a0808, 1).fillEllipse(cx - 11, cy + 8, 5, 10);
  g.fillStyle(0x2a0808, 1).fillEllipse(cx + 11, cy + 8, 5, 10);
  g.fillStyle(0xa07050, 1).fillCircle(cx - 11, cy + 13, 2.8);
  g.fillStyle(0xa07050, 1).fillCircle(cx + 11, cy + 13, 2.8);

  // Head — iron mask
  g.fillStyle(0x000000, 0.6).fillCircle(cx, cy - 10, 8);
  g.fillStyle(0x1a1a1a, 1).fillCircle(cx, cy - 10, 7.4);
  g.fillStyle(0x4a4a4a, 1).fillCircle(cx, cy - 10, 6.2);
  g.fillStyle(0x70747a, 0.8).fillEllipse(cx - 2, cy - 12, 4, 3);
  // Eye-slit glowing red
  g.fillStyle(0xff2828, 1).fillRect(cx - 4, cy - 10.5, 8, 2);
  g.fillStyle(0xfff0a0, 0.85).fillRect(cx - 3, cy - 10, 6, 0.8);
  // Mouth grill bolts
  g.fillStyle(0x1a1a1a, 1).fillRect(cx - 3, cy - 7, 6, 2);
  g.fillStyle(0x60646a, 1).fillRect(cx - 2.5, cy - 6.5, 1, 1);
  g.fillStyle(0x60646a, 1).fillRect(cx - 0.5, cy - 6.5, 1, 1);
  g.fillStyle(0x60646a, 1).fillRect(cx + 1.5, cy - 6.5, 1, 1);

  g.generateTexture("tex_enemy_shock", W, H);
  g.clear();
}

// ────────────────────────────────────────────────────────────────────
// Heavy — 52×58, hulking armored bruiser
// ────────────────────────────────────────────────────────────────────
function buildEnemyHeavy(g: G, p: Pal): void {
  void p;
  const W = 56;
  const H = 60;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();

  g.fillStyle(0x000000, 0.5).fillEllipse(cx, H - 8, 40, 12);

  // Stocky legs
  g.fillStyle(0x080808, 1).fillRect(cx - 8, cy + 10, 6, 10);
  g.fillStyle(0x080808, 1).fillRect(cx + 2, cy + 10, 6, 10);
  g.fillStyle(0x32363c, 1).fillRect(cx - 7.5, cy + 11, 5, 8);
  g.fillStyle(0x32363c, 1).fillRect(cx + 2.5, cy + 11, 5, 8);

  // Torso
  g.fillStyle(0x000000, 0.7).fillCircle(cx, cy + 2, 17);
  g.fillStyle(0x141518, 1).fillCircle(cx, cy + 2, 16);
  g.fillStyle(0x32363c, 1).fillCircle(cx, cy + 2, 14);
  // Plate
  g.fillStyle(0x5a5e64, 1).fillRect(cx - 9, cy - 2, 18, 14);
  g.fillStyle(0x141518, 0.85).fillRect(cx - 9, cy - 2, 18, 1.4);
  g.fillStyle(0x141518, 0.85).fillRect(cx - 9, cy + 11, 18, 1.4);
  // Rivets
  for (const [rx, ry] of [
    [-7, 0], [7, 0], [-7, 4], [7, 4], [-7, 8], [7, 8],
  ] as const) {
    g.fillStyle(0x141518, 1).fillCircle(cx + rx, cy + ry, 1.2);
    g.fillStyle(0x70747a, 0.6).fillCircle(cx + rx, cy + ry - 0.4, 0.5);
  }
  // Center plate emblem
  g.fillStyle(0xff2828, 0.8).fillTriangle(cx, cy, cx - 3, cy + 6, cx + 3, cy + 6);
  g.fillStyle(0xffd870, 0.7).fillTriangle(cx, cy + 2, cx - 2, cy + 5, cx + 2, cy + 5);

  // Shoulder pauldrons + spikes
  g.fillStyle(0x080808, 1).fillCircle(cx - 14, cy, 6);
  g.fillStyle(0x080808, 1).fillCircle(cx + 14, cy, 6);
  g.fillStyle(0x32363c, 1).fillCircle(cx - 14, cy, 4.6);
  g.fillStyle(0x32363c, 1).fillCircle(cx + 14, cy, 4.6);
  g.fillStyle(0x080808, 1).fillTriangle(cx - 18, cy - 2, cx - 14, cy - 9, cx - 10, cy - 2);
  g.fillStyle(0x080808, 1).fillTriangle(cx + 10, cy - 2, cx + 14, cy - 9, cx + 18, cy - 2);

  // Arms
  g.fillStyle(0x080808, 1).fillEllipse(cx - 16, cy + 9, 6, 12);
  g.fillStyle(0x080808, 1).fillEllipse(cx + 16, cy + 9, 6, 12);
  // Knuckle plates
  g.fillStyle(0x32363c, 1).fillRect(cx - 18, cy + 14, 4, 3);
  g.fillStyle(0x32363c, 1).fillRect(cx + 14, cy + 14, 4, 3);

  // Helmet
  g.fillStyle(0x000000, 0.65).fillCircle(cx, cy - 12, 9);
  g.fillStyle(0x141518, 1).fillCircle(cx, cy - 12, 8.4);
  g.fillStyle(0x32363c, 1).fillCircle(cx, cy - 12, 7);
  // Helm crest
  g.fillStyle(0x080808, 1).fillTriangle(cx - 1.5, cy - 19, cx + 1.5, cy - 19, cx, cy - 22);
  // Eye slit
  g.fillStyle(0xff2828, 1).fillRect(cx - 5, cy - 13, 10, 2.4);
  g.fillStyle(0xffd0d0, 0.85).fillRect(cx - 4, cy - 12.5, 8, 1.1);
  // Mouth vent
  g.fillStyle(0x080808, 1).fillRect(cx - 4, cy - 8, 8, 1.6);
  g.fillStyle(0x60646a, 1).fillRect(cx - 3, cy - 7.7, 1, 1);
  g.fillStyle(0x60646a, 1).fillRect(cx + 0, cy - 7.7, 1, 1);
  g.fillStyle(0x60646a, 1).fillRect(cx + 2, cy - 7.7, 1, 1);

  g.generateTexture("tex_enemy_heavy", W, H);
  g.clear();
}

// ────────────────────────────────────────────────────────────────────
// Boss — 280×200 Reaper Lord with extended detail
// ────────────────────────────────────────────────────────────────────
function buildBoss(g: G, p: Pal): void {
  const W = 280;
  const H = 200;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();

  // Shadow blob
  g.fillStyle(0x000000, 0.55).fillEllipse(cx, H - 18, 200, 32);
  g.fillStyle(0x000000, 0.25).fillEllipse(cx, H - 12, 230, 40);

  // Outer dark mass
  g.fillStyle(0x080000, 1).fillEllipse(cx, cy, 252, 170);
  g.fillStyle(0x180404, 1).fillEllipse(cx, cy, 240, 160);
  g.fillStyle(p.boss, 1).fillEllipse(cx, cy, 224, 144);
  // Surface detailing (cracks/veins)
  g.fillStyle(0x080000, 0.4).fillEllipse(cx - 60, cy - 20, 28, 14);
  g.fillStyle(0x080000, 0.4).fillEllipse(cx + 70, cy + 15, 32, 16);

  // Glowing core layers
  g.fillStyle(0xff5050, 0.55).fillEllipse(cx, cy + 6, 150, 90);
  g.fillStyle(p.bossCore, 0.85).fillEllipse(cx, cy + 4, 120, 76);
  g.fillStyle(p.bossHighlight, 0.95).fillEllipse(cx, cy + 4, 84, 54);
  g.fillStyle(0xffd0d0, 1).fillEllipse(cx, cy + 4, 50, 32);
  g.fillStyle(0xffffff, 0.9).fillEllipse(cx, cy + 4, 22, 14);

  // Pupil
  g.fillStyle(0x101010, 1).fillEllipse(cx, cy + 4, 12, 7);
  g.fillStyle(0xff2828, 1).fillEllipse(cx, cy + 4, 6, 4);

  // Crown of spikes top
  for (let i = 0; i < 16; i++) {
    const x = 20 + i * 16;
    const h = 18 + Math.abs(Math.sin(i * 1.3)) * 14;
    g.fillStyle(0x080000, 1).fillTriangle(x - 4, 20, x + 4, 20, x, 20 - h);
    g.fillStyle(0x4a0814, 1).fillTriangle(x - 3, 20, x + 3, 20, x, 20 - h * 0.7);
  }

  // Tendrils radiating
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * PI * 2;
    const r1 = 70;
    const r2 = 108;
    const x1 = cx + Math.cos(a) * r1;
    const y1 = cy + Math.sin(a) * r1 * 0.7;
    const x2 = cx + Math.cos(a) * r2;
    const y2 = cy + Math.sin(a) * r2 * 0.7;
    g.lineStyle(5, p.bossCore, 0.8).lineBetween(x1, y1, x2, y2);
    g.lineStyle(3, 0xff8080, 0.9).lineBetween(x1, y1, (x1 + x2) / 2, (y1 + y2) / 2);
  }
  g.lineStyle(0, 0x000000, 0);

  // Side claws/fangs
  for (const xSide of [40, W - 40]) {
    g.fillStyle(0x080000, 1).fillTriangle(xSide, cy - 30, xSide + (xSide < cx ? 18 : -18), cy, xSide, cy + 30);
    g.fillStyle(0xc8b894, 0.85).fillTriangle(xSide + 4, cy - 18, xSide + (xSide < cx ? 14 : -14), cy, xSide + 4, cy + 18);
  }

  g.generateTexture("tex_boss", W, H);
  g.clear();
}

// ── Bullets ─────────────────────────────────────────────────────────
function buildBullet(g: G, p: Pal): void {
  const W = 10;
  const H = 20;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();
  // Trail glow
  g.fillStyle(p.bulletGlow, 0.5).fillEllipse(cx, cy + 3, 6, 16);
  // Body
  g.fillStyle(p.bulletGlow, 1).fillEllipse(cx, cy, 7, 14);
  g.fillStyle(p.bullet, 1).fillEllipse(cx, cy - 1, 4, 10);
  // Head highlight
  g.fillStyle(0xffffff, 0.95).fillEllipse(cx, cy - 4, 2, 4);
  g.generateTexture("tex_bullet", W, H);
  g.clear();
}

function buildEnemyBullet(g: G, p: Pal): void {
  const W = 12;
  const H = 18;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();
  g.fillStyle(0xff8050, 0.6).fillEllipse(cx, cy, 10, 16);
  g.fillStyle(p.enemyBullet, 1).fillEllipse(cx, cy, 6, 12);
  g.fillStyle(0xfff0c0, 0.85).fillEllipse(cx, cy + 3, 2, 4);
  g.generateTexture("tex_enemy_bullet", W, H);
  g.clear();
}

function buildMuzzleFlash(g: G, p: Pal): void {
  const W = 22;
  const H = 28;
  const cx = W / 2;
  const cy = H / 2;
  g.clear();
  // 4-point star
  g.fillStyle(p.muzzleFlash, 0.55).fillEllipse(cx, cy, 20, 26);
  g.fillStyle(p.muzzleFlash, 0.95).fillEllipse(cx, cy, 12, 18);
  g.fillStyle(0xffffff, 1).fillEllipse(cx, cy, 6, 10);
  // Side rays
  g.fillStyle(p.muzzleFlash, 0.65).fillTriangle(cx - 11, cy, cx, cy - 4, cx, cy + 4);
  g.fillStyle(p.muzzleFlash, 0.65).fillTriangle(cx + 11, cy, cx, cy - 4, cx, cy + 4);
  g.generateTexture("tex_muzzle_flash", W, H);
  g.clear();
}

// ── Particles ───────────────────────────────────────────────────────
function buildHitSpark(g: G, p: Pal): void {
  const W = 10;
  const H = 10;
  g.clear();
  g.fillStyle(p.hitSpark, 1).fillCircle(W / 2, H / 2, 4);
  g.fillStyle(0xffffff, 0.95).fillCircle(W / 2, H / 2, 2);
  g.generateTexture("tex_hit_spark", W, H);
  g.clear();
}

function buildSmokePuff(g: G, p: Pal): void {
  const W = 22;
  const H = 22;
  g.clear();
  g.fillStyle(p.smoke, 0.5).fillCircle(W / 2, H / 2, 10);
  g.fillStyle(p.smoke, 0.85).fillCircle(W / 2, H / 2, 6);
  g.fillStyle(0x808080, 0.4).fillCircle(W / 2 - 2, H / 2 - 2, 3);
  g.generateTexture("tex_smoke", W, H);
  g.clear();
}

// ── Asphalt lane tile ───────────────────────────────────────────────
function buildLaneTile(g: G, p: Pal): void {
  const W = 256;
  const H = 256;
  g.clear();
  // Base
  g.fillStyle(p.asphalt, 1).fillRect(0, 0, W, H);
  // Tar splotches
  g.fillStyle(0x14161a, 0.6).fillEllipse(45, 80, 30, 18);
  g.fillStyle(0x14161a, 0.5).fillEllipse(180, 200, 40, 22);
  g.fillStyle(0x14161a, 0.5).fillEllipse(220, 60, 24, 14);
  // Lighter bumps
  g.fillStyle(p.asphaltLight, 0.18).fillCircle(40, 80, 26);
  g.fillStyle(p.asphaltLight, 0.16).fillCircle(170, 160, 32);
  g.fillStyle(p.asphaltLight, 0.2).fillCircle(220, 30, 20);
  // Cracks
  g.lineStyle(1.5, 0x000000, 0.55).lineBetween(0, 50, W, 58);
  g.lineStyle(1, 0x000000, 0.4).lineBetween(W / 2 + 30, 0, W / 2 + 40, H);
  g.lineStyle(1, 0x000000, 0.35).lineBetween(60, 110, 110, 200);
  g.lineStyle(0, 0x000000, 0);
  // Yellow center stripe (dashes)
  for (let y = 16; y < H; y += 64) {
    g.fillStyle(0x000000, 0.4).fillRect(W / 2 - 4, y + 1, 8, 30);
    g.fillStyle(p.laneMark, 0.9).fillRect(W / 2 - 3, y, 6, 28);
    g.fillStyle(0xfff0a0, 0.5).fillRect(W / 2 - 3, y, 6, 4);
  }
  // White edge dashes
  for (let y = 0; y < H; y += 32) {
    g.fillStyle(0xc8c8b8, 0.4).fillRect(8, y, 3, 18);
    g.fillStyle(0xc8c8b8, 0.4).fillRect(W - 11, y, 3, 18);
  }
  g.generateTexture("tex_lane_tile", W, H);
  g.clear();
}

function buildLaneEdge(g: G, p: Pal): void {
  const W = 80;
  const H = 256;
  g.clear();
  // Gradient curb base
  g.fillStyle(0x0a0a0c, 1).fillRect(0, 0, W, H);
  g.fillStyle(p.laneEdge, 1).fillRect(8, 0, W - 8, H);
  g.fillStyle(p.laneEdgeHi, 1).fillRect(W - 8, 0, 4, H);
  g.fillStyle(p.laneEdgeHi, 0.5).fillRect(W - 14, 0, 2, H);
  // Concrete texture
  g.fillStyle(0x4a4d52, 0.3).fillCircle(30, 40, 8);
  g.fillStyle(0x4a4d52, 0.3).fillCircle(50, 120, 10);
  g.fillStyle(0x4a4d52, 0.3).fillCircle(38, 200, 7);
  // Rivets
  for (let y = 24; y < H; y += 48) {
    g.fillStyle(0x080808, 1).fillCircle(W - 30, y, 3.5);
    g.fillStyle(0x141518, 1).fillCircle(W - 30, y, 2.5);
    g.fillStyle(0x70747a, 0.8).fillCircle(W - 30, y - 1, 1.2);
  }
  g.generateTexture("tex_lane_edge", W, H);
  g.clear();
}

// ── Gate frame (tintable) ───────────────────────────────────────────
function buildGateFrame(g: G): void {
  const W = 220;
  const H = 110;
  g.clear();

  // Cross-bar shadow
  g.fillStyle(0x000000, 0.45).fillRect(8, 24, W - 16, 14);
  // Cross-bar
  g.fillStyle(0xffffff, 1).fillRect(8, 8, W - 16, 18);
  g.fillStyle(0xffffff, 0.3).fillRect(8, 8, W - 16, 5);
  g.fillStyle(0x000000, 0.25).fillRect(8, 23, W - 16, 3);

  // Left pylon
  g.fillStyle(0xffffff, 1).fillRect(6, 8, 18, H - 16);
  g.fillStyle(0xffffff, 0.3).fillRect(6, 8, 5, H - 16);
  g.fillStyle(0x000000, 0.3).fillRect(19, 8, 5, H - 16);
  // Right pylon
  g.fillStyle(0xffffff, 1).fillRect(W - 24, 8, 18, H - 16);
  g.fillStyle(0xffffff, 0.3).fillRect(W - 24, 8, 5, H - 16);
  g.fillStyle(0x000000, 0.3).fillRect(W - 11, 8, 5, H - 16);

  // Pylon top caps
  g.fillStyle(0xffffff, 1).fillRect(0, 0, 30, 10);
  g.fillStyle(0xffffff, 1).fillRect(W - 30, 0, 30, 10);
  g.fillStyle(0x000000, 0.3).fillRect(0, 9, 30, 1.5);
  g.fillStyle(0x000000, 0.3).fillRect(W - 30, 9, 30, 1.5);

  // Pylon bases
  g.fillStyle(0xffffff, 1).fillRect(2, H - 8, 26, 8);
  g.fillStyle(0xffffff, 1).fillRect(W - 28, H - 8, 26, 8);
  g.fillStyle(0x000000, 0.45).fillRect(2, H - 4, 26, 4);
  g.fillStyle(0x000000, 0.45).fillRect(W - 28, H - 4, 26, 4);

  // Warning stripes on crossbar
  for (let x = 14; x < W - 14; x += 16) {
    g.fillStyle(0x000000, 0.45).fillTriangle(x, 8, x + 8, 8, x + 4, 26);
  }

  g.generateTexture("tex_gate_frame", W, H);
  g.clear();
}

// ── Weapon crate ────────────────────────────────────────────────────
function buildWeaponCrate(g: G): void {
  const W = 120;
  const H = 72;
  g.clear();

  // Drop-shadow
  g.fillStyle(0x000000, 0.5).fillEllipse(W / 2, H - 4, 100, 10);

  // Wooden crate body
  g.fillStyle(0x2a1810, 1).fillRect(2, 6, W - 4, H - 14);
  g.fillStyle(0x5a3818, 1).fillRect(4, 8, W - 8, H - 18);
  // Plank highlights
  g.fillStyle(0x7a5028, 0.7).fillRect(4, 8, W - 8, 4);
  g.fillStyle(0x141008, 0.5).fillRect(4, H - 14, W - 8, 2);
  // Plank vertical seams
  for (let x = 22; x < W - 8; x += 22) {
    g.fillStyle(0x141008, 0.7).fillRect(x, 8, 1.5, H - 18);
  }
  // Metal reinforcement bands
  g.fillStyle(0x32363c, 1).fillRect(2, 14, W - 4, 4);
  g.fillStyle(0x32363c, 1).fillRect(2, H - 22, W - 4, 4);
  g.fillStyle(0x70747a, 0.8).fillRect(2, 14, W - 4, 1);
  g.fillStyle(0x70747a, 0.8).fillRect(2, H - 22, W - 4, 1);
  // Corner bolts
  for (const [bx, by] of [
    [6, 14], [W - 8, 14], [6, H - 22], [W - 8, H - 22],
  ] as const) {
    g.fillStyle(0x141518, 1).fillCircle(bx, by + 2, 2);
    g.fillStyle(0x80848a, 0.8).fillCircle(bx, by + 1.4, 0.7);
  }
  // Stencil "AMMO"
  g.fillStyle(0xe8c948, 0.85).fillRect(W / 2 - 26, H / 2 - 4, 52, 12);
  g.fillStyle(0x141008, 1).fillRect(W / 2 - 24, H / 2 - 2, 48, 8);
  // Weapon icon hint glow
  g.fillStyle(0xffd870, 0.4).fillCircle(W / 2, H / 2, 16);

  g.generateTexture("tex_weapon_crate", W, H);
  g.clear();
}

// ── Vignette overlay for screen darken at edges ─────────────────────
function buildVignette(g: G): void {
  const W = 720;
  const H = 1280;
  g.clear();
  // Approximate radial darken with concentric ellipses
  for (let i = 0; i < 8; i++) {
    const t = 1 - i / 8;
    g.fillStyle(0x000000, 0.08 * t).fillEllipse(W / 2, H / 2, W * (1 + i * 0.05), H * (1 + i * 0.05));
  }
  // Border darken
  const border = 50;
  g.fillStyle(0x000000, 0.6).fillRect(0, 0, W, border);
  g.fillStyle(0x000000, 0.6).fillRect(0, H - border, W, border);
  g.fillStyle(0x000000, 0.6).fillRect(0, 0, border, H);
  g.fillStyle(0x000000, 0.6).fillRect(W - border, 0, border, H);
  g.generateTexture("tex_vignette", W, H);
  g.clear();
}

export function buildAllTextures(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const p = GAME_CONFIG.palette;

  // Environment + FX still procedural (cheap, no asset bloat).
  buildLaneTile(g, p);
  buildLaneEdge(g, p);
  buildBoss(g, p);           // Boss is still procedural — 280×144 mutant
  buildBullet(g, p);
  buildEnemyBullet(g, p);
  buildMuzzleFlash(g, p);
  buildHitSpark(g, p);
  buildSmokePuff(g, p);
  buildGateFrame(g);
  buildWeaponCrate(g);
  buildVignette(g);

  // Characters (player/grunt/shock/heavy) come from the 3D-rendered atlas
  // loaded by PreloadScene via this.load.atlas("sprites", ...).
  // We still keep the procedural builders below as a fallback / reference,
  // but they are no longer invoked.
  void buildPlayerSoldier;
  void buildEnemySoldier;
  void buildEnemyShock;
  void buildEnemyHeavy;

  g.destroy();
}
