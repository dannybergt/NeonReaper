import Phaser from "phaser";
import { GAME_CONFIG } from "@/config/game";
import { createDefaultStats, xpToNextLevel, type PlayerStats } from "@/systems/PlayerStats";
import type { Upgrade } from "@/systems/UpgradeSystem";
import {
  CURSE_ELITE,
  ENEMY_TYPES,
  pickEnemyType,
  rollCursedElite,
  type EnemyStats,
  type EnemyTypeId,
} from "@/systems/EnemyTypes";
import {
  createDefaultHeat,
  fireRateMultiplier,
  heatRatio,
  isOverheated,
  registerShot,
  tickHeat,
  type HeatState,
} from "@/systems/HeatSystem";
import {
  addCurse,
  createCurseState,
  effectiveMult,
  pickCurse,
  remainingSec,
  tickCurses,
  type CurseState,
} from "@/systems/CurseSystem";
import { BOSS_CONFIG, bulletPatternAngles, shouldSpawnBoss } from "@/systems/BossSystem";

type Enemy = Phaser.Physics.Arcade.Sprite & {
  hp?: number;
  enemyType?: EnemyTypeId;
  cursed?: boolean;
  isBoss?: boolean;
};
type Bullet = Phaser.Physics.Arcade.Sprite;
type EnemyBullet = Phaser.Physics.Arcade.Sprite;
type Gem = Phaser.Physics.Arcade.Sprite & { value?: number };

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private enemies!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private gems!: Phaser.Physics.Arcade.Group;

  private boss: Enemy | null = null;
  private bossSpawned = false;
  private bossMaxHp = BOSS_CONFIG.hp;
  private nextBossAttackAt = 0;
  private bossPatternRotation = 0;

  private stats: PlayerStats = createDefaultStats();
  private heat: HeatState = createDefaultHeat();
  private curses: CurseState = createCurseState();
  private spawnIntervalMs: number = GAME_CONFIG.spawner.initialIntervalMs;
  private nextSpawnAt = 0;
  private nextFireAt = 0;
  private playerHp: number = GAME_CONFIG.player.maxHp;
  private score = 0;
  private elapsedSec = 0;
  private level = 1;
  private xpCurrent = 0;
  private xpNeeded = xpToNextLevel(1);
  private paused = false;
  private dead = false;

  private hudText!: Phaser.GameObjects.Text;
  private hudLevel!: Phaser.GameObjects.Text;
  private xpBarBg!: Phaser.GameObjects.Rectangle;
  private xpBar!: Phaser.GameObjects.Rectangle;
  private heatBarBg!: Phaser.GameObjects.Rectangle;
  private heatBar!: Phaser.GameObjects.Rectangle;
  private curseHud!: Phaser.GameObjects.Text;
  private bossLabel!: Phaser.GameObjects.Text;
  private bossHpBarBg!: Phaser.GameObjects.Rectangle;
  private bossHpBar!: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: "GameScene" });
  }

  create(): void {
    this.stats = createDefaultStats();
    this.heat = createDefaultHeat();
    this.curses = createCurseState();
    this.spawnIntervalMs = GAME_CONFIG.spawner.initialIntervalMs;
    this.nextSpawnAt = 0;
    this.nextFireAt = 0;
    this.playerHp = this.stats.maxHp;
    this.score = 0;
    this.elapsedSec = 0;
    this.level = 1;
    this.xpCurrent = 0;
    this.xpNeeded = xpToNextLevel(this.level);
    this.paused = false;
    this.dead = false;
    this.boss = null;
    this.bossSpawned = false;
    this.nextBossAttackAt = 0;
    this.bossPatternRotation = 0;

    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(GAME_CONFIG.palette.bg);
    this.drawGridBackdrop(width * 4, height * 4);

    this.player = this.physics.add.sprite(0, 0, "tex_player");
    this.player.setCircle(14).setOffset(2, 2);
    this.player.setCollideWorldBounds(false);
    this.physics.world.setBounds(-width * 2, -height * 2, width * 4, height * 4);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setBounds(-width * 2, -height * 2, width * 4, height * 4);
    this.cameras.main.setZoom(1.1);

    this.enemies = this.physics.add.group();
    this.bullets = this.physics.add.group({ runChildUpdate: false });
    this.enemyBullets = this.physics.add.group({ runChildUpdate: false });
    this.gems = this.physics.add.group();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;

    this.physics.add.overlap(this.bullets, this.enemies, (b, e) => this.onBulletHit(b as Bullet, e as Enemy));
    this.physics.add.overlap(this.player, this.enemies, (_p, e) => this.onPlayerHit(e as Enemy));
    this.physics.add.overlap(this.player, this.enemyBullets, (_p, b) => this.onEnemyBulletHit(b as EnemyBullet));
    this.physics.add.overlap(this.player, this.gems, (_p, g) => this.onGemPickup(g as Gem));

    this.buildHud();

    this.input.keyboard?.on("keydown-ESC", () => {
      if (!this.dead) this.scene.start("MenuScene");
    });
  }

  override update(time: number, deltaMs: number): void {
    if (this.paused || this.dead) return;
    const dt = deltaMs / 1000;
    this.elapsedSec += dt;
    this.spawnIntervalMs = Math.max(
      GAME_CONFIG.spawner.minIntervalMs,
      GAME_CONFIG.spawner.initialIntervalMs - this.elapsedSec * GAME_CONFIG.spawner.rampDownPerSec * 10,
    );

    tickHeat(this.heat, dt);
    tickCurses(this.curses, this.time.now);
    this.handleMovement();
    this.maybeSpawnBoss();
    this.handleSpawning(time);
    this.handleAutoFire(time);
    this.handleEnemyAI();
    this.handleBossBehavior(time);
    this.handleGemMagnet();
    this.cullProjectiles();
    this.updateHud();
  }

  private handleMovement(): void {
    const speed = this.stats.moveSpeed;
    let vx = 0;
    let vy = 0;
    if (this.cursors.left?.isDown || this.wasd.A.isDown) vx -= 1;
    if (this.cursors.right?.isDown || this.wasd.D.isDown) vx += 1;
    if (this.cursors.up?.isDown || this.wasd.W.isDown) vy -= 1;
    if (this.cursors.down?.isDown || this.wasd.S.isDown) vy += 1;
    const len = Math.hypot(vx, vy) || 1;
    this.player.setVelocity((vx / len) * speed, (vy / len) * speed);
  }

  private handleSpawning(time: number): void {
    if (time < this.nextSpawnAt) return;
    this.nextSpawnAt = time + this.spawnIntervalMs;
    const cam = this.cameras.main;
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.max(cam.width, cam.height) * 0.7;
    const x = this.player.x + Math.cos(angle) * dist;
    const y = this.player.y + Math.sin(angle) * dist;
    const typeId = pickEnemyType(this.elapsedSec);
    const cursed = rollCursedElite(this.elapsedSec);
    this.spawnEnemyOfType(x, y, typeId, cursed);
  }

  private spawnEnemyOfType(x: number, y: number, typeId: EnemyTypeId, cursed: boolean): void {
    const t = ENEMY_TYPES[typeId];
    const enemy = this.enemies.create(x, y, t.textureKey) as Enemy;
    enemy.hp = cursed ? Math.round(t.hp * CURSE_ELITE.hpMult) : t.hp;
    enemy.enemyType = typeId;
    enemy.cursed = cursed;
    enemy.setCircle(t.bodyRadius).setOffset(2, 2);
    if (cursed) {
      enemy.setTint(0xff80ff);
      enemy.setScale(1.15);
      this.tweens.add({
        targets: enemy,
        alpha: { from: 1, to: 0.55 },
        duration: 600,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private enemyStats(e: Enemy): EnemyStats {
    return ENEMY_TYPES[e.enemyType ?? "walker"];
  }

  private enemyMoveSpeed(e: Enemy): number {
    if (e.isBoss === true) return BOSS_CONFIG.speed;
    return this.enemyStats(e).speed;
  }

  private enemyContactDamage(e: Enemy): number {
    if (e.isBoss === true) return BOSS_CONFIG.damage;
    return this.enemyStats(e).damage;
  }

  private handleAutoFire(time: number): void {
    if (time < this.nextFireAt) return;
    const target = this.findNearestEnemy();
    if (!target) return;
    const dx = target.x - this.player.x;
    const dy = target.y - this.player.y;
    const dist = Math.hypot(dx, dy);
    const effectiveRange = this.stats.pistolRange * effectiveMult(this.curses, "pistolRange");
    if (dist > effectiveRange) return;

    const heatPenalty = fireRateMultiplier(this.heat);
    const cursePenalty = effectiveMult(this.curses, "pistolFireRateMs");
    this.nextFireAt = time + this.stats.pistolFireRateMs * heatPenalty * cursePenalty;
    registerShot(this.heat);
    const bullet = this.bullets.create(this.player.x, this.player.y, "tex_bullet") as Bullet;
    bullet.setData("damage", this.stats.pistolDamage);
    bullet.setData("spawnedAt", time);
    const inv = 1 / dist;
    bullet.setVelocity(dx * inv * this.stats.bulletSpeed, dy * inv * this.stats.bulletSpeed);
  }

  private handleEnemyAI(): void {
    this.enemies.children.iterate((obj) => {
      const e = obj as Enemy;
      if (!e.active) return true;
      const speed = this.enemyMoveSpeed(e);
      const dx = this.player.x - e.x;
      const dy = this.player.y - e.y;
      const len = Math.hypot(dx, dy) || 1;
      e.setVelocity((dx / len) * speed, (dy / len) * speed);
      return true;
    });
  }

  private handleGemMagnet(): void {
    const r = this.stats.pickupRadius;
    const r2 = r * r;
    const magnetSpeed = GAME_CONFIG.xp.gemMagnetSpeed;
    this.gems.children.iterate((obj) => {
      const g = obj as Gem;
      if (!g.active) return true;
      const dx = this.player.x - g.x;
      const dy = this.player.y - g.y;
      const d2 = dx * dx + dy * dy;
      if (d2 <= r2) {
        const len = Math.sqrt(d2) || 1;
        g.setVelocity((dx / len) * magnetSpeed, (dy / len) * magnetSpeed);
      } else if (g.body && (g.body.velocity.x !== 0 || g.body.velocity.y !== 0)) {
        g.setVelocity(0, 0);
      }
      return true;
    });
  }

  private cullProjectiles(): void {
    const now = this.time.now;
    this.bullets.children.iterate((obj) => {
      const b = obj as Bullet;
      if (!b.active) return true;
      const spawnedAt = (b.getData("spawnedAt") as number) ?? now;
      if (now - spawnedAt > 1200) {
        b.destroy();
      }
      return true;
    });
    this.enemyBullets.children.iterate((obj) => {
      const b = obj as EnemyBullet;
      if (!b.active) return true;
      const spawnedAt = (b.getData("spawnedAt") as number) ?? now;
      if (now - spawnedAt > BOSS_CONFIG.bulletLifetimeMs) {
        b.destroy();
      }
      return true;
    });
  }

  private findNearestEnemy(): Enemy | null {
    let nearest: Enemy | null = null;
    let bestDistSq = Infinity;
    this.enemies.children.iterate((obj) => {
      const e = obj as Enemy;
      if (!e.active) return true;
      const dx = e.x - this.player.x;
      const dy = e.y - this.player.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestDistSq) {
        bestDistSq = d2;
        nearest = e;
      }
      return true;
    });
    return nearest;
  }

  private onBulletHit(bullet: Bullet, enemy: Enemy): void {
    if (!bullet.active || !enemy.active) return;
    const dmg = (bullet.getData("damage") as number) ?? 1;
    enemy.hp = (enemy.hp ?? 0) - dmg;
    bullet.destroy();
    if ((enemy.hp ?? 0) <= 0) {
      if (enemy.isBoss === true) {
        this.onBossDefeated(enemy);
      } else {
        const t = this.enemyStats(enemy);
        const cursed = enemy.cursed === true;
        const scoreAdd = cursed ? Math.round(t.scoreReward * CURSE_ELITE.scoreMult) : t.scoreReward;
        const xpAdd = cursed ? Math.round(t.xpReward * CURSE_ELITE.xpMult) : t.xpReward;
        this.score += scoreAdd;
        this.spawnGem(enemy.x, enemy.y, xpAdd);
        if (cursed) {
          const curse = pickCurse();
          addCurse(this.curses, curse, this.time.now);
          this.cameras.main.flash(180, 80, 0, 80);
        }
        enemy.destroy();
      }
    } else {
      enemy.setTint(0xffffff);
      this.time.delayedCall(60, () => enemy.active && enemy.clearTint());
    }
  }

  private onPlayerHit(enemy: Enemy): void {
    if (!enemy.active || this.dead) return;
    if (enemy.isBoss === true) {
      const nextHitAt = (enemy.getData("nextHitAt") as number | undefined) ?? 0;
      if (this.time.now < nextHitAt) return;
      enemy.setData("nextHitAt", this.time.now + 500);
    }
    const baseDmg = this.enemyContactDamage(enemy);
    const cursedBonus = enemy.cursed === true ? CURSE_ELITE.damageMult : 1;
    const incoming = baseDmg * cursedBonus * effectiveMult(this.curses, "incomingDamage");
    this.playerHp -= incoming;
    if (enemy.isBoss !== true) {
      enemy.destroy();
    }
    this.cameras.main.shake(120, 0.004);
    if (this.playerHp <= 0) {
      this.endRun();
    }
  }

  private spawnGem(x: number, y: number, value: number): void {
    const gem = this.gems.create(x, y, "tex_xp") as Gem;
    gem.value = value;
    gem.setCircle(4).setOffset(0, 0);
    gem.setVelocity(0, 0);
    gem.setData("spawnedAt", this.time.now);
    this.time.delayedCall(GAME_CONFIG.xp.gemDespawnMs, () => gem.active && gem.destroy());
  }

  private onGemPickup(gem: Gem): void {
    if (!gem.active) return;
    const value = gem.value ?? 1;
    gem.destroy();
    this.xpCurrent += value;
    while (this.xpCurrent >= this.xpNeeded) {
      this.xpCurrent -= this.xpNeeded;
      this.level += 1;
      this.xpNeeded = xpToNextLevel(this.level);
      this.triggerLevelUp();
    }
  }

  private triggerLevelUp(): void {
    if (this.dead) return;
    this.paused = true;
    this.physics.world.pause();
    this.scene.launch("LevelUpScene", {
      level: this.level,
      onPick: (u: Upgrade) => this.applyUpgrade(u),
    });
  }

  private applyUpgrade(upgrade: Upgrade): void {
    const oldMax = this.stats.maxHp;
    upgrade.apply(this.stats);
    if (this.stats.maxHp > oldMax) {
      this.playerHp += this.stats.maxHp - oldMax;
    }
    this.playerHp = Math.min(this.playerHp, this.stats.maxHp);
    this.paused = false;
    this.physics.world.resume();
  }

  private endRun(): void {
    this.dead = true;
    this.physics.world.pause();
    this.scene.start("GameOverScene", {
      score: this.score,
      level: this.level,
      elapsedSec: this.elapsedSec,
    });
  }

  private buildHud(): void {
    this.hudText = this.add
      .text(16, 12, "", {
        fontFamily: "system-ui, monospace",
        fontSize: "16px",
        color: "#e0e8ff",
      })
      .setScrollFactor(0)
      .setDepth(1000);

    this.hudLevel = this.add
      .text(16, 36, "", {
        fontFamily: "system-ui, monospace",
        fontSize: "14px",
        color: "#80ffff",
      })
      .setScrollFactor(0)
      .setDepth(1000);

    this.xpBarBg = this.add
      .rectangle(16, 60, 240, 6, 0x14142a)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(1000)
      .setStrokeStyle(1, GAME_CONFIG.palette.xp, 0.5);

    this.xpBar = this.add
      .rectangle(16, 60, 0, 6, GAME_CONFIG.palette.xp)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(1001);

    this.heatBarBg = this.add
      .rectangle(16, 74, 240, 6, 0x14142a)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(1000)
      .setStrokeStyle(1, 0xff5050, 0.5);

    this.heatBar = this.add
      .rectangle(16, 74, 0, 6, 0xff5050)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(1001);

    this.curseHud = this.add
      .text(16, 90, "", {
        fontFamily: "system-ui, monospace",
        fontSize: "13px",
        color: "#ff80c8",
      })
      .setScrollFactor(0)
      .setDepth(1000);

    const screenW = this.scale.width;
    this.bossLabel = this.add
      .text(screenW / 2, 14, "", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "18px",
        color: "#ff2bd6",
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(1000)
      .setShadow(0, 0, "#ff2bd6", 10, true, true)
      .setVisible(false);

    this.bossHpBarBg = this.add
      .rectangle(screenW / 2, 44, 420, 10, 0x14142a)
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(1000)
      .setStrokeStyle(2, 0xff2bd6, 0.8)
      .setVisible(false);

    this.bossHpBar = this.add
      .rectangle(screenW / 2 - 210, 44, 0, 10, 0xff2bd6)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(1001)
      .setVisible(false);
  }

  private updateHud(): void {
    const sec = Math.floor(this.elapsedSec);
    const mm = Math.floor(sec / 60).toString().padStart(2, "0");
    const ss = (sec % 60).toString().padStart(2, "0");
    this.hudText.setText(
      `HP ${Math.max(0, Math.floor(this.playerHp))} / ${this.stats.maxHp}   SCORE ${this.score}   TIME ${mm}:${ss}   [ESC] menu`,
    );
    const overheat = isOverheated(this.heat) ? "  ⚠ OVERHEAT" : "";
    this.hudLevel.setText(`LVL ${this.level}    XP ${this.xpCurrent} / ${this.xpNeeded}${overheat}`);
    const ratio = Math.max(0, Math.min(1, this.xpCurrent / this.xpNeeded));
    this.xpBar.width = this.xpBarBg.width * ratio;
    this.heatBar.width = this.heatBarBg.width * heatRatio(this.heat);
    this.heatBar.fillColor = isOverheated(this.heat) ? 0xff2020 : 0xff8050;
    if (this.curses.active.length === 0) {
      this.curseHud.setText("");
    } else {
      const lines = this.curses.active.map(
        (c) => `✦ ${c.def.label}  ${remainingSec(c, this.time.now).toFixed(1)}s`,
      );
      this.curseHud.setText(lines.join("    "));
    }
    this.updateBossHud();
  }

  private updateBossHud(): void {
    const boss = this.boss;
    const visible = boss !== null && boss.active && (boss.hp ?? 0) > 0;
    this.bossLabel.setVisible(visible);
    this.bossHpBarBg.setVisible(visible);
    this.bossHpBar.setVisible(visible);
    if (!visible || !boss) return;
    this.bossLabel.setText(`◤ REAPER LORD ◥  ${Math.max(0, Math.floor(boss.hp ?? 0))} / ${this.bossMaxHp}`);
    const ratio = Math.max(0, Math.min(1, (boss.hp ?? 0) / Math.max(1, this.bossMaxHp)));
    this.bossHpBar.width = 420 * ratio;
  }

  private maybeSpawnBoss(): void {
    if (!shouldSpawnBoss(this.elapsedSec, this.bossSpawned)) return;
    const cam = this.cameras.main;
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.max(cam.width, cam.height) * 0.55;
    const x = this.player.x + Math.cos(angle) * dist;
    const y = this.player.y + Math.sin(angle) * dist;

    const boss = this.enemies.create(x, y, BOSS_CONFIG.textureKey) as Enemy;
    boss.hp = BOSS_CONFIG.hp;
    boss.isBoss = true;
    boss.enemyType = undefined;
    boss.setCircle(BOSS_CONFIG.bodyRadius).setOffset(4, 4);
    boss.setData("nextHitAt", 0);

    this.tweens.add({
      targets: boss,
      scale: { from: 1.0, to: 1.08 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.boss = boss;
    this.bossSpawned = true;
    this.bossMaxHp = BOSS_CONFIG.hp;
    this.nextBossAttackAt = this.time.now + 1200;
    this.spawnIntervalMs = this.spawnIntervalMs * (1 - BOSS_CONFIG.spawnExtraSpawnRateBoost * 0.5);
    this.cameras.main.flash(400, 120, 0, 80);
    this.cameras.main.shake(280, 0.008);
  }

  private handleBossBehavior(time: number): void {
    const boss = this.boss;
    if (!boss || !boss.active) {
      this.boss = null;
      return;
    }
    if (time < this.nextBossAttackAt) return;
    this.nextBossAttackAt = time + BOSS_CONFIG.attackIntervalMs;
    this.bossPatternRotation += BOSS_CONFIG.rotationPerShot;
    const angles = bulletPatternAngles(BOSS_CONFIG.bulletCount, this.bossPatternRotation);
    for (const a of angles) {
      const b = this.enemyBullets.create(boss.x, boss.y, "tex_enemy_bullet") as EnemyBullet;
      b.setData("spawnedAt", time);
      b.setCircle(4).setOffset(1, 1);
      b.setVelocity(Math.cos(a) * BOSS_CONFIG.bulletSpeed, Math.sin(a) * BOSS_CONFIG.bulletSpeed);
    }
  }

  private onEnemyBulletHit(b: EnemyBullet): void {
    if (!b.active || this.dead) return;
    const incoming = BOSS_CONFIG.bulletDamage * effectiveMult(this.curses, "incomingDamage");
    this.playerHp -= incoming;
    b.destroy();
    this.cameras.main.shake(80, 0.003);
    if (this.playerHp <= 0) {
      this.endRun();
    }
  }

  private onBossDefeated(boss: Enemy): void {
    const x = boss.x;
    const y = boss.y;
    boss.destroy();
    this.boss = null;
    this.score += BOSS_CONFIG.scoreReward;
    for (let i = 0; i < BOSS_CONFIG.xpReward; i++) {
      const off = i * (Math.PI * 2) / BOSS_CONFIG.xpReward;
      const r = 28 + (i % 3) * 14;
      this.spawnGem(x + Math.cos(off) * r, y + Math.sin(off) * r, 1);
    }
    this.cameras.main.flash(500, 255, 100, 200);
    this.cameras.main.shake(420, 0.012);
    this.enemyBullets.children.iterate((obj) => {
      const eb = obj as EnemyBullet;
      if (eb.active) eb.destroy();
      return true;
    });
  }

  private drawGridBackdrop(w: number, h: number): void {
    const g = this.add.graphics({ x: -w / 2, y: -h / 2 });
    g.lineStyle(1, GAME_CONFIG.palette.grid, 0.6);
    const step = 64;
    for (let x = 0; x <= w; x += step) {
      g.lineBetween(x, 0, x, h);
    }
    for (let y = 0; y <= h; y += step) {
      g.lineBetween(0, y, w, y);
    }
    g.setDepth(-100);
  }
}
