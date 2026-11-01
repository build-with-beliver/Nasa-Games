/**
 * Believers Junior Astronaut Space Academy
 * Mission 4: Planetary Meteor Shield Blaster
 */

class DefenseGame {
  constructor(containerId, onComplete) {
    this.container = document.getElementById(containerId);
    this.onComplete = onComplete;
    this.canvas = null;
    this.ctx = null;
    this.animId = null;

    this.score = 0;
    this.shield = 100;
    this.meteors = [];
    this.lasers = [];
    this.particles = [];
    this.turretAngle = -Math.PI / 2;
    this.turretPos = { x: 0, y: 0 };
    this.spawnTimer = 0;
    this.gameActive = true;
    this.targetScore = 15; // 15 meteors to pass cadet defense trial

    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="mission-hud">
        <div class="hud-item"><span class="hud-label">DEFENSE TRIAL</span><span class="hud-val highlight">BELIEVERS LUNAR DOME</span></div>
        <div class="hud-item"><span class="hud-label">METEORS INTERCEPTED</span><span id="defense-score" class="hud-val">0 / ${this.targetScore}</span></div>
        <div class="hud-item"><span class="hud-label">DOME SHIELD</span>
          <div class="hud-meter"><div id="defense-shield-fill" class="hud-fill" style="width: 100%"></div></div>
        </div>
        <button id="defense-exit-btn" class="hud-btn-exit" title="Exit to Academy">✕ EXIT</button>
      </div>
      <canvas id="defense-canvas"></canvas>
      <div class="defense-hint">AIM & CLICK / TAP ANYWHERE TO FIRE PLASMA LASERS!</div>
      
      <div id="defense-overlay" class="mission-overlay hidden">
        <div class="overlay-card">
          <h2 id="defense-title">DOME DEFENDED!</h2>
          <p id="defense-desc">Every incoming space hazard eliminated! The Believers Moon colony is safe.</p>
          <div class="reward-box">
            <span class="reward-xp">+400 XP</span>
            <span class="reward-badge">🛡️ Planetary Guardian Badge</span>
          </div>
          <button id="defense-retry-btn" class="cyber-btn">RETRY</button>
          <button id="defense-finish-btn" class="cyber-btn primary">CLAIM REWARD</button>
        </div>
      </div>
    `;

    this.canvas = document.getElementById('defense-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();

    this.bindEvents();
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
    this.turretPos = {
      x: this.canvas.width / 2,
      y: this.canvas.height - 45,
    };
  }

  bindEvents() {
    document.getElementById('defense-exit-btn')?.addEventListener('click', () => this.destroy());

    const handleAim = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;
      this.turretAngle = Math.atan2(mouseY - this.turretPos.y, mouseX - this.turretPos.x);
    };

    const handleFire = (clientX, clientY) => {
      if (!this.gameActive) return;
      handleAim(clientX, clientY);
      this.fireLaser();
    };

    this.canvas.addEventListener('mousemove', (e) => handleAim(e.clientX, e.clientY));
    this.canvas.addEventListener('mousedown', (e) => handleFire(e.clientX, e.clientY));
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        handleFire(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    document.getElementById('defense-retry-btn')?.addEventListener('click', () => this.reset());
    document.getElementById('defense-finish-btn')?.addEventListener('click', () => {
      this.destroy();
      if (this.onComplete) this.onComplete({ xp: 400, badge: 'planetary_guardian' });
    });
  }

  reset() {
    this.score = 0;
    this.shield = 100;
    this.meteors = [];
    this.lasers = [];
    this.particles = [];
    this.gameActive = true;
    document.getElementById('defense-overlay')?.classList.add('hidden');
    document.getElementById('defense-score').innerText = `0 / ${this.targetScore}`;
    document.getElementById('defense-shield-fill').style.width = '100%';
  }

  fireLaser() {
    if (window.cosmicAudio) window.cosmicAudio.playLaser();

    const speed = 14;
    const barrelLength = 36;
    const spawnX = this.turretPos.x + Math.cos(this.turretAngle) * barrelLength;
    const spawnY = this.turretPos.y + Math.sin(this.turretAngle) * barrelLength;

    this.lasers.push({
      x: spawnX,
      y: spawnY,
      vx: Math.cos(this.turretAngle) * speed,
      vy: Math.sin(this.turretAngle) * speed,
      length: 22,
    });
  }

  spawnMeteor() {
    const r = 18 + Math.random() * 22;
    const x = 50 + Math.random() * (this.canvas.width - 100);
    const targetX = this.canvas.width * 0.2 + Math.random() * (this.canvas.width * 0.6);
    const targetY = this.canvas.height - 30;

    const angle = Math.atan2(targetY - (-30), targetX - x);
    const speed = 1.2 + Math.random() * 1.5;

    this.meteors.push({
      x: x,
      y: -30,
      r: r,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.05,
      hp: r > 28 ? 2 : 1,
    });
  }

  update() {
    if (!this.gameActive) return;

    // Meteor Spawner
    this.spawnTimer++;
    if (this.spawnTimer > 60) {
      this.spawnMeteor();
      this.spawnTimer = 0;
    }

    // Update Lasers
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const l = this.lasers[i];
      l.x += l.vx;
      l.y += l.vy;
      if (l.x < -20 || l.x > this.canvas.width + 20 || l.y < -20 || l.y > this.canvas.height + 20) {
        this.lasers.splice(i, 1);
      }
    }

    // Update Meteors
    for (let mIdx = this.meteors.length - 1; mIdx >= 0; mIdx--) {
      const m = this.meteors[mIdx];
      m.x += m.vx;
      m.y += m.vy;
      m.rotation += m.rotSpeed;

      // Check collision with Lasers
      for (let lIdx = this.lasers.length - 1; lIdx >= 0; lIdx--) {
        const l = this.lasers[lIdx];
        const dist = Math.hypot(m.x - l.x, m.y - l.y);
        if (dist < m.r + 8) {
          // Hit!
          this.lasers.splice(lIdx, 1);
          m.hp--;

          // Spark particles
          for (let p = 0; p < 8; p++) {
            this.particles.push({
              x: l.x,
              y: l.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: 0.8,
              color: '#00f0ff',
            });
          }

          if (m.hp <= 0) {
            // Explode meteor
            this.meteors.splice(mIdx, 1);
            this.score++;
            document.getElementById('defense-score').innerText = `${this.score} / ${this.targetScore}`;
            if (window.cosmicAudio) window.cosmicAudio.playExplosion();

            for (let p = 0; p < 24; p++) {
              this.particles.push({
                x: m.x,
                y: m.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1.2,
                color: ['#ff8800', '#ffcc00', '#ff4400', '#ffffff'][Math.floor(Math.random() * 4)],
              });
            }

            if (this.score >= this.targetScore) {
              this.completeDefense(true);
            }
            break;
          }
        }
      }

      // Check if meteor hits Lunar Dome Shield
      if (m && m.y > this.canvas.height - 80) {
        this.meteors.splice(mIdx, 1);
        this.shield -= 25;
        if (window.cosmicAudio) window.cosmicAudio.playExplosion();

        const shieldFill = document.getElementById('defense-shield-fill');
        if (shieldFill) {
          shieldFill.style.width = `${Math.max(0, this.shield)}%`;
          shieldFill.style.backgroundColor = this.shield > 30 ? '#00e5ff' : '#ff3344';
        }

        if (this.shield <= 0) {
          this.completeDefense(false);
        }
      }
    }

    // Particles update
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.035;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  completeDefense(success) {
    this.gameActive = false;
    const overlay = document.getElementById('defense-overlay');
    const title = document.getElementById('defense-title');
    const desc = document.getElementById('defense-desc');
    const finishBtn = document.getElementById('defense-finish-btn');

    if (success) {
      if (window.cosmicAudio) window.cosmicAudio.playSuccess();
      title.innerText = 'LUNAR BASE DEFENDED!';
      desc.innerText = `All ${this.targetScore} incoming meteor threats vaporized with precision targeting! The Believers Moon colony salutes you.`;
      finishBtn.style.display = 'inline-block';
    } else {
      title.innerText = 'SHIELDS COLLAPSED';
      desc.innerText = 'Meteors overwhelmed the energy barrier. Reboot shields and retry the trial!';
      finishBtn.style.display = 'none';
    }
    overlay?.classList.remove('hidden');
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Lunar Dome Shield Arc
    const domeRadius = this.canvas.width * 0.45;
    this.ctx.save();
    this.ctx.strokeStyle = this.shield > 30 ? 'rgba(0, 229, 255, 0.45)' : 'rgba(255, 60, 60, 0.55)';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.arc(this.turretPos.x, this.canvas.height + 60, domeRadius, Math.PI, 0);
    this.ctx.stroke();

    // Shield glow fill
    this.ctx.fillStyle = this.shield > 30 ? 'rgba(0, 229, 255, 0.06)' : 'rgba(255, 60, 60, 0.08)';
    this.ctx.fill();
    this.ctx.restore();

    // Draw Meteors
    this.meteors.forEach(m => {
      this.ctx.save();
      this.ctx.translate(m.x, m.y);
      this.ctx.rotate(m.rotation);

      // Fiery aura
      const grad = this.ctx.createRadialGradient(0, 0, m.r * 0.4, 0, 0, m.r * 1.5);
      grad.addColorStop(0, 'rgba(255, 120, 0, 0.8)');
      grad.addColorStop(1, 'rgba(255, 50, 0, 0)');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, m.r * 1.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Meteor Body
      this.ctx.fillStyle = '#6e5d53';
      this.ctx.strokeStyle = '#9e8576';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, m.r, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Crater
      this.ctx.fillStyle = '#4a3b33';
      this.ctx.beginPath();
      this.ctx.arc(m.r * 0.2, -m.r * 0.2, m.r * 0.35, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // Draw Lasers
    this.lasers.forEach(l => {
      this.ctx.save();
      this.ctx.strokeStyle = '#00f0ff';
      this.ctx.shadowColor = '#00f0ff';
      this.ctx.shadowBlur = 12;
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.moveTo(l.x, l.y);
      this.ctx.lineTo(l.x - l.vx * 1.2, l.y - l.vy * 1.2);
      this.ctx.stroke();
      this.ctx.restore();
    });

    // Draw Particles
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // Draw Turret Cannon Base
    this.ctx.save();
    this.ctx.translate(this.turretPos.x, this.turretPos.y);

    // Dome base
    this.ctx.fillStyle = '#1e2438';
    this.ctx.strokeStyle = '#00e5ff';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(0, 20, 38, Math.PI, 0);
    this.ctx.fill();
    this.ctx.stroke();

    // Turret Barrel (rotating)
    this.ctx.rotate(this.turretAngle + Math.PI / 2);
    this.ctx.fillStyle = '#3a4768';
    this.ctx.fillRect(-6, -34, 12, 34);
    this.ctx.fillStyle = '#00f0ff';
    this.ctx.fillRect(-3, -36, 6, 6);

    // Pivot ring
    this.ctx.fillStyle = '#00e5ff';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 10, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  loop() {
    this.update();
    this.draw();
    this.animId = requestAnimationFrame(() => this.loop());
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    this.container.innerHTML = '';
    const event = new CustomEvent('cadet:exitMission');
    window.dispatchEvent(event);
  }
}

window.DefenseGame = DefenseGame;
