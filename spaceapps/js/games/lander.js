/**
 * Believers Junior Astronaut Space Academy
 * Mission 1: Lunar Lander & Station Docking Simulator
 */

class LanderGame {
  constructor(containerId, onComplete) {
    this.container = document.getElementById(containerId);
    this.onComplete = onComplete;
    this.canvas = null;
    this.ctx = null;
    this.animId = null;

    this.keys = { up: false, left: false, right: false };
    this.particles = [];
    this.asteroids = [];
    
    // Physics parameters
    this.gravity = 0.045;
    this.thrustPower = 0.12;
    this.rotSpeed = 0.055;
    this.maxSafeSpeed = 1.6;

    this.ship = {
      x: 100,
      y: 80,
      vx: 1.0,
      vy: 0,
      angle: 0,
      fuel: 100,
      width: 32,
      height: 42,
      alive: true,
      docked: false,
    };

    this.dockPad = {
      x: 0,
      y: 0,
      width: 140,
      height: 24,
    };

    this.stars = [];
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="mission-hud">
        <div class="hud-item"><span class="hud-label">ALTITUDE</span><span id="lander-alt" class="hud-val">1000m</span></div>
        <div class="hud-item"><span class="hud-label">VELOCITY</span><span id="lander-vel" class="hud-val">0.0 m/s</span></div>
        <div class="hud-item"><span class="hud-label">FUEL</span>
          <div class="hud-meter"><div id="lander-fuel-fill" class="hud-fill" style="width: 100%"></div></div>
        </div>
        <div class="hud-item"><span class="hud-label">TARGET</span><span class="hud-val highlight">SPACE DOCK ALPHA</span></div>
        <button id="lander-exit-btn" class="hud-btn-exit" title="Abort Mission">✕ EXIT</button>
      </div>
      <canvas id="lander-canvas"></canvas>
      <div class="touch-controls">
        <button id="touch-left" class="t-btn">◄ ROTATE L</button>
        <button id="touch-thrust" class="t-btn thrust-main">▲ THRUSTER</button>
        <button id="touch-right" class="t-btn">ROTATE R ►</button>
      </div>
      <div id="lander-overlay" class="mission-overlay hidden">
        <div class="overlay-card">
          <h2 id="lander-msg-title">DOCKING SUCCESSFUL!</h2>
          <p id="lander-msg-desc">Smooth touchdown, Cadet! Space Station Alpha docking clamps locked.</p>
          <div class="reward-box">
            <span class="reward-xp">+250 XP</span>
            <span class="reward-badge">🏅 Docking Master Badge</span>
          </div>
          <button id="lander-restart-btn" class="cyber-btn">RETRY MISSION</button>
          <button id="lander-continue-btn" class="cyber-btn primary">CONTINUE TO ACADEMY</button>
        </div>
      </div>
    `;

    this.canvas = document.getElementById('lander-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();

    // Background stars for 2D canvas
    for (let i = 0; i < 70; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        r: Math.random() * 1.5 + 0.5,
        twinkle: Math.random() * Math.PI,
      });
    }

    // Docking Pad position (Station Alpha bottom right)
    this.dockPad.x = this.canvas.width * 0.72;
    this.dockPad.y = this.canvas.height - 70;

    // Asteroids
    this.asteroids = [
      { x: this.canvas.width * 0.35, y: 150, r: 24, vy: 0.3, vx: -0.1 },
      { x: this.canvas.width * 0.55, y: 280, r: 32, vy: -0.2, vx: 0.15 },
    ];

    this.bindEvents();
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
    if (this.dockPad) {
      this.dockPad.x = Math.max(120, this.canvas.width * 0.72);
      this.dockPad.y = this.canvas.height - 70;
    }
  }

  bindEvents() {
    this.onKeyDown = (e) => {
      if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') {
        this.keys.up = true;
        if (this.ship.alive && !this.ship.docked && window.cosmicAudio) window.cosmicAudio.startThruster();
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = true;
    };

    this.onKeyUp = (e) => {
      if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') {
        this.keys.up = false;
        if (window.cosmicAudio) window.cosmicAudio.stopThruster();
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
    };

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    // Touch button bindings
    const btnThrust = document.getElementById('touch-thrust');
    const btnLeft = document.getElementById('touch-left');
    const btnRight = document.getElementById('touch-right');

    const bindTouch = (elem, key) => {
      if (!elem) return;
      elem.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.keys[key] = true;
        if (key === 'up' && this.ship.alive && !this.ship.docked && window.cosmicAudio) {
          window.cosmicAudio.startThruster();
        }
      });
      const release = (e) => {
        e.preventDefault();
        this.keys[key] = false;
        if (key === 'up' && window.cosmicAudio) window.cosmicAudio.stopThruster();
      };
      elem.addEventListener('pointerup', release);
      elem.addEventListener('pointerleave', release);
      elem.addEventListener('pointercancel', release);
    };

    bindTouch(btnThrust, 'up');
    bindTouch(btnLeft, 'left');
    bindTouch(btnRight, 'right');

    document.getElementById('lander-exit-btn')?.addEventListener('click', () => this.destroy());
    document.getElementById('lander-restart-btn')?.addEventListener('click', () => this.reset());
    document.getElementById('lander-continue-btn')?.addEventListener('click', () => {
      this.destroy();
      if (this.onComplete) this.onComplete({ xp: 250, badge: 'docking_master' });
    });
  }

  reset() {
    this.ship = {
      x: 100,
      y: 80,
      vx: 1.0,
      vy: 0,
      angle: 0,
      fuel: 100,
      width: 32,
      height: 42,
      alive: true,
      docked: false,
    };
    this.particles = [];
    document.getElementById('lander-overlay')?.classList.add('hidden');
  }

  update() {
    if (!this.ship.alive || this.ship.docked) return;

    // Rotation
    if (this.keys.left) this.ship.angle -= this.rotSpeed;
    if (this.keys.right) this.ship.angle += this.rotSpeed;

    // Thrust
    if (this.keys.up && this.ship.fuel > 0) {
      this.ship.vx += Math.sin(this.ship.angle) * this.thrustPower;
      this.ship.vy -= Math.cos(this.ship.angle) * this.thrustPower;
      this.ship.fuel = Math.max(0, this.ship.fuel - 0.22);

      // Rocket flame particles
      const flameX = this.ship.x - Math.sin(this.ship.angle) * (this.ship.height / 2);
      const flameY = this.ship.y + Math.cos(this.ship.angle) * (this.ship.height / 2);
      for (let i = 0; i < 3; i++) {
        this.particles.push({
          x: flameX + (Math.random() - 0.5) * 6,
          y: flameY + (Math.random() - 0.5) * 6,
          vx: -Math.sin(this.ship.angle) * (2 + Math.random() * 3) + (Math.random() - 0.5),
          vy: Math.cos(this.ship.angle) * (2 + Math.random() * 3) + (Math.random() - 0.5),
          life: 1,
          color: Math.random() > 0.4 ? '#ffaa00' : '#00e5ff',
        });
      }
    }

    // Apply Lunar Gravity
    this.ship.vy += this.gravity;

    // Velocity damping (space resistance)
    this.ship.vx *= 0.996;
    this.ship.vy *= 0.996;

    // Position integration
    this.ship.x += this.ship.vx;
    this.ship.y += this.ship.vy;

    // Screen bounds bounce
    if (this.ship.x < 20) { this.ship.x = 20; this.ship.vx = Math.abs(this.ship.vx) * 0.6; }
    if (this.ship.x > this.canvas.width - 20) { this.ship.x = this.canvas.width - 20; this.ship.vx = -Math.abs(this.ship.vx) * 0.6; }
    if (this.ship.y < 20) { this.ship.y = 20; this.ship.vy = Math.abs(this.ship.vy) * 0.5; }

    // Update asteroids
    this.asteroids.forEach(ast => {
      ast.y += ast.vy;
      ast.x += ast.vx;
      if (ast.y < 80 || ast.y > this.canvas.height - 120) ast.vy *= -1;
      if (ast.x < 100 || ast.x > this.canvas.width - 100) ast.vx *= -1;

      // Collision check with ship
      const dist = Math.hypot(this.ship.x - ast.x, this.ship.y - ast.y);
      if (dist < ast.r + 14) {
        this.crash('Collided with orbital space debris!');
      }
    });

    // Landing on pad check
    const padTop = this.dockPad.y;
    const shipBottom = this.ship.y + this.ship.height / 2;
    if (shipBottom >= padTop && this.ship.y < padTop + 20) {
      if (this.ship.x >= this.dockPad.x && this.ship.x <= this.dockPad.x + this.dockPad.width) {
        const totalSpeed = Math.hypot(this.ship.vx, this.ship.vy);
        const normAngle = Math.abs(Math.sin(this.ship.angle));

        if (totalSpeed <= this.maxSafeSpeed && normAngle < 0.28) {
          this.landSuccess();
        } else {
          this.crash(`Hard touchdown! Speed: ${totalSpeed.toFixed(1)} m/s (Limit: ${this.maxSafeSpeed} m/s)`);
        }
      } else {
        this.crash('Missed the docking pad and struck the station hull!');
      }
    } else if (this.ship.y > this.canvas.height + 20) {
      this.crash('Fell into deep space vacuum!');
    }

    // Update HUD
    const speed = Math.hypot(this.ship.vx, this.ship.vy);
    const alt = Math.max(0, Math.round(this.dockPad.y - shipBottom));
    document.getElementById('lander-alt').innerText = `${alt}m`;
    const velElem = document.getElementById('lander-vel');
    velElem.innerText = `${speed.toFixed(1)} m/s`;
    velElem.style.color = speed <= this.maxSafeSpeed ? '#00e5ff' : '#ff4444';

    const fuelFill = document.getElementById('lander-fuel-fill');
    fuelFill.style.width = `${this.ship.fuel}%`;
    fuelFill.style.backgroundColor = this.ship.fuel > 25 ? '#00e5ff' : '#ff3344';
  }

  landSuccess() {
    this.ship.docked = true;
    this.ship.vx = 0;
    this.ship.vy = 0;
    if (window.cosmicAudio) {
      window.cosmicAudio.stopThruster();
      window.cosmicAudio.playSuccess();
    }

    const overlay = document.getElementById('lander-overlay');
    document.getElementById('lander-msg-title').innerText = 'DOCKING PERFECTED!';
    document.getElementById('lander-msg-desc').innerText =
      `Touchdown at 0.${Math.round(Math.hypot(this.ship.vx, this.ship.vy) * 10)} m/s! Station Alpha crew reports zero vibration. Outstanding flying, Junior Astronaut!`;
    document.getElementById('lander-continue-btn').style.display = 'inline-block';
    overlay.classList.remove('hidden');
  }

  crash(reason) {
    this.ship.alive = false;
    if (window.cosmicAudio) {
      window.cosmicAudio.stopThruster();
      window.cosmicAudio.playExplosion();
    }

    // Explosion particles
    for (let i = 0; i < 35; i++) {
      this.particles.push({
        x: this.ship.x,
        y: this.ship.y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1.5,
        color: ['#ff4400', '#ffbb00', '#ffffff', '#00e5ff'][Math.floor(Math.random() * 4)],
      });
    }

    const overlay = document.getElementById('lander-overlay');
    document.getElementById('lander-msg-title').innerText = 'MISSION FAILED - HULL BREACH';
    document.getElementById('lander-msg-desc').innerText = `${reason} Astronaut safety pod activated. Recalibrate thrusters and try again!`;
    document.getElementById('lander-continue-btn').style.display = 'none';
    overlay.classList.remove('hidden');
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Stars
    this.ctx.fillStyle = '#ffffff';
    this.stars.forEach(s => {
      s.twinkle += 0.05;
      const alpha = 0.4 + Math.sin(s.twinkle) * 0.4;
      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Space Station Dock Alpha Body
    const pad = this.dockPad;
    this.ctx.save();
    // Station hull girder
    this.ctx.fillStyle = '#1e2436';
    this.ctx.fillRect(pad.x - 40, pad.y + 12, pad.width + 80, 50);
    this.ctx.strokeStyle = '#00e5ff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(pad.x - 40, pad.y + 12, pad.width + 80, 50);

    // Landing Pad surface
    this.ctx.fillStyle = '#2a3552';
    this.ctx.fillRect(pad.x, pad.y, pad.width, pad.height);
    this.ctx.strokeStyle = '#00ff88';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(pad.x, pad.y, pad.width, pad.height);

    // Flashing green runway beacons
    const beaconTime = Date.now() * 0.005;
    const beaconGlow = Math.sin(beaconTime) > 0 ? '#00ff88' : '#006633';
    this.ctx.fillStyle = beaconGlow;
    this.ctx.beginPath();
    this.ctx.arc(pad.x + 12, pad.y + 12, 6, 0, Math.PI * 2);
    this.ctx.arc(pad.x + pad.width - 12, pad.y + 12, 6, 0, Math.PI * 2);
    this.ctx.fill();

    // Pad text
    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = 'bold 12px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('◄ ALPHA DOCK ►', pad.x + pad.width / 2, pad.y + 16);
    this.ctx.restore();

    // Draw Asteroids
    this.asteroids.forEach(ast => {
      this.ctx.save();
      this.ctx.translate(ast.x, ast.y);
      this.ctx.fillStyle = '#655a6a';
      this.ctx.strokeStyle = '#8a7d90';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, ast.r, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Asteroid crater detail
      this.ctx.fillStyle = '#493f4e';
      this.ctx.beginPath();
      this.ctx.arc(ast.r * 0.3, -ast.r * 0.2, ast.r * 0.3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // Draw Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.035;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
    }

    // Draw Lander Ship
    if (this.ship.alive) {
      this.ctx.save();
      this.ctx.translate(this.ship.x, this.ship.y);
      this.ctx.rotate(this.ship.angle);

      // Ship Hull (Apollo Lunar Module / Futuristic Shuttle style)
      // Legs
      this.ctx.strokeStyle = '#ffd700';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(-10, 10);
      this.ctx.lineTo(-20, 22);
      this.ctx.moveTo(10, 10);
      this.ctx.lineTo(20, 22);
      this.ctx.stroke();

      // Footpads
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(-23, 20, 6, 3);
      this.ctx.fillRect(17, 20, 6, 3);

      // Main Capsule (Futuristic White & Gold)
      this.ctx.fillStyle = '#e8ebf0';
      this.ctx.beginPath();
      this.ctx.moveTo(0, -22);
      this.ctx.lineTo(14, 5);
      this.ctx.lineTo(-14, 5);
      this.ctx.closePath();
      this.ctx.fill();

      // Gold insulation bottom base
      this.ctx.fillStyle = '#d4af37';
      this.ctx.fillRect(-12, 5, 24, 8);

      // Cyan cockpit glass window
      this.ctx.fillStyle = '#00f0ff';
      this.ctx.beginPath();
      this.ctx.arc(0, -6, 5, 0, Math.PI * 2);
      this.ctx.fill();

      // Thruster nozzle
      this.ctx.fillStyle = '#444455';
      this.ctx.fillRect(-6, 13, 12, 4);

      // Velocity trajectory guide line
      this.ctx.restore();
      this.ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
      this.ctx.setLineDash([4, 4]);
      this.ctx.beginPath();
      this.ctx.moveTo(this.ship.x, this.ship.y);
      this.ctx.lineTo(this.ship.x + this.ship.vx * 16, this.ship.y + this.ship.vy * 16);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }
  }

  loop() {
    this.update();
    this.draw();
    this.animId = requestAnimationFrame(() => this.loop());
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    if (window.cosmicAudio) window.cosmicAudio.stopThruster();
    this.container.innerHTML = '';
    // Show main mission menu again
    const event = new CustomEvent('cadet:exitMission');
    window.dispatchEvent(event);
  }
}

window.LanderGame = LanderGame;
