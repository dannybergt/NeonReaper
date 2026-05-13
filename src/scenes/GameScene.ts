import Phaser from "phaser";
import { GAME_CONFIG } from "@/config/game";

type Enemy = Phaser.Physics.Arcade.Sprite & { hp?: number };
type Bullet = Phaser.Physics.Arcade.Sprite;

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private enemies!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;

  private spawnIntervalMs: number = GAME_CONFIG.spawner.initialIntervalMs;
  private nextSpawnAt = 0;
  private nextFireAt = 0;
  private playerHp = GAME_CONFIG.player.maxHp;
  private score = 0;
  private elapsedSec = 0;

  private hudText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "GameScene" });
  }

  create(): void {
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

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;

    this.physics.add.overlap(this.bullets, this.enemies, (b, e) => this.onBulletHit(b as Bullet, e as Enemy));
    this.physics.add.overlap(this.player, this.enemies, (_p, e) => this.onPlayerHit(e as Enemy));

    this.hudText = this.add
      .text(16, 12, "", {
        fontFamily: "system-ui, monospace",
        fontSize: "16px",
        color: "#e0e8ff",
      })
      .setScrollFactor(0)
      .setDepth(1000);

    this.input.keyboard?.on("keydown-ESC", () => this.scene.start("MenuScene"));
  }

  override update(time: number, deltaMs: number): void {
    const dt = deltaMs / 1000;
    this.elapsedSec += dt;
    this.spawnIntervalMs = Math.max(
      GAME_CONFIG.spawner.minIntervalMs,
      GAME_CONFIG.spawner.initialIntervalMs - this.elapsedSec * GAME_CONFIG.spawner.rampDownPerSec * 10,
    );

    this.handleMovement();
    this.handleSpawning(time);
    this.handleAutoFire(time);
    this.handleEnemyAI();
    this.cullProjectiles();
    this.updateHud();
  }

  private handleMovement(): void {
    const speed = GAME_CONFIG.player.moveSpeed;
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
    const enemy = this.enemies.create(x, y, "tex_enemy_walker") as Enemy;
    enemy.hp = GAME_CONFIG.enemy.walkerHp;
    enemy.setCircle(12).setOffset(2, 2);
  }

  private handleAutoFire(time: number): void {
    if (time < this.nextFireAt) return;
    const target = this.findNearestEnemy();
    if (!target) return;
    const dx = target.x - this.player.x;
    const dy = target.y - this.player.y;
    const dist = Math.hypot(dx, dy);
    if (dist > GAME_CONFIG.weapon.pistolRange) return;

    this.nextFireAt = time + GAME_CONFIG.weapon.pistolFireRateMs;
    const bullet = this.bullets.create(this.player.x, this.player.y, "tex_bullet") as Bullet;
    bullet.setData("damage", GAME_CONFIG.weapon.pistolDamage);
    bullet.setData("spawnedAt", time);
    const inv = 1 / dist;
    bullet.setVelocity(dx * inv * GAME_CONFIG.weapon.bulletSpeed, dy * inv * GAME_CONFIG.weapon.bulletSpeed);
  }

  private handleEnemyAI(): void {
    const speed = GAME_CONFIG.enemy.walkerSpeed;
    this.enemies.children.iterate((obj) => {
      const e = obj as Enemy;
      if (!e.active) return true;
      const dx = this.player.x - e.x;
      const dy = this.player.y - e.y;
      const len = Math.hypot(dx, dy) || 1;
      e.setVelocity((dx / len) * speed, (dy / len) * speed);
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
      this.score += 10;
      enemy.destroy();
    } else {
      enemy.setTint(0xffffff);
      this.time.delayedCall(60, () => enemy.active && enemy.clearTint());
    }
  }

  private onPlayerHit(enemy: Enemy): void {
    if (!enemy.active) return;
    this.playerHp -= GAME_CONFIG.enemy.walkerDamage;
    enemy.destroy();
    this.cameras.main.shake(120, 0.004);
    if (this.playerHp <= 0) {
      this.scene.start("MenuScene");
    }
  }

  private updateHud(): void {
    const sec = Math.floor(this.elapsedSec);
    const mm = Math.floor(sec / 60).toString().padStart(2, "0");
    const ss = (sec % 60).toString().padStart(2, "0");
    this.hudText.setText(
      `HP ${Math.max(0, Math.floor(this.playerHp))}   SCORE ${this.score}   TIME ${mm}:${ss}   [ESC] menu`,
    );
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
