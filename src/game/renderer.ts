import { 
  Player, 
  Platform, 
  Monster, 
  Projectile, 
  Particle, 
  ScoreMarker,
  ThemeId 
} from './types';
import { THEMES, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private themeId: ThemeId = 'classic';
  private frameCount: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public setTheme(theme: ThemeId) {
    this.themeId = theme;
  }

  public render(
    player: Player,
    platforms: Platform[],
    monsters: Monster[],
    projectiles: Projectile[],
    particles: Particle[],
    cameraY: number,
    markers: ScoreMarker[],
    score: number
  ) {
    this.frameCount++;
    const ctx = this.ctx;
    const theme = THEMES[this.themeId];

    // 1. Draw Background
    this.drawBackground(cameraY);

    // 2. Draw Altitude Markers & Milestones (Right edge)
    this.drawMarkers(markers, cameraY);

    // 3. Draw Platforms & Items
    platforms.forEach((p) => {
      this.drawPlatform(p, cameraY);
    });

    // 4. Draw Monsters
    monsters.forEach((m) => {
      if (m.alive) {
        this.drawMonster(m, cameraY);
      }
    });

    // 5. Draw Projectiles
    this.drawProjectiles(projectiles, cameraY);

    // 6. Draw Particles
    this.drawParticles(particles, cameraY);

    // 7. Draw Player
    this.drawPlayer(player, cameraY);

    // 8. Draw Vignette / Scanline overlay if retro
    if (this.themeId === 'retro') {
      this.drawRetroScanlines();
    }
  }

  private drawBackground(cameraY: number) {
    const ctx = this.ctx;
    const theme = THEMES[this.themeId];

    // Base background color
    ctx.fillStyle = theme.canvasBg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid lines / starfields
    if (this.themeId === 'classic') {
      // Graph paper grid
      ctx.strokeStyle = theme.gridLineColor;
      ctx.lineWidth = 1;
      const gridSize = 25;
      const offsetY = (-cameraY) % gridSize;

      // Vertical lines
      for (let x = 0; x < CANVAS_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }

      // Horizontal lines (scrolling)
      for (let y = offsetY; y < CANVAS_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // Left red margin line (classic notebook style)
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.28)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(35, 0);
      ctx.lineTo(35, CANVAS_HEIGHT);
      ctx.stroke();
    } else if (this.themeId === 'galaxy') {
      // Twinkling stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 45; i++) {
        const starX = (i * 73) % CANVAS_WIDTH;
        const starY = (i * 127 - cameraY * 0.3) % CANVAS_HEIGHT;
        const actualY = starY < 0 ? starY + CANVAS_HEIGHT : starY;
        const size = (i % 3) + 1;
        const alpha = 0.4 + 0.5 * Math.sin(this.frameCount * 0.05 + i);

        ctx.globalAlpha = alpha;
        ctx.fillRect(starX, actualY, size, size);
      }
      ctx.globalAlpha = 1.0;
    } else if (this.themeId === 'jungle') {
      // Subtle background leaves / canopy shadows
      ctx.fillStyle = 'rgba(34, 197, 94, 0.04)';
      for (let i = 0; i < 6; i++) {
        const x = (i * 90) % CANVAS_WIDTH;
        const y = (i * 180 - cameraY * 0.2) % CANVAS_HEIGHT;
        const actualY = y < 0 ? y + CANVAS_HEIGHT : y;
        ctx.beginPath();
        ctx.arc(x, actualY, 60, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private drawMarkers(markers: ScoreMarker[], cameraY: number) {
    const ctx = this.ctx;
    const theme = THEMES[this.themeId];

    markers.forEach((m) => {
      const screenY = m.altitude - cameraY;
      if (screenY >= -30 && screenY <= CANVAS_HEIGHT + 30) {
        ctx.save();

        // Dashed horizontal line
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = m.type === 'personal' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(100, 116, 139, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, screenY);
        ctx.lineTo(CANVAS_WIDTH, screenY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Marker Tag / Flag on right edge
        const text = m.label;
        ctx.font = 'bold 11px Fredoka, sans-serif';
        const textWidth = ctx.measureText(text).width;
        const tagWidth = textWidth + 14;
        const tagX = CANVAS_WIDTH - tagWidth - 6;

        ctx.fillStyle = m.type === 'personal' ? '#ef4444' : '#64748b';
        this.roundRect(ctx, tagX, screenY - 9, tagWidth, 18, 4);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, tagX + tagWidth / 2, screenY);

        ctx.restore();
      }
    });
  }

  private drawPlatform(p: Platform, cameraY: number) {
    if (p.disappeared) return;

    const ctx = this.ctx;
    const screenY = p.y - cameraY;
    if (screenY < -40 || screenY > CANVAS_HEIGHT + 40) return;

    const theme = THEMES[this.themeId];
    const colors = theme.platformColors;

    ctx.save();

    if (p.type === 'broken' && p.broken) {
      // Draw crumbling two halves falling apart
      const timer = p.brokenTimer || 0;
      const drop = Math.pow(timer, 1.8) * 1.5;
      const rot = (timer * 0.04);

      // Left half
      ctx.save();
      ctx.translate(p.x + p.width * 0.25, screenY + drop);
      ctx.rotate(-rot);
      ctx.fillStyle = colors.broken;
      ctx.strokeStyle = colors.brokenBorder;
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, -p.width * 0.25, -p.height / 2, p.width * 0.5 - 2, p.height, 4);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Right half
      ctx.save();
      ctx.translate(p.x + p.width * 0.75, screenY + drop * 1.1);
      ctx.rotate(rot);
      ctx.fillStyle = colors.broken;
      ctx.strokeStyle = colors.brokenBorder;
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, -p.width * 0.25, -p.height / 2, p.width * 0.5 - 2, p.height, 4);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.restore();
      return;
    }

    // Determine color
    let fill = colors.standard;
    let stroke = colors.standardBorder;

    if (p.type === 'moving') {
      fill = colors.moving;
      stroke = colors.movingBorder;
    } else if (p.type === 'vertical') {
      fill = colors.vertical;
      stroke = colors.verticalBorder;
    } else if (p.type === 'broken') {
      fill = colors.broken;
      stroke = colors.brokenBorder;
    } else if (p.type === 'disappearing') {
      fill = colors.disappearing;
      stroke = colors.disappearingBorder;
    }

    // Platform Body with rounded corners
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = theme.doodleOutline ? 2 : 1.5;

    this.roundRect(ctx, p.x, screenY, p.width, p.height, 8);
    ctx.fill();
    ctx.stroke();

    // Visual detail per platform type
    if (p.type === 'broken') {
      // Draw jagged crack in middle
      ctx.strokeStyle = colors.brokenBorder;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x + p.width / 2, screenY);
      ctx.lineTo(p.x + p.width / 2 - 3, screenY + p.height * 0.4);
      ctx.lineTo(p.x + p.width / 2 + 3, screenY + p.height * 0.7);
      ctx.lineTo(p.x + p.width / 2, screenY + p.height);
      ctx.stroke();
    } else if (p.type === 'moving') {
      // Horizontal motion chevron indicator
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(p.x + 12, screenY + p.height / 2, 2.5, 0, Math.PI * 2);
      ctx.arc(p.x + p.width - 12, screenY + p.height / 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'disappearing') {
      // Cloud puff texture inside
      ctx.fillStyle = 'rgba(203, 213, 225, 0.45)';
      ctx.beginPath();
      ctx.arc(p.x + p.width * 0.35, screenY + p.height * 0.5, 4, 0, Math.PI * 2);
      ctx.arc(p.x + p.width * 0.65, screenY + p.height * 0.5, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Subtle top highlight reflection
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      this.roundRect(ctx, p.x + 4, screenY + 2, p.width - 8, 4, 2);
      ctx.fill();
    }

    // Draw Item on top of platform (if any)
    if (p.item && !p.item.used) {
      this.drawItem(p.item, p.x + p.item.x, screenY + p.item.y);
    }

    ctx.restore();
  }

  private drawItem(item: any, itemX: number, itemY: number) {
    const ctx = this.ctx;
    ctx.save();

    if (item.type === 'spring') {
      // Metallic coil spring
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';

      // Base plate
      ctx.fillStyle = '#64748b';
      ctx.fillRect(itemX + 2, itemY + item.height - 3, item.width - 4, 3);

      // Spring zigzag coil
      ctx.beginPath();
      const segments = 4;
      const stepY = (item.height - 4) / segments;
      ctx.moveTo(itemX + item.width / 2, itemY + item.height - 3);
      for (let i = 0; i < segments; i++) {
        const xOffset = i % 2 === 0 ? item.width - 2 : 2;
        ctx.lineTo(itemX + xOffset, itemY + item.height - 3 - (i + 0.5) * stepY);
      }
      ctx.lineTo(itemX + item.width / 2, itemY);
      ctx.stroke();

      // Top cap
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(itemX + 3, itemY - 2, item.width - 6, 3);
    } else if (item.type === 'trampoline') {
      // Mini Trampoline
      ctx.fillStyle = '#334155';
      ctx.fillRect(itemX + 2, itemY + item.height - 8, 3, 8);
      ctx.fillRect(itemX + item.width - 5, itemY + item.height - 8, 3, 8);

      ctx.fillStyle = '#3b82f6';
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, itemX, itemY + 2, item.width, 6, 3);
      ctx.fill();
      ctx.stroke();

      // Red fabric middle
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(itemX + 5, itemY + 4, item.width - 10, 2);
    } else if (item.type === 'propeller') {
      // Striped Beanie with propeller
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(itemX + item.width / 2, itemY + item.height - 2, item.width * 0.45, Math.PI, 0);
      ctx.fill();

      // Hat stripes
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(itemX + item.width / 2, itemY + item.height - 2, item.width * 0.35, Math.PI, 0);
      ctx.stroke();

      // Rotor stem
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(itemX + item.width / 2, itemY + item.height - 10);
      ctx.lineTo(itemX + item.width / 2, itemY);
      ctx.stroke();

      // Blades
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      this.roundRect(ctx, itemX + 2, itemY - 2, item.width - 4, 3, 1.5);
      ctx.fill();
      ctx.stroke();
    } else if (item.type === 'jetpack') {
      // Dual rocket tubes
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;

      // Tube 1
      this.roundRect(ctx, itemX + 2, itemY + 2, item.width * 0.42, item.height - 4, 3);
      ctx.fill();
      ctx.stroke();

      // Tube 2
      this.roundRect(ctx, itemX + item.width * 0.52, itemY + 2, item.width * 0.42, item.height - 4, 3);
      ctx.fill();
      ctx.stroke();

      // Red nose cones
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(itemX + item.width * 0.23, itemY + 3, item.width * 0.2, Math.PI, 0);
      ctx.arc(itemX + item.width * 0.73, itemY + 3, item.width * 0.2, Math.PI, 0);
      ctx.fill();

      // Exhaust nozzles
      ctx.fillStyle = '#334155';
      ctx.fillRect(itemX + 3, itemY + item.height - 2, item.width * 0.35, 3);
      ctx.fillRect(itemX + item.width * 0.55, itemY + item.height - 2, item.width * 0.35, 3);
    } else if (item.type === 'shield') {
      // Protective Crystal Orb
      const pulse = Math.sin(this.frameCount * 0.1) * 2;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(itemX + item.width / 2, itemY + item.height / 2, item.width / 2 + pulse * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner sparkle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(itemX + item.width / 2 - 3, itemY + item.height / 2 - 3, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawMonster(m: Monster, cameraY: number) {
    const ctx = this.ctx;
    const screenY = m.y - cameraY;
    if (screenY < -50 || screenY > CANVAS_HEIGHT + 50) return;

    ctx.save();
    ctx.translate(m.x + m.width / 2, screenY + m.height / 2);

    if (m.type === 'blackhole') {
      // Swirling gravity vortex
      const rot = (m.rotation || 0);
      ctx.rotate(rot);

      // Outer swirling arms
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(168, 85, 247, 0.6)' : 'rgba(59, 130, 246, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, m.width * 0.48, (i * Math.PI) / 2, (i * Math.PI) / 2 + 1.2);
        ctx.stroke();
      }

      // Core event horizon
      ctx.fillStyle = '#05050a';
      ctx.beginPath();
      ctx.arc(0, 0, m.width * 0.32, 0, Math.PI * 2);
      ctx.fill();

      // Glowing purple rim
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (m.type === 'flyer') {
      // Floating cute bat/alien monster with fluttering wings
      const wingFlap = Math.sin(this.frameCount * 0.25) * 6;

      // Wings
      ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.beginPath();
      // Left wing
      ctx.moveTo(-m.width * 0.2, 0);
      ctx.lineTo(-m.width * 0.65, -wingFlap);
      ctx.lineTo(-m.width * 0.4, 10);
      ctx.closePath();
      ctx.fill();

      // Right wing
      ctx.beginPath();
      ctx.moveTo(m.width * 0.2, 0);
      ctx.lineTo(m.width * 0.65, -wingFlap);
      ctx.lineTo(m.width * 0.4, 10);
      ctx.closePath();
      ctx.fill();

      // Round furry body
      ctx.fillStyle = '#8b5cf6';
      ctx.strokeStyle = '#6d28d9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, m.width * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 3 Cute Monster Eyes
      const eyePositions = [-9, 0, 9];
      eyePositions.forEach((posX) => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(posX, -4, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(posX, -4, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Monster sharp little mouth / fangs
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-6, 7);
      ctx.lineTo(-3, 11);
      ctx.lineTo(0, 7);
      ctx.lineTo(3, 11);
      ctx.lineTo(6, 7);
      ctx.closePath();
      ctx.fill();
    } else {
      // Static one-eyed spiky monster
      const breathe = Math.sin(this.frameCount * 0.08) * 2;

      // Spikes
      ctx.fillStyle = '#f97316';
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const spikeX = Math.cos(angle) * (m.width * 0.48 + breathe);
        const spikeY = Math.sin(angle) * (m.width * 0.48 + breathe);
        ctx.beginPath();
        ctx.arc(spikeX, spikeY, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Main body
      ctx.fillStyle = '#ea580c';
      ctx.strokeStyle = '#9a3412';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, m.width * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Big Cyclops Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -2, 10, 0, Math.PI * 2);
      ctx.fill();

      // Iris & pupil
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -2, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, -2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Tentacles below
      ctx.strokeStyle = '#c2410c';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      for (let t = -1; t <= 1; t++) {
        const sway = Math.sin(this.frameCount * 0.15 + t) * 3;
        ctx.beginPath();
        ctx.moveTo(t * 8, m.height * 0.3);
        ctx.quadraticCurveTo(t * 10 + sway, m.height * 0.45, t * 8, m.height * 0.55);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  private drawPlayer(p: Player, cameraY: number) {
    const ctx = this.ctx;
    const screenY = p.y - cameraY;
    const theme = THEMES[this.themeId];

    ctx.save();
    ctx.translate(p.x + p.width / 2, screenY + p.height / 2);

    // Apply squash and stretch scaling
    const scaleX = (p.facing === 'left' ? -1 : 1) * p.squashFactor;
    const scaleY = 1 / p.squashFactor;
    ctx.scale(scaleX, scaleY);

    // Jetpack drawn on back if equipped
    if (p.activePowerup === 'jetpack') {
      this.drawJetpackOnBack();
    }

    // 1. Stubby legs (4 classic Doodler legs)
    ctx.fillStyle = theme.playerColor;
    ctx.strokeStyle = theme.playerBorder;
    ctx.lineWidth = theme.doodleOutline ? 2.5 : 1.5;

    const legYOffset = p.vy < 0 ? -2 : 4; // Tucked when ascending, dangling when descending
    const legSpread = 6;
    for (let leg = -1.5; leg <= 1.5; leg += 1) {
      this.roundRect(ctx, leg * legSpread - 3, 14 + legYOffset, 6, 12, 3);
      ctx.fill();
      ctx.stroke();
    }

    // 2. Main Bean-Shaped Doodler Body
    ctx.fillStyle = theme.playerColor;
    ctx.strokeStyle = theme.playerBorder;
    ctx.lineWidth = theme.doodleOutline ? 2.5 : 1.5;

    ctx.beginPath();
    // Smooth bean shape with rounded top head and wider base
    ctx.ellipse(0, 0, 18, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. Trunk Snout (Points right in local coordinate space)
    const isShooting = p.shootAnimTimer > 0;
    const snoutY = isShooting ? -6 : 0;
    const snoutAngle = isShooting ? -0.35 : 0;

    ctx.save();
    ctx.translate(14, snoutY);
    ctx.rotate(snoutAngle);

    ctx.fillStyle = theme.playerNose;
    ctx.strokeStyle = theme.playerBorder;
    ctx.lineWidth = 2;

    // Snout funnel
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(14, -7);
    ctx.lineTo(14, 7);
    ctx.lineTo(0, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Snout end muzzle ring
    ctx.beginPath();
    ctx.ellipse(14, 0, 3, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // 4. Big expressive Doodler Eyes
    const eyeOffsetY = -8;
    // Eye 1 (Left eye)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = theme.playerBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(3, eyeOffsetY, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eye 2 (Right eye)
    ctx.beginPath();
    ctx.arc(12, eyeOffsetY, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupils (look right/upwards towards movement)
    const pupilLookY = isShooting ? -1.5 : (p.vy < 0 ? -1 : 0.5);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(4.5, eyeOffsetY + pupilLookY, 2.4, 0, Math.PI * 2);
    ctx.arc(13.5, eyeOffsetY + pupilLookY, 2.4, 0, Math.PI * 2);
    ctx.fill();

    // 5. Propeller Hat on head if active
    if (p.activePowerup === 'propeller') {
      this.drawPropellerOnHead();
    }

    // 6. Energy Shield Bubble around player
    if (p.hasShield) {
      const shieldPulse = Math.sin(this.frameCount * 0.15) * 2;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 32 + shieldPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawJetpackOnBack() {
    const ctx = this.ctx;
    ctx.save();
    // Drawn on left side of character (back)
    ctx.translate(-22, -8);

    // Jetpack canister
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, 0, 0, 10, 24, 3);
    ctx.fill();
    ctx.stroke();

    // Red rocket nose
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(5, 0, 5, Math.PI, 0);
    ctx.fill();

    // Roaring flame bursts coming out of exhaust!
    const flameHeight = 16 + Math.random() * 12;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(1, 24);
    ctx.lineTo(5, 24 + flameHeight);
    ctx.lineTo(9, 24);
    ctx.closePath();
    ctx.fill();

    // Inner bright yellow flame
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(2.5, 24);
    ctx.lineTo(5, 24 + flameHeight * 0.65);
    ctx.lineTo(7.5, 24);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private drawPropellerOnHead() {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(0, -22);

    // Beanie cap
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 11, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    // Rotor stem
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 0);
    ctx.stroke();

    // Spinning propeller blades! (simulated with oscillating horizontal width)
    const bladeW = Math.cos(this.frameCount * 0.8) * 22;
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.ellipse(0, -10, Math.abs(bladeW) + 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private drawProjectiles(projectiles: Projectile[], cameraY: number) {
    const ctx = this.ctx;
    ctx.save();
    projectiles.forEach((p) => {
      const screenY = p.y - cameraY;
      if (screenY < -20 || screenY > CANVAS_HEIGHT + 20) return;

      // Glow / outer ring
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(p.x, screenY, p.radius + 2, 0, Math.PI * 2);
      ctx.fill();

      // Pellet body
      ctx.fillStyle = '#eab308';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, screenY, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  }

  private drawParticles(particles: Particle[], cameraY: number) {
    const ctx = this.ctx;
    ctx.save();
    particles.forEach((p) => {
      const screenY = p.y - cameraY;
      if (screenY < -20 || screenY > CANVAS_HEIGHT + 20) return;

      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'square' || p.shape === 'chunk') {
        ctx.fillRect(p.x - p.radius, screenY - p.radius, p.radius * 2, p.radius * 2);
      } else if (p.shape === 'star') {
        this.drawStar(ctx, p.x, screenY, 4, p.radius * 1.5, p.radius * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, screenY, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();
  }

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  private drawRetroScanlines() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let y = 0; y < CANVAS_HEIGHT; y += 4) {
      ctx.fillRect(0, y, CANVAS_WIDTH, 1.5);
    }
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}
