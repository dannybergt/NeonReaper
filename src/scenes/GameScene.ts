import Phaser from "phaser";
import { GAME_CONFIG } from "@/config/game";
import {
  addWeapon,
  applyTroopDelta,
  createSquad,
  damagePerVolley,
  isDefeated,
  type SquadState,
} from "@/systems/Squad";
import {
  createEnemyGroup,
  type EnemyGroupRuntime,
  type EnemyTier,
} from "@/systems/EnemyGroup";
import { resolveCombatTick } from "@/systems/Combat";
import { applyGate, gateVisual, type GateRuntime, type GateSpec } from "@/systems/Gates";
import { buildWave1, type Wave } from "@/systems/Waves";
import { planShot, tryFire, WEAPON_SPECS, type WeaponId } from "@/systems/Weapons";
import { createWeaponCrate, damageCrate, type WeaponCrateRuntime, type WeaponCrateSpec } from "@/systems/WeaponCrate";

type Bullet = Phaser.Physics.Arcade.Sprite & { dmg?: number };
type EnemyBullet = Phaser.Physics.Arcade.Sprite;

interface EnemyVisual {
  group: EnemyGroupRuntime;
  troopSprites: Phaser.GameObjects.Sprite[];
  countLabel: Phaser.GameObjects.Text;
}

interface GateVisualHandle {
  runtime: GateRuntime;
  container: Phaser.GameObjects.Container;
  body: Phaser.Physics.Arcade.Body;
  zone: Phaser.GameObjects.Rectangle;
}

interface BossHandle {
  sprite: Phaser.GameObjects.Sprite;
  hp: number;
  maxHp: number;
  fireTimerMs: number;
}

interface CrateVisual {
  runtime: WeaponCrateRuntime;
  container: Phaser.GameObjects.Container;
  hpBar: Phaser.GameObjects.Rectangle;
  hpBarBg: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
}

export class GameScene extends Phaser.Scene {
  private squad!: SquadState;
  private squadAnchor!: Phaser.GameObjects.Container;
  private troopSprites: Phaser.GameObjects.Sprite[] = [];

  private laneTile!: Phaser.GameObjects.TileSprite;
  private leftEdge!: Phaser.GameObjects.TileSprite;
  private rightEdge!: Phaser.GameObjects.TileSprite;

  private bullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<"A" | "D", Phaser.Input.Keyboard.Key>;
  private pointerActive = false;
  private targetX = 0;

  private wave!: Wave;
  private waveCursor = 0;
  private scrolledPx = 0;
  private scrollSpeed = GAME_CONFIG.lane.scrollSpeed;

  private enemies: EnemyVisual[] = [];
  private gates: GateVisualHandle[] = [];
  private crates: CrateVisual[] = [];
  private boss: BossHandle | null = null;
  private bossActive = false;

  private elapsedMs = 0;
  private nextCombatTickAt = 0;
  private dead = false;
  private waveCleared = false;

  private hudSquad!: Phaser.GameObjects.Text;
  private hudDamage!: Phaser.GameObjects.Text;
  private hudWave!: Phaser.GameObjects.Text;
  private hudCenter!: Phaser.GameObjects.Text;
  private hudWeapons!: Phaser.GameObjects.Text;
  private bossHpBg!: Phaser.GameObjects.Rectangle;
  private bossHpBar!: Phaser.GameObjects.Rectangle;
  private bossLabel!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "GameScene" });
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(GAME_CONFIG.palette.bg);

    this.dead = false;
    this.waveCleared = false;
    this.elapsedMs = 0;
    this.nextCombatTickAt = 0;
    this.scrolledPx = 0;
    this.scrollSpeed = GAME_CONFIG.lane.scrollSpeed;
    this.boss = null;
    this.bossActive = false;
    this.enemies = [];
    this.gates = [];
    this.crates = [];

    this.squad = createSquad(
      GAME_CONFIG.squad.startTroops,
      GAME_CONFIG.squad.fireRateMs,
      GAME_CONFIG.squad.bulletSpeed,
    );

    this.wave = buildWave1();
    this.waveCursor = 0;

    // Background lane tile
    this.laneTile = this.add.tileSprite(width / 2, height / 2, width, height, "tex_lane_tile");
    this.laneTile.setDepth(-100);
    this.leftEdge = this.add.tileSprite(40, height / 2, 80, height, "tex_lane_edge").setDepth(-90);
    this.rightEdge = this.add
      .tileSprite(width - 40, height / 2, 80, height, "tex_lane_edge")
      .setDepth(-90)
      .setFlipX(true);

    // Side walls cover the area outside the lane (visual masking)
    const wallColor = 0x101113;
    this.add.rectangle(0, height / 2, width / 2 - GAME_CONFIG.lane.width / 2 - 40, height, wallColor)
      .setOrigin(0, 0.5)
      .setDepth(-95);
    this.add
      .rectangle(width, height / 2, width / 2 - GAME_CONFIG.lane.width / 2 - 40, height, wallColor)
      .setOrigin(1, 0.5)
      .setDepth(-95);

    // Squad anchor
    const anchorX = width / 2;
    const anchorY = height - GAME_CONFIG.squad.yOffsetFromBottom;
    this.squadAnchor = this.add.container(anchorX, anchorY);
    this.targetX = anchorX;
    this.troopSprites = [];
    this.rebuildTroopSprites();

    // Vignette on top of everything below HUD
    this.add.image(width / 2, height / 2, "tex_vignette").setDepth(900).setAlpha(0.85);

    // Physics groups
    this.bullets = this.physics.add.group({ runChildUpdate: false });
    this.enemyBullets = this.physics.add.group({ runChildUpdate: false });

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      A: Phaser.Input.Keyboard.KeyCodes.A,
      D: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Record<"A" | "D", Phaser.Input.Keyboard.Key>;
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.pointerActive = true;
      this.targetX = pointer.x;
    });
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.pointerActive) this.targetX = pointer.x;
    });
    this.input.on("pointerup", () => {
      this.pointerActive = false;
    });
    this.input.keyboard?.on("keydown-ESC", () => this.scene.start("MenuScene"));

    this.buildHud();
    this.updateHudText();
  }

  override update(_time: number, deltaMs: number): void {
    if (this.dead) return;
    this.elapsedMs += deltaMs;
    const dt = deltaMs / 1000;

    this.handleInput();
    this.scrollWorld(dt);
    this.spawnFromWaveSchedule();
    this.advanceEntities(dt);
    this.handleAutoFire();
    this.handleEnemyCombat();
    this.handleGateOverlap();
    this.handleBoss(deltaMs);
    this.cullProjectiles();
    this.cleanupOffscreen();

    if (isDefeated(this.squad)) {
      this.endRunLoss();
    } else if (this.waveCleared && this.enemies.length === 0 && !this.bossActive) {
      this.endRunWin();
    }
  }

  // ── Squad rendering ─────────────────────────────────────────────────

  private rebuildTroopSprites(): void {
    const visualN = Math.min(this.squad.troops, GAME_CONFIG.squad.visualTroopCap);
    while (this.troopSprites.length < visualN) {
      const shadow = this.add.image(0, 12, "tex_drop_shadow");
      shadow.setScale(0.45, 0.35);
      this.squadAnchor.add(shadow);
      const sprite = this.add.sprite(0, 0, "sprites", "player_00");
      sprite.setScale(0.7);
      sprite.play({ key: "walk_player", startFrame: Math.floor(Math.random() * 8) });
      sprite.setData("shadow", shadow);
      this.squadAnchor.add(sprite);
      this.troopSprites.push(sprite);
    }
    while (this.troopSprites.length > visualN) {
      const s = this.troopSprites.pop();
      const shadow = s?.getData("shadow") as Phaser.GameObjects.Image | undefined;
      shadow?.destroy();
      s?.destroy();
    }
    this.layoutTroopFormation();
  }

  private layoutTroopFormation(): void {
    const n = this.troopSprites.length;
    if (n === 0) return;
    const cols = Math.min(GAME_CONFIG.squad.formationMaxCols, Math.ceil(Math.sqrt(n)));
    const rows = Math.ceil(n / cols);
    const gap = GAME_CONFIG.squad.minTroopGapPx;
    const w = (cols - 1) * gap;
    const h = (rows - 1) * gap;
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const x = -w / 2 + c * gap;
      const y = -h / 2 + r * gap;
      const s = this.troopSprites[i]!;
      s.setPosition(x, y);
      const shadow = s.getData("shadow") as Phaser.GameObjects.Image | undefined;
      shadow?.setPosition(x, y + 12);
    }
  }

  // ── Movement ────────────────────────────────────────────────────────

  private handleInput(): void {
    const { width } = this.scale;
    const half = GAME_CONFIG.lane.width / 2;
    const minX = width / 2 - half;
    const maxX = width / 2 + half;
    if (this.cursors.left?.isDown || this.wasd.A.isDown) this.targetX -= 8;
    if (this.cursors.right?.isDown || this.wasd.D.isDown) this.targetX += 8;
    this.targetX = Phaser.Math.Clamp(this.targetX, minX, maxX);
    const newX = Phaser.Math.Linear(this.squadAnchor.x, this.targetX, GAME_CONFIG.squad.targetXLerp);
    this.squadAnchor.x = newX;
  }

  // ── World scroll ────────────────────────────────────────────────────

  private scrollWorld(dt: number): void {
    const sp = this.bossActive ? GAME_CONFIG.lane.bossScrollSlowdown : this.scrollSpeed;
    if (sp <= 0) return;
    const delta = sp * dt;
    this.scrolledPx += delta;
    this.laneTile.tilePositionY -= delta;
    this.leftEdge.tilePositionY -= delta;
    this.rightEdge.tilePositionY -= delta;
  }

  // ── Wave schedule ───────────────────────────────────────────────────

  private spawnFromWaveSchedule(): void {
    const { height } = this.scale;
    const spawnY = -120;
    while (
      this.waveCursor < this.wave.events.length &&
      this.wave.events[this.waveCursor]!.distance <= this.scrolledPx
    ) {
      const ev = this.wave.events[this.waveCursor]!;
      if (ev.kind === "gatePair" && ev.gates) {
        this.spawnGatePair(ev.gates, spawnY);
      } else if (ev.kind === "enemyGroup" && ev.enemy) {
        this.spawnEnemyGroup(ev.enemy.tier, ev.enemy.troops, ev.enemy.laneX, spawnY);
      } else if (ev.kind === "weaponCrate" && ev.crate) {
        this.spawnWeaponCrate(ev.crate, spawnY);
      } else if (ev.kind === "boss" && ev.bossHp) {
        this.spawnBoss(ev.bossHp);
      }
      this.waveCursor++;
    }
    if (this.waveCursor >= this.wave.events.length && !this.bossActive && this.enemies.length === 0 && this.crates.length === 0) {
      this.waveCleared = true;
    }
    void height;
  }

  private spawnWeaponCrate(spec: WeaponCrateSpec, worldY: number): void {
    const runtime = createWeaponCrate(spec, worldY);
    const { width } = this.scale;
    const cx = width / 2 + spec.laneX;
    const container = this.add.container(cx, worldY);
    const frame = this.add.image(0, 0, "tex_weapon_crate");
    const label = this.add
      .text(0, 0, WEAPON_SPECS[spec.drop].label, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setShadow(0, 2, "#000000", 4, true, true);
    const hpBarBg = this.add.rectangle(0, 40, 80, 6, 0x14142a).setOrigin(0.5, 0.5);
    const hpBar = this.add.rectangle(-40, 40, 80, 6, 0xff8c2b).setOrigin(0, 0.5);
    container.add([frame, label, hpBarBg, hpBar]);
    container.setDepth(7);
    this.crates.push({ runtime, container, hpBar, hpBarBg, label });
  }

  private spawnEnemyGroup(tier: EnemyTier, troops: number, laneX: number, worldY: number): void {
    const group = createEnemyGroup({ tier, troops, laneX }, worldY);
    const cx = this.scale.width / 2 + laneX;
    const troopSprites: Phaser.GameObjects.Sprite[] = [];
    const visualN = Math.min(troops, 24);
    const cols = Math.min(5, Math.max(2, Math.ceil(Math.sqrt(visualN))));
    const rows = Math.ceil(visualN / cols);
    const gap = tier === "heavy" ? 50 : 40;
    const animKey = `walk_${tier === "shocktrooper" ? "shock" : tier}`;
    const firstFrame = `${tier === "shocktrooper" ? "shock" : tier}_00`;
    const scale = tier === "heavy" ? 1.05 : tier === "shocktrooper" ? 0.85 : 0.72;
    const tint = tier === "heavy" ? 0x808a80 : tier === "shocktrooper" ? 0xffb0a0 : 0xffffff;
    for (let i = 0; i < visualN; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const x = cx + (c - (cols - 1) / 2) * gap;
      const y = worldY + (r - (rows - 1) / 2) * gap;
      const shadow = this.add.image(x, y + 14 * scale, "tex_drop_shadow");
      shadow.setScale(0.5 * scale, 0.4 * scale);
      shadow.setDepth(9);
      const s = this.add.sprite(x, y, "sprites", firstFrame);
      s.setScale(scale);
      s.setDepth(10);
      s.setTint(tint);
      s.play({ key: animKey, startFrame: Math.floor(Math.random() * 8) });
      s.setData("shadow", shadow);
      troopSprites.push(s);
    }
    const countLabel = this.add
      .text(cx, worldY - rows * gap / 2 - 22, `${troops}`, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "26px",
        color: "#f0e8c8",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(11)
      .setShadow(0, 2, "#000000", 5, true, true);
    this.enemies.push({ group, troopSprites, countLabel });
  }

  private spawnGatePair(gates: [GateSpec, GateSpec], worldY: number): void {
    const { width } = this.scale;
    const cx = width / 2;
    const offsets = [-GAME_CONFIG.gate.pairOffsetX, GAME_CONFIG.gate.pairOffsetX];
    for (let i = 0; i < 2; i++) {
      const spec = gates[i]!;
      const v = gateVisual(spec, GAME_CONFIG.palette);
      const x = cx + offsets[i]!;
      const y = worldY;
      const container = this.add.container(x, y);
      const frame = this.add.image(0, 0, "tex_gate_frame");
      frame.setTint(v.edgeColor);
      const fill = this.add.rectangle(
        0,
        12,
        GAME_CONFIG.gate.width - 36,
        GAME_CONFIG.gate.height - 36,
        v.fillColor,
        0.7,
      );
      const label = this.add
        .text(0, 14, v.label, {
          fontFamily: "system-ui, sans-serif",
          fontSize: "30px",
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setShadow(0, 2, "#000000", 4, true, true);
      container.add([fill, frame, label]);
      container.setDepth(5);

      const zone = this.add.rectangle(x, y + 12, GAME_CONFIG.gate.width - 50, GAME_CONFIG.gate.height - 30, 0xffffff, 0);
      this.physics.add.existing(zone);
      const body = zone.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(false);
      this.gates.push({
        runtime: { spec, laneX: offsets[i]!, worldY, consumed: false },
        container,
        body,
        zone,
      });
    }
  }

  private spawnBoss(hp: number): void {
    if (this.boss) return;
    const { width } = this.scale;
    // Pulsing red aura behind the boss
    const aura = this.add.image(width / 2, -80, "tex_boss_aura");
    aura.setDepth(19);
    aura.setBlendMode(Phaser.BlendModes.ADD);
    aura.setScale(1.4);
    // 3D-rendered character sprite on top (zombieMaleA, scaled big + dark tint)
    const sprite = this.add.sprite(width / 2, -80, "sprites", "boss");
    sprite.setScale(3.0);
    sprite.setTint(0xff8080);
    sprite.setDepth(20);
    sprite.setData("aura", aura);
    this.boss = { sprite, hp, maxHp: hp, fireTimerMs: 0 };
    this.bossActive = true;
    this.bossLabel.setVisible(true);
    this.bossHpBg.setVisible(true);
    this.bossHpBar.setVisible(true);

    this.tweens.add({
      targets: [sprite, aura],
      y: 220,
      duration: 1400,
      ease: "Sine.easeOut",
    });
    this.tweens.add({
      targets: sprite,
      scale: { from: 3.0, to: 3.15 },
      duration: 900,
      yoyo: true,
      repeat: -1,
    });
    this.tweens.add({
      targets: aura,
      alpha: { from: 0.85, to: 0.45 },
      scale: { from: 1.4, to: 1.6 },
      duration: 1100,
      yoyo: true,
      repeat: -1,
    });
    this.cameras.main.flash(380, 120, 0, 40);
    this.cameras.main.shake(280, 0.01);
  }

  // ── Entities update ─────────────────────────────────────────────────

  private advanceEntities(dt: number): void {
    const dy = (this.bossActive ? GAME_CONFIG.lane.bossScrollSlowdown : this.scrollSpeed) * dt;
    // Enemies and gates "scroll down" relative to the camera; their world-y grows.
    for (const e of this.enemies) {
      e.group.worldY += dy;
      e.countLabel.y += dy;
      for (const s of e.troopSprites) {
        s.y += dy;
        const shadow = s.getData("shadow") as Phaser.GameObjects.Image | undefined;
        if (shadow) shadow.y += dy;
      }
    }
    for (const g of this.gates) {
      g.container.y += dy;
      g.zone.y += dy;
      g.body.position.y += dy;
    }
    for (const c of this.crates) {
      c.runtime.worldY += dy;
      c.container.y += dy;
    }
  }

  private handleAutoFire(): void {
    if (this.squad.troops <= 0) return;
    const sprites = this.troopSprites;
    if (sprites.length === 0) return;
    const cap = Math.min(sprites.length, 14);

    // Each weapon fires on its own cooldown. Soldiers are split across weapons
    // round-robin so multiple weapon types contribute to the visible salvo.
    for (let wi = 0; wi < this.squad.weapons.length; wi++) {
      const weapon = this.squad.weapons[wi]!;
      if (!tryFire(weapon, this.elapsedMs)) continue;
      const plans = planShot(weapon.spec);
      const tier = this.squad.damageTier;
      for (let i = 0; i < cap; i++) {
        if (i % this.squad.weapons.length !== wi) continue;
        const sprite = sprites[i]!;
        const wx = this.squadAnchor.x + sprite.x;
        const wy = this.squadAnchor.y + sprite.y - 6;
        for (const plan of plans) {
          const b = this.bullets.create(wx, wy, "tex_bullet") as Bullet;
          b.dmg = plan.damage * tier;
          b.setData("spawnedAt", this.elapsedMs);
          b.setTint(plan.tint);
          b.setRotation(plan.angle + Math.PI / 2);
          b.setVelocity(Math.cos(plan.angle) * plan.speed, Math.sin(plan.angle) * plan.speed);
        }
        this.muzzleFlashAt(wx, wy - 6, weapon.spec.tint);
      }
    }
  }

  private muzzleFlashAt(x: number, y: number, tint?: number): void {
    const f = this.add.image(x, y, "tex_muzzle_flash");
    f.setDepth(50);
    f.setBlendMode(Phaser.BlendModes.ADD);
    if (tint !== undefined) f.setTint(tint);
    this.tweens.add({
      targets: f,
      alpha: { from: 1, to: 0 },
      scaleY: { from: 1, to: 1.6 },
      duration: 70,
      onComplete: () => f.destroy(),
    });
  }

  // ── Combat & collisions ─────────────────────────────────────────────

  private handleEnemyCombat(): void {
    // Hit-test bullets vs enemy groups / crates / boss.
    // Enemies and crates are only hittable once they're at least at the top edge
    // of the viewport, so they don't get killed off-screen.
    const VIS_Y_MIN = -20;
    for (const bullet of this.bullets.getChildren() as Bullet[]) {
      if (!bullet.active) continue;

      // Bullets vs weapon crates (priority — physical block in lane)
      let consumed = false;
      for (const c of this.crates) {
        if (c.runtime.consumed) continue;
        if (c.runtime.worldY < VIS_Y_MIN) continue;
        const dx = bullet.x - c.container.x;
        const dy = bullet.y - c.runtime.worldY;
        if (Math.abs(dx) < 56 && Math.abs(dy) < 36) {
          const opened = damageCrate(c.runtime, bullet.dmg ?? 1);
          this.hitSparkAt(bullet.x, bullet.y);
          bullet.destroy();
          consumed = true;
          if (opened) this.openCrate(c);
          break;
        }
      }
      if (consumed) continue;

      // Bullets vs enemy groups
      for (const e of this.enemies) {
        if (!e.group.alive) continue;
        if (e.group.worldY < VIS_Y_MIN) continue;
        const cx = this.scale.width / 2 + e.group.spec.laneX;
        const dx = bullet.x - cx;
        const dy = bullet.y - e.group.worldY;
        if (Math.abs(dx) < 72 && Math.abs(dy) < 72) {
          const dmg = bullet.dmg ?? 1;
          e.group.troops -= dmg;
          this.hitSparkAt(bullet.x, bullet.y);
          bullet.destroy();
          if (e.group.troops <= 0) {
            e.group.alive = false;
            this.deathSmokeAt(cx, e.group.worldY);
          }
          consumed = true;
          break;
        }
      }
      if (consumed) continue;

      // Bullets vs boss
      if (this.boss && this.bossActive) {
        const bs = this.boss.sprite;
        if (Math.abs(bullet.x - bs.x) < bs.displayWidth / 2 && Math.abs(bullet.y - bs.y) < bs.displayHeight / 2) {
          this.boss.hp -= (bullet.dmg ?? 1);
          this.hitSparkAt(bullet.x, bullet.y);
          bullet.destroy();
          if (this.boss.hp <= 0) this.killBoss();
        }
      }
    }

    // Enemy bullets vs squad
    for (const eb of this.enemyBullets.getChildren() as EnemyBullet[]) {
      if (!eb.active) continue;
      const sx = this.squadAnchor.x;
      const sy = this.squadAnchor.y;
      const formationRadius = 60;
      if (Math.abs(eb.x - sx) < formationRadius && Math.abs(eb.y - sy) < formationRadius) {
        applyTroopDelta(this.squad, -GAME_CONFIG.boss.bulletDamagePerHit);
        this.hitSparkAt(eb.x, eb.y);
        eb.destroy();
        this.rebuildTroopSprites();
        this.updateHudText();
      }
    }

    // Squad-vs-enemy melee when groups overlap
    if (this.elapsedMs >= this.nextCombatTickAt) {
      this.nextCombatTickAt = this.elapsedMs + GAME_CONFIG.enemy.combatTickMs;
      const sx = this.squadAnchor.x;
      const sy = this.squadAnchor.y;
      for (const e of this.enemies) {
        if (!e.group.alive) continue;
        const cx = this.scale.width / 2 + e.group.spec.laneX;
        if (Math.abs(sx - cx) < 80 && Math.abs(sy - e.group.worldY) < 90) {
          resolveCombatTick(this.squad, e.group, GAME_CONFIG.enemy.combatDmgPerTroopPerTick);
          this.rebuildTroopSprites();
          this.updateHudText();
          if (!e.group.alive) this.deathSmokeAt(cx, e.group.worldY);
        }
      }
    }

    // Reflect enemy troop losses visually
    for (const e of this.enemies) {
      const targetVisuals = Math.min(Math.ceil(e.group.troops), e.troopSprites.length);
      while (e.troopSprites.length > targetVisuals) {
        const s = e.troopSprites.pop();
        const shadow = s?.getData("shadow") as Phaser.GameObjects.Image | undefined;
        shadow?.destroy();
        s?.destroy();
      }
      e.countLabel.setText(`${Math.max(0, Math.ceil(e.group.troops))}`);
    }

    // Mark damage volley info for HUD
    void damagePerVolley;
  }

  private handleGateOverlap(): void {
    const sx = this.squadAnchor.x;
    const sy = this.squadAnchor.y;
    for (const g of this.gates) {
      if (g.runtime.consumed) continue;
      const gx = g.container.x;
      const gy = g.container.y;
      if (Math.abs(sx - gx) < (GAME_CONFIG.gate.width - 50) / 2 && Math.abs(sy - gy) < 50) {
        applyGate(this.squad, g.runtime.spec);
        g.runtime.consumed = true;
        g.container.setAlpha(0.25);
        this.cameras.main.flash(150, 80, 80, 80);
        this.rebuildTroopSprites();
        this.updateHudText();
      }
    }
  }

  private handleBoss(deltaMs: number): void {
    if (!this.boss || !this.bossActive) return;
    this.boss.fireTimerMs -= deltaMs;
    if (this.boss.fireTimerMs <= 0) {
      this.boss.fireTimerMs = 1100;
      const cx = this.boss.sprite.x;
      const cy = this.boss.sprite.y + 40;
      const count = 5;
      for (let i = 0; i < count; i++) {
        const a = Math.PI / 2 + ((i - (count - 1) / 2) / (count - 1)) * 0.9;
        const b = this.enemyBullets.create(cx, cy, "tex_enemy_bullet") as EnemyBullet;
        b.setData("spawnedAt", this.elapsedMs);
        b.setVelocity(Math.cos(a) * 320, Math.sin(a) * 320);
        b.setRotation(a - Math.PI / 2);
      }
    }
    // Update HUD
    if (this.bossActive) {
      const ratio = Math.max(0, Math.min(1, this.boss.hp / this.boss.maxHp));
      this.bossHpBar.width = 420 * ratio;
      this.bossLabel.setText(`◤ REAPER LORD ◥   ${Math.max(0, Math.ceil(this.boss.hp))} / ${this.boss.maxHp}`);
    }
  }

  private killBoss(): void {
    if (!this.boss) return;
    const x = this.boss.sprite.x;
    const y = this.boss.sprite.y;
    const aura = this.boss.sprite.getData("aura") as Phaser.GameObjects.Image | undefined;
    aura?.destroy();
    this.deathSmokeAt(x, y);
    this.cameras.main.flash(500, 255, 100, 80);
    this.cameras.main.shake(420, 0.012);
    this.boss.sprite.destroy();
    this.boss = null;
    this.bossActive = false;
    this.bossLabel.setVisible(false);
    this.bossHpBg.setVisible(false);
    this.bossHpBar.setVisible(false);
    this.waveCleared = true;
  }

  private openCrate(c: CrateVisual): void {
    const dropId: WeaponId = c.runtime.spec.drop;
    const added = addWeapon(this.squad, dropId, this.elapsedMs);
    const cx = c.container.x;
    const cy = c.container.y;
    this.deathSmokeAt(cx, cy);
    this.cameras.main.flash(220, 255, 180, 80);
    const label = added ? `+ ${WEAPON_SPECS[dropId].label}` : `${WEAPON_SPECS[dropId].label} (already equipped)`;
    const popup = this.add
      .text(cx, cy, label, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "20px",
        color: added ? "#ffd870" : "#a8a89a",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(900)
      .setShadow(0, 2, "#000000", 4, true, true);
    this.tweens.add({
      targets: popup,
      y: cy - 60,
      alpha: { from: 1, to: 0 },
      duration: 900,
      onComplete: () => popup.destroy(),
    });
    c.container.destroy();
    this.updateHudText();
  }

  private hitSparkAt(x: number, y: number): void {
    for (let i = 0; i < 2; i++) {
      const s = this.add.image(x, y, "tex_hit_spark");
      s.setDepth(60);
      s.setBlendMode(Phaser.BlendModes.ADD);
      const ang = Math.random() * Math.PI * 2;
      const dist = 6 + Math.random() * 10;
      this.tweens.add({
        targets: s,
        x: x + Math.cos(ang) * dist,
        y: y + Math.sin(ang) * dist,
        alpha: { from: 1, to: 0 },
        scale: { from: 1, to: 0.4 },
        duration: 180,
        onComplete: () => s.destroy(),
      });
    }
  }

  private deathSmokeAt(x: number, y: number): void {
    for (let i = 0; i < 4; i++) {
      const s = this.add.image(x, y, "tex_smoke");
      s.setDepth(40);
      const ang = Math.random() * Math.PI * 2;
      const dist = 6 + Math.random() * 14;
      this.tweens.add({
        targets: s,
        x: x + Math.cos(ang) * dist,
        y: y + Math.sin(ang) * dist - 6,
        alpha: { from: 0.8, to: 0 },
        scale: { from: 0.8, to: 1.8 },
        duration: 420,
        onComplete: () => s.destroy(),
      });
    }
  }

  // ── Cleanup ─────────────────────────────────────────────────────────

  private cullProjectiles(): void {
    const lifeMs = 2400;
    const now = this.elapsedMs;
    for (const b of this.bullets.getChildren() as Bullet[]) {
      if (!b.active) continue;
      const sp = (b.getData("spawnedAt") as number) ?? now;
      if (now - sp > lifeMs || b.y < -40) b.destroy();
    }
    for (const eb of this.enemyBullets.getChildren() as EnemyBullet[]) {
      if (!eb.active) continue;
      const sp = (eb.getData("spawnedAt") as number) ?? now;
      if (now - sp > lifeMs || eb.y > this.scale.height + 40) eb.destroy();
    }
  }

  private cleanupOffscreen(): void {
    const offscreen = this.scale.height + 120;
    this.enemies = this.enemies.filter((e) => {
      if (!e.group.alive || e.group.worldY > offscreen) {
        e.troopSprites.forEach((s) => {
          const shadow = s.getData("shadow") as Phaser.GameObjects.Image | undefined;
          shadow?.destroy();
          s.destroy();
        });
        e.countLabel.destroy();
        return false;
      }
      return true;
    });
    this.gates = this.gates.filter((g) => {
      if (g.container.y > offscreen) {
        g.container.destroy();
        g.zone.destroy();
        return false;
      }
      return true;
    });
    this.crates = this.crates.filter((c) => {
      if (c.runtime.consumed || c.runtime.worldY > offscreen) {
        if (!c.runtime.consumed) c.container.destroy();
        return false;
      }
      // Update HP bar visual
      const ratio = Math.max(0, c.runtime.hp / Math.max(1, c.runtime.maxHp));
      c.hpBar.width = 80 * ratio;
      return true;
    });
  }

  // ── HUD ─────────────────────────────────────────────────────────────

  private buildHud(): void {
    this.hudSquad = this.add
      .text(20, 16, "", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "28px",
        color: "#f0e8c8",
        fontStyle: "bold",
      })
      .setScrollFactor(0)
      .setDepth(1000)
      .setShadow(0, 2, "#000000", 4, true, true);

    this.hudDamage = this.add
      .text(20, 52, "", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "18px",
        color: "#ffd870",
        fontStyle: "bold",
      })
      .setScrollFactor(0)
      .setDepth(1000)
      .setShadow(0, 2, "#000000", 4, true, true);

    this.hudWave = this.add
      .text(this.scale.width - 20, 16, "", {
        fontFamily: "system-ui, monospace",
        fontSize: "16px",
        color: "#a8a89a",
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(1000);

    this.hudWeapons = this.add
      .text(this.scale.width - 20, 44, "", {
        fontFamily: "system-ui, monospace",
        fontSize: "14px",
        color: "#ffd870",
        align: "right",
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(1000)
      .setShadow(0, 2, "#000000", 3, true, true);

    this.hudCenter = this.add
      .text(this.scale.width / 2, 60, "", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "20px",
        color: "#ff8c2b",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000);

    // Boss HP
    this.bossHpBg = this.add
      .rectangle(this.scale.width / 2, 110, 420, 14, 0x14142a)
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(1000)
      .setStrokeStyle(2, 0xff2828, 0.85)
      .setVisible(false);
    this.bossHpBar = this.add
      .rectangle(this.scale.width / 2 - 210, 110, 0, 14, 0xff2828)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(1001)
      .setVisible(false);
    this.bossLabel = this.add
      .text(this.scale.width / 2, 86, "", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "18px",
        color: "#ff8c2b",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000)
      .setShadow(0, 2, "#000000", 4, true, true)
      .setVisible(false);
  }

  private updateHudText(): void {
    this.hudSquad.setText(`[${Math.max(0, Math.ceil(this.squad.troops))}]`);
    this.hudDamage.setText(`× ${this.squad.damageTier} DMG`);
    this.hudWave.setText(`WAVE ${this.wave.id}    ESC = menu`);
    const weaponList = this.squad.weapons.map((w) => w.spec.shortLabel).join(" · ");
    this.hudWeapons.setText(`◆ ${weaponList}`);
  }

  // ── End states ──────────────────────────────────────────────────────

  private endRunLoss(): void {
    if (this.dead) return;
    this.dead = true;
    this.hudCenter.setColor("#ff2828").setText("SQUAD WIPED — press R to retry");
    this.input.keyboard?.once("keydown-R", () => this.scene.start("GameScene"));
    this.input.keyboard?.once("keydown-SPACE", () => this.scene.start("GameScene"));
    this.input.keyboard?.once("keydown-ENTER", () => this.scene.start("GameScene"));
  }

  private endRunWin(): void {
    if (this.dead) return;
    this.dead = true;
    this.hudCenter.setColor("#7eff9c").setText(`WAVE ${this.wave.id} CLEARED — [${Math.ceil(this.squad.troops)}] survived`);
    this.input.keyboard?.once("keydown-R", () => this.scene.start("GameScene"));
    this.input.keyboard?.once("keydown-SPACE", () => this.scene.start("GameScene"));
    this.input.keyboard?.once("keydown-ENTER", () => this.scene.start("GameScene"));
  }
}
