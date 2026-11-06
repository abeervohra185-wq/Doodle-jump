import { 
  Player, 
  Platform, 
  PlatformType, 
  ItemType, 
  Monster, 
  MonsterType, 
  Projectile, 
  Particle, 
  ScoreMarker, 
  GameState, 
  ThemeId,
  Achievement
} from './types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  PHYSICS, 
  PLATFORM,
  INITIAL_ACHIEVEMENTS
} from './constants';
import { sound } from './audio';
import { GameRenderer } from './renderer';

export interface GameEngineCallbacks {
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number, isNewHigh: boolean) => void;
  onPowerupUpdate: (type: 'propeller' | 'jetpack' | null, remainingPercent: number) => void;
  onShieldUpdate: (hasShield: boolean) => void;
  onAchievementUnlocked: (achievement: Achievement) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: GameRenderer;
  private callbacks: GameEngineCallbacks;

  public state: GameState = 'START';
  public themeId: ThemeId = 'classic';
  public score: number = 0;
  public highScore: number = 0;
  public monstersDefeated: number = 0;
  public springsUsed: number = 0;
  public jetpacksUsed: number = 0;

  private cameraY: number = 0;
  private maxCameraY: number = 0;
  private highestY: number = 0;

  private player!: Player;
  private platforms: Platform[] = [];
  private monsters: Monster[] = [];
  private projectiles: Projectile[] = [];
  private particles: Particle[] = [];
  private markers: ScoreMarker[] = [];
  private achievements: Achievement[] = [];

  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private nextPlatformId: number = 1;
  private nextMonsterId: number = 1;
  private nextProjectileId: number = 1;

  // Input states
  private keys: { [key: string]: boolean } = {};
  public mouseControlEnabled: boolean = false;
  private mouseX: number = CANVAS_WIDTH / 2;

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks) {
    this.canvas = canvas;
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.ctx = canvas.getContext('2d')!;
    this.renderer = new GameRenderer(this.ctx);
    this.callbacks = callbacks;

    this.loadPersistedData();
    this.initPlayer();
    this.initPlatforms();
    this.updateMarkers();
    this.bindEvents();
    this.render();
  }

  private loadPersistedData() {
    const savedHigh = localStorage.getItem('doodle_high_score');
    if (savedHigh) {
      this.highScore = parseInt(savedHigh, 10) || 0;
    }

    const savedTheme = localStorage.getItem('doodle_theme') as ThemeId;
    if (savedTheme && ['classic', 'galaxy', 'jungle', 'retro'].includes(savedTheme)) {
      this.themeId = savedTheme;
      this.renderer.setTheme(this.themeId);
    }

    const savedAchievements = localStorage.getItem('doodle_achievements');
    if (savedAchievements) {
      try {
        this.achievements = JSON.parse(savedAchievements);
      } catch {
        this.achievements = [...INITIAL_ACHIEVEMENTS];
      }
    } else {
      this.achievements = [...INITIAL_ACHIEVEMENTS];
    }
  }

  public setTheme(theme: ThemeId) {
    this.themeId = theme;
    this.renderer.setTheme(theme);
    localStorage.setItem('doodle_theme', theme);
    this.render();
  }

  public getAchievements(): Achievement[] {
    return this.achievements;
  }

  private checkAchievement(id: string) {
    const ach = this.achievements.find(a => a.id === id);
    if (ach && !ach.unlocked) {
      ach.unlocked = true;
      ach.unlockedAt = new Date().toLocaleTimeString();
      localStorage.setItem('doodle_achievements', JSON.stringify(this.achievements));
      this.callbacks.onAchievementUnlocked(ach);
      sound.playHighscore();
    }
  }

  private updateMarkers() {
    const markers: ScoreMarker[] = [];
    if (this.highScore > 200) {
      markers.push({
        altitude: -this.highScore,
        label: `Best: ${this.highScore.toLocaleString()}`,
        type: 'personal',
      });
    }

    const milestones = [1000, 2500, 5000, 7500, 10000, 15000, 20000];
    milestones.forEach((m) => {
      markers.push({
        altitude: -m,
        label: `${m.toLocaleString()}m`,
        type: 'milestone',
      });
    });

    this.markers = markers;
  }

  private initPlayer() {
    this.player = {
      x: CANVAS_WIDTH / 2 - 20,
      y: CANVAS_HEIGHT - 160,
      vx: 0,
      vy: PHYSICS.JUMP_FORCE,
      width: 40,
      height: 44,
      facing: 'right',
      isGrounded: false,
      squashFactor: 1.0,
      activePowerup: null,
      powerupTimeRemaining: 0,
      hasShield: false,
      shootAnimTimer: 0,
    };
  }

  private initPlatforms() {
    this.platforms = [];
    this.monsters = [];
    this.projectiles = [];
    this.particles = [];
    this.nextPlatformId = 1;
    this.nextMonsterId = 1;

    // Guaranteed starting platform right underneath player
    this.platforms.push({
      id: this.nextPlatformId++,
      x: CANVAS_WIDTH / 2 - PLATFORM.WIDTH / 2,
      y: CANVAS_HEIGHT - 80,
      width: PLATFORM.WIDTH,
      height: PLATFORM.HEIGHT,
      type: 'standard',
      vx: 0,
      vy: 0,
    });

    // Generate initial platforms up to the top of screen
    let currentY = CANVAS_HEIGHT - 80;
    while (currentY > -100) {
      const gap = 60 + Math.random() * 30;
      currentY -= gap;
      this.spawnPlatformAt(currentY);
    }
  }

  private spawnPlatformAt(y: number) {
    const typeRoll = Math.random();
    let type: PlatformType = 'standard';
    const alt = Math.abs(y);

    if (alt > 4000) {
      if (typeRoll < 0.32) type = 'moving';
      else if (typeRoll < 0.48) type = 'broken';
      else if (typeRoll < 0.62) type = 'disappearing';
      else if (typeRoll < 0.72) type = 'vertical';
    } else if (alt > 1500) {
      if (typeRoll < 0.25) type = 'moving';
      else if (typeRoll < 0.38) type = 'broken';
      else if (typeRoll < 0.50) type = 'disappearing';
      else if (typeRoll < 0.58) type = 'vertical';
    } else if (alt > 400) {
      if (typeRoll < 0.18) type = 'moving';
      else if (typeRoll < 0.28) type = 'broken';
    }

    const margin = 10;
    const x = margin + Math.random() * (CANVAS_WIDTH - PLATFORM.WIDTH - margin * 2);

    const platform: Platform = {
      id: this.nextPlatformId++,
      x,
      y,
      width: PLATFORM.WIDTH,
      height: PLATFORM.HEIGHT,
      type,
      vx: type === 'moving' ? (Math.random() > 0.5 ? 2.2 : -2.2) : 0,
      vy: type === 'vertical' ? (Math.random() > 0.5 ? 1.4 : -1.4) : 0,
      minX: 10,
      maxX: CANVAS_WIDTH - PLATFORM.WIDTH - 10,
      minY: y - 50,
      maxY: y + 50,
    };

    // Maybe spawn item on standard or moving platform
    if (type === 'standard' || type === 'moving') {
      const itemRoll = Math.random();
      let itemType: ItemType | null = null;

      if (itemRoll < 0.08) itemType = 'spring';
      else if (itemRoll < 0.12) itemType = 'trampoline';
      else if (itemRoll < 0.15) itemType = 'shield';
      else if (itemRoll < 0.17) itemType = 'propeller';
      else if (itemRoll < 0.185) itemType = 'jetpack';

      if (itemType) {
        platform.item = {
          type: itemType,
          x: platform.width / 2 - 12,
          y: -16,
          width: 24,
          height: 16,
          used: false,
        };
      }
    }

    this.platforms.push(platform);

    // Maybe spawn monster if high enough
    if (alt > 2000 && Math.random() < 0.09) {
      this.spawnMonsterNear(y - 40);
    }
  }

  private spawnMonsterNear(y: number) {
    const typeRoll = Math.random();
    let type: MonsterType = 'flyer';
    if (typeRoll < 0.45) type = 'flyer';
    else if (typeRoll < 0.75) type = 'static';
    else type = 'blackhole';

    const width = type === 'blackhole' ? 52 : 46;
    const height = type === 'blackhole' ? 52 : 44;
    const x = 30 + Math.random() * (CANVAS_WIDTH - width - 60);

    this.monsters.push({
      id: this.nextMonsterId++,
      x,
      y,
      width,
      height,
      type,
      vx: type === 'flyer' ? (Math.random() > 0.5 ? 2.0 : -2.0) : 0,
      alive: true,
      animFrame: 0,
      rotation: 0,
    });
  }

  public startGame() {
    this.state = 'PLAYING';
    this.score = 0;
    this.monstersDefeated = 0;
    this.springsUsed = 0;
    this.jetpacksUsed = 0;
    this.cameraY = 0;
    this.maxCameraY = 0;
    this.highestY = CANVAS_HEIGHT - 160;

    this.initPlayer();
    this.initPlatforms();
    this.updateMarkers();
    this.checkAchievement('first_jump');

    sound.playBounce();
    this.lastTime = performance.now();
    if (!this.animFrameId) {
      this.loop(this.lastTime);
    }
  }

  public pauseGame() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
    }
  }

  public resumeGame() {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.lastTime = performance.now();
      if (!this.animFrameId) {
        this.loop(this.lastTime);
      }
    }
  }

  public shoot(targetX?: number, targetY?: number) {
    if (this.state !== 'PLAYING') return;

    sound.playShoot();
    this.player.shootAnimTimer = 8; // frames

    let vx = 0;
    let vy = PHYSICS.PROJECTILE_SPEED;

    // If target provided, aim towards target
    if (targetX !== undefined && targetY !== undefined) {
      const pScreenY = this.player.y - this.cameraY;
      const dx = targetX - (this.player.x + this.player.width / 2);
      const dy = targetY - pScreenY;
      const dist = Math.hypot(dx, dy);
      if (dist > 5) {
        vx = (dx / dist) * Math.abs(PHYSICS.PROJECTILE_SPEED);
        vy = (dy / dist) * Math.abs(PHYSICS.PROJECTILE_SPEED);
      }
    }

    this.projectiles.push({
      id: this.nextProjectileId++,
      x: this.player.x + this.player.width / 2,
      y: this.player.y,
      vx,
      vy,
      radius: 4,
    });
  }

  public setMousePosition(x: number) {
    this.mouseX = x;
  }

  public handleKeyDown(code: string) {
    this.keys[code] = true;
    if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') {
      if (this.state === 'PLAYING') {
        this.shoot();
      } else if (this.state === 'GAME_OVER' || this.state === 'START') {
        this.startGame();
      }
    }
    if (code === 'Escape') {
      if (this.state === 'PLAYING') this.pauseGame();
      else if (this.state === 'PAUSED') this.resumeGame();
    }
  }

  public handleKeyUp(code: string) {
    this.keys[code] = false;
  }

  private bindEvents() {
    window.addEventListener('keydown', (e) => {
      // Prevent scrolling with arrows or spacebar during game
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      this.handleKeyDown(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.handleKeyUp(e.code);
    });
  }

  private loop = (currentTime: number) => {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (this.state === 'PLAYING') {
      this.update(dt);
    }

    this.render();

    if (this.state === 'PLAYING' || this.state === 'PAUSED') {
      this.animFrameId = requestAnimationFrame(this.loop);
    } else {
      this.animFrameId = null;
    }
  };

  private update(dt: number) {
    const p = this.player;

    // 1. Horizontal Controls (Keyboard or Mouse)
    let moveIntent = 0;
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
      moveIntent -= 1;
    }
    if (this.keys['ArrowRight'] || this.keys['KeyD']) {
      moveIntent += 1;
    }

    if (this.mouseControlEnabled) {
      const pCenterX = p.x + p.width / 2;
      const diff = this.mouseX - pCenterX;
      if (Math.abs(diff) > 8) {
        moveIntent = Math.sign(diff) * Math.min(1, Math.abs(diff) / 60);
      }
    }

    if (moveIntent !== 0) {
      p.vx += moveIntent * PHYSICS.PLAYER_ACCEL;
      p.facing = moveIntent < 0 ? 'left' : 'right';
    } else {
      p.vx *= PHYSICS.PLAYER_FRICTION;
    }

    // Cap max horizontal speed
    p.vx = Math.max(-PHYSICS.PLAYER_SPEED, Math.min(PHYSICS.PLAYER_SPEED, p.vx));
    p.x += p.vx;

    // Horizontal Screen Wrapping
    if (p.x < -p.width / 2) {
      p.x = CANVAS_WIDTH - p.width / 2;
    } else if (p.x > CANVAS_WIDTH - p.width / 2) {
      p.x = -p.width / 2;
    }

    // 2. Power-up flight physics
    if (p.activePowerup) {
      p.powerupTimeRemaining -= dt;
      const totalDuration = p.activePowerup === 'jetpack' ? PHYSICS.JETPACK_DURATION : PHYSICS.PROPELLER_DURATION;
      const remainingPercent = Math.max(0, (p.powerupTimeRemaining / totalDuration) * 100);
      this.callbacks.onPowerupUpdate(p.activePowerup, remainingPercent);

      if (p.activePowerup === 'jetpack') {
        p.vy = PHYSICS.JETPACK_SPEED;
        // Generate jetpack flame & smoke particles
        if (Math.random() < 0.6) {
          this.particles.push({
            x: p.x + (p.facing === 'left' ? p.width + 6 : -6),
            y: p.y + p.height - 4,
            vx: (Math.random() - 0.5) * 2,
            vy: 4 + Math.random() * 3,
            color: Math.random() > 0.5 ? '#f97316' : '#facc15',
            radius: 3 + Math.random() * 3,
            life: 0.35,
            maxLife: 0.35,
            shape: 'circle',
          });
        }
      } else if (p.activePowerup === 'propeller') {
        p.vy = PHYSICS.PROPELLER_SPEED;
      }

      if (p.powerupTimeRemaining <= 0) {
        p.activePowerup = null;
        this.callbacks.onPowerupUpdate(null, 0);
      }
    } else {
      // Normal Gravity
      p.vy += PHYSICS.GRAVITY;
      p.vy = Math.min(p.vy, PHYSICS.MAX_FALL_SPEED);
    }

    p.y += p.vy;

    // Smooth squash/stretch return to 1.0
    if (p.squashFactor !== 1.0) {
      p.squashFactor += (1.0 - p.squashFactor) * 0.15;
      if (Math.abs(p.squashFactor - 1.0) < 0.02) p.squashFactor = 1.0;
    }

    // Shoot animation countdown
    if (p.shootAnimTimer > 0) {
      p.shootAnimTimer--;
    }

    // 3. Platform Collisions (Only when falling downward!)
    if (p.vy > 0 && !p.activePowerup) {
      const playerBottom = p.y + p.height;
      const playerPrevBottom = playerBottom - p.vy;

      for (const plat of this.platforms) {
        if (plat.broken && plat.brokenTimer !== undefined) continue;
        if (plat.disappeared) continue;

        // Check if player feet cross the top edge of platform
        const platTop = plat.y;
        if (
          playerBottom >= platTop &&
          playerPrevBottom <= platTop + 8 &&
          p.x + p.width - 8 >= plat.x &&
          p.x + 8 <= plat.x + plat.width
        ) {
          // Check if platform has an item
          if (plat.item && !plat.item.used) {
            const item = plat.item;
            const itemAbsX = plat.x + item.x;
            const itemAbsY = plat.y + item.y;

            // Check if player lands directly on item
            if (
              p.x + p.width >= itemAbsX &&
              p.x <= itemAbsX + item.width &&
              playerBottom >= itemAbsY
            ) {
              this.triggerItem(item, plat);
              break;
            }
          }

          // Handle platform types
          if (plat.type === 'broken') {
            plat.broken = true;
            plat.brokenTimer = 0;
            sound.playBreak();
            this.spawnPlatformDebris(plat.x + plat.width / 2, plat.y);
            // No bounce on broken platform!
            break;
          }

          // Standard bounce
          p.y = platTop - p.height;
          p.vy = PHYSICS.JUMP_FORCE;
          p.squashFactor = 0.76; // Landing squash
          sound.playBounce();
          this.spawnJumpParticles(p.x + p.width / 2, platTop);

          if (plat.type === 'disappearing') {
            plat.disappeared = true;
          }
          break;
        }
      }
    }

    // 4. Update Platforms (moving & vertical)
    for (const plat of this.platforms) {
      if (plat.type === 'moving') {
        plat.x += plat.vx;
        if (plat.minX !== undefined && plat.x <= plat.minX) {
          plat.x = plat.minX;
          plat.vx = Math.abs(plat.vx);
        } else if (plat.maxX !== undefined && plat.x >= plat.maxX) {
          plat.x = plat.maxX;
          plat.vx = -Math.abs(plat.vx);
        }
      } else if (plat.type === 'vertical') {
        plat.y += plat.vy;
        if (plat.minY !== undefined && plat.y <= plat.minY) {
          plat.y = plat.minY;
          plat.vy = Math.abs(plat.vy);
        } else if (plat.maxY !== undefined && plat.y >= plat.maxY) {
          plat.y = plat.maxY;
          plat.vy = -Math.abs(plat.vy);
        }
      }

      if (plat.broken && plat.brokenTimer !== undefined) {
        plat.brokenTimer += 1;
      }
    }

    // 5. Update Monsters & Collisions
    for (const m of this.monsters) {
      if (!m.alive) continue;

      if (m.type === 'flyer') {
        m.x += m.vx;
        if (m.x < 15 || m.x > CANVAS_WIDTH - m.width - 15) {
          m.vx *= -1;
        }
      } else if (m.type === 'blackhole') {
        m.rotation = (m.rotation || 0) + 0.05;
        // Gravitational pull toward black hole
        const mCenterX = m.x + m.width / 2;
        const mCenterY = m.y + m.height / 2;
        const pCenterX = p.x + p.width / 2;
        const pCenterY = p.y + p.height / 2;
        const dist = Math.hypot(mCenterX - pCenterX, mCenterY - pCenterY);

        if (dist < 100 && !p.activePowerup) {
          p.vx += ((mCenterX - pCenterX) / dist) * 0.45;
          p.vy += ((mCenterY - pCenterY) / dist) * 0.45;
        }
      }

      // Monster collision with Player
      const mCenterX = m.x + m.width / 2;
      const mCenterY = m.y + m.height / 2;
      const pCenterX = p.x + p.width / 2;
      const pCenterY = p.y + p.height / 2;
      const colDist = Math.hypot(mCenterX - pCenterX, mCenterY - pCenterY);
      const hitRadius = (m.width / 2) + (p.width / 2) - 6;

      if (colDist < hitRadius) {
        // If flying with jetpack or propeller: Monster is destroyed!
        if (p.activePowerup) {
          this.defeatMonster(m);
        }
        // If jumping on top of monster from above
        else if (p.vy > 0 && p.y + p.height <= mCenterY + 10 && m.type !== 'blackhole') {
          this.defeatMonster(m);
          p.vy = PHYSICS.TRAMPOLINE_FORCE;
          p.squashFactor = 0.72;
          sound.playTrampoline();
        }
        // Player has shield
        else if (p.hasShield) {
          p.hasShield = false;
          this.callbacks.onShieldUpdate(false);
          this.defeatMonster(m);
          sound.playMonsterHit();
        }
        // Fatal hit!
        else {
          this.triggerGameOver();
          return;
        }
      }
    }

    // 6. Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx;
      proj.y += proj.vy;

      // Check hit with monsters
      let hit = false;
      for (const m of this.monsters) {
        if (!m.alive) continue;
        const dist = Math.hypot(proj.x - (m.x + m.width / 2), proj.y - (m.y + m.height / 2));
        if (dist < m.width / 2 + proj.radius) {
          this.defeatMonster(m);
          hit = true;
          break;
        }
      }

      if (hit || proj.y < this.cameraY - 50 || proj.x < 0 || proj.x > CANVAS_WIDTH) {
        this.projectiles.splice(i, 1);
      }
    }

    // 7. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const part = this.particles[i];
      part.x += part.vx;
      part.y += part.vy;
      part.life -= dt;
      if (part.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 8. Camera Scrolling (Smoothly ascends as player climbs)
    const targetCameraY = p.y - CANVAS_HEIGHT * 0.45;
    if (targetCameraY < this.cameraY) {
      this.cameraY = targetCameraY;
    }

    // Calculate live score from highest altitude
    const currentAltitude = Math.floor(-this.cameraY);
    if (currentAltitude > this.score) {
      this.score = currentAltitude;
      this.callbacks.onScoreUpdate(this.score);

      // Milestone checks
      if (this.score >= 1000) this.checkAchievement('altitude_1k');
      if (this.score >= 5000) this.checkAchievement('altitude_5k');
      if (this.score >= 10000) this.checkAchievement('altitude_10k');
    }

    // 9. Procedural Generation & Pruning
    // Remove platforms far below
    this.platforms = this.platforms.filter((plat) => plat.y < this.cameraY + CANVAS_HEIGHT + 120);
    this.monsters = this.monsters.filter((m) => m.y < this.cameraY + CANVAS_HEIGHT + 150);

    // Find highest platform
    let minPlatformY = Infinity;
    for (const plat of this.platforms) {
      if (plat.y < minPlatformY) minPlatformY = plat.y;
    }

    // Generate new platforms above visible area
    while (minPlatformY > this.cameraY - 200) {
      // Dynamic gap based on score
      const baseGap = PLATFORM.MIN_GAP + Math.min(75, Math.floor(this.score / 250) * 4);
      const gap = baseGap + Math.random() * 32;
      minPlatformY -= gap;
      this.spawnPlatformAt(minPlatformY);
    }

    // 10. Fall Check (Game Over)
    if (p.y > this.cameraY + CANVAS_HEIGHT + 40) {
      sound.playFall();
      this.triggerGameOver();
    }
  }

  private triggerItem(item: any, platform: Platform) {
    item.used = true;
    const p = this.player;

    if (item.type === 'spring') {
      p.y = platform.y + item.y - p.height;
      p.vy = PHYSICS.SPRING_FORCE;
      p.squashFactor = 0.65;
      sound.playSpring();
      this.springsUsed++;
      if (this.springsUsed >= 5) this.checkAchievement('spring_master');
      this.spawnJumpParticles(p.x + p.width / 2, platform.y, '#f59e0b');
    } else if (item.type === 'trampoline') {
      p.y = platform.y + item.y - p.height;
      p.vy = PHYSICS.TRAMPOLINE_FORCE;
      p.squashFactor = 0.6;
      sound.playTrampoline();
      this.spawnJumpParticles(p.x + p.width / 2, platform.y, '#3b82f6');
    } else if (item.type === 'propeller') {
      p.activePowerup = 'propeller';
      p.powerupTimeRemaining = PHYSICS.PROPELLER_DURATION;
      sound.playPropeller();
      this.checkAchievement('propeller_ace');
      this.callbacks.onPowerupUpdate('propeller', 100);
    } else if (item.type === 'jetpack') {
      p.activePowerup = 'jetpack';
      p.powerupTimeRemaining = PHYSICS.JETPACK_DURATION;
      sound.playJetpack();
      this.jetpacksUsed++;
      this.checkAchievement('jetsetter');
      this.callbacks.onPowerupUpdate('jetpack', 100);
    } else if (item.type === 'shield') {
      p.hasShield = true;
      sound.playBounce();
      this.callbacks.onShieldUpdate(true);
    }
  }

  private defeatMonster(m: Monster) {
    m.alive = false;
    this.monstersDefeated++;
    sound.playMonsterHit();

    if (this.monstersDefeated >= 3) {
      this.checkAchievement('monster_hunter');
    }

    // Spawn defeat stars and confetti
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x: m.x + m.width / 2,
        y: m.y + m.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: ['#f43f5e', '#a855f7', '#fbbf24', '#38bdf8'][i % 4],
        radius: 3 + Math.random() * 3,
        life: 0.5,
        maxLife: 0.5,
        shape: 'star',
      });
    }
  }

  private triggerGameOver() {
    this.state = 'GAME_OVER';
    let isNewHigh = false;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      isNewHigh = true;
      localStorage.setItem('doodle_high_score', String(this.highScore));
      sound.playHighscore();
    }

    this.updateMarkers();
    this.callbacks.onGameOver(this.score, isNewHigh);
  }

  private spawnJumpParticles(x: number, y: number, color: string = '#8ec63f') {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y,
        vx: (Math.random() - 0.5) * 3,
        vy: 1 + Math.random() * 2,
        color,
        radius: 2 + Math.random() * 2,
        life: 0.25,
        maxLife: 0.25,
        shape: 'circle',
      });
    }
  }

  private spawnPlatformDebris(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: -1 + Math.random() * 4,
        color: '#a67243',
        radius: 2 + Math.random() * 2,
        life: 0.4,
        maxLife: 0.4,
        shape: 'chunk',
      });
    }
  }

  public render() {
    this.renderer.render(
      this.player,
      this.platforms,
      this.monsters,
      this.projectiles,
      this.particles,
      this.cameraY,
      this.markers,
      this.score
    );
  }

  public cleanup() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }
}
