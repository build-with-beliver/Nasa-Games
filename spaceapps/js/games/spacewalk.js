/**
 * Believers Junior Astronaut Space Academy
 * Mission 3: Spacewalk EVA Satellite & Station Repair
 */

class SpacewalkGame {
  constructor(containerId, onComplete) {
    this.container = document.getElementById(containerId);
    this.onComplete = onComplete;
    this.solarAngle = 18;
    this.targetSolarAngle = 65;
    this.solarAligned = false;

    this.connectedCircuits = 0;
    this.totalCircuits = 3;

    this.debrisCount = 4;
    this.debrisCleared = 0;

    this.oxygenLevel = 100;
    this.timerId = null;

    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="mission-hud">
        <div class="hud-item"><span class="hud-label">EVA OPERATION</span><span class="hud-val highlight">STATION SOLAR OUTPOST</span></div>
        <div class="hud-item"><span class="hud-label">SUIT OXYGEN</span>
          <div class="hud-meter"><div id="eva-o2-fill" class="hud-fill" style="width: 100%"></div></div>
        </div>
        <div class="hud-item"><span class="hud-label">SOLAR EFFICIENCY</span><span id="solar-eff-val" class="hud-val">20%</span></div>
        <div class="hud-item"><span class="hud-label">CIRCUITS</span><span id="circuit-val" class="hud-val">0 / 3</span></div>
        <button id="spacewalk-exit-btn" class="hud-btn-exit" title="Abort Mission">✕ EXIT</button>
      </div>

      <div class="spacewalk-body">
        <div class="eva-task-card">
          <div class="task-step ${this.solarAligned ? 'completed' : 'active'}" id="step-1">
            <h3>TASK 1: ALIGN SOLAR WING</h3>
            <p>Rotate the photovoltaic array to catch optimal solar photons from the Sun.</p>
            <div class="solar-align-box">
              <div class="solar-wing-visual" id="solar-wing" style="transform: rotate(${this.solarAngle}deg)">
                <div class="solar-grid-pattern"></div>
              </div>
              <input type="range" id="solar-slider" min="0" max="90" value="${this.solarAngle}" class="cyber-slider">
              <div class="solar-indicator" id="solar-status">Angle: ${this.solarAngle}° (Target: ${this.targetSolarAngle}°)</div>
            </div>
          </div>

          <div class="task-step ${this.connectedCircuits >= 3 ? 'completed' : ''}" id="step-2">
            <h3>TASK 2: RECONNECT POWER RELAYS</h3>
            <p>Click matching plasma conduits to restore auxiliary life-support power.</p>
            <div class="circuit-grid">
              <button class="circuit-btn cyan" data-circuit="cyan">◈ CYAN RELAY A</button>
              <button class="circuit-btn gold" data-circuit="gold">◈ GOLD RELAY A</button>
              <button class="circuit-btn magenta" data-circuit="magenta">◈ MAGENTA RELAY A</button>
              
              <button class="circuit-btn gold" data-circuit="gold">◈ GOLD RELAY B</button>
              <button class="circuit-btn magenta" data-circuit="magenta">◈ MAGENTA RELAY B</button>
              <button class="circuit-btn cyan" data-circuit="cyan">◈ CYAN RELAY B</button>
            </div>
            <div id="circuit-status" class="status-msg">Click two matching relays to close circuit!</div>
          </div>

          <div class="task-step ${this.debrisCleared >= 4 ? 'completed' : ''}" id="step-3">
            <h3>TASK 3: CLEAR MICROMETEORITE DEBRIS</h3>
            <p>Use suit magnetic grappler to remove hazardous space rocks from the radiator.</p>
            <div class="debris-container" id="debris-zone">
              <div class="debris-item" data-id="1" style="top: 20%; left: 15%">☄️ ROCK-A</div>
              <div class="debris-item" data-id="2" style="top: 65%; left: 35%">☄️ ROCK-B</div>
              <div class="debris-item" data-id="3" style="top: 30%; left: 75%">☄️ ROCK-C</div>
              <div class="debris-item" data-id="4" style="top: 70%; left: 80%">☄️ ROCK-D</div>
            </div>
          </div>
        </div>
      </div>

      <div id="spacewalk-overlay" class="mission-overlay hidden">
        <div class="overlay-card">
          <h2>SPACEWALK TRIUMPH!</h2>
          <p>Station power restored to 100%! Mission Control honors your steady hands and space bravery.</p>
          <div class="reward-box">
            <span class="reward-xp">+350 XP</span>
            <span class="reward-badge">👨‍🚀 EVA Spacewalker Badge</span>
          </div>
          <button id="spacewalk-done-btn" class="cyber-btn primary">RETURN TO ACADEMY</button>
        </div>
      </div>
    `;

    this.bindEvents();
    this.startO2Timer();
  }

  startO2Timer() {
    this.timerId = setInterval(() => {
      this.oxygenLevel = Math.max(0, this.oxygenLevel - 0.4);
      const fill = document.getElementById('eva-o2-fill');
      if (fill) fill.style.width = `${this.oxygenLevel}%`;

      if (this.oxygenLevel <= 0) {
        clearInterval(this.timerId);
        alert('Suit oxygen warning! Automatic emergency airlock retrieval initiated.');
        this.destroy();
      }
    }, 1000);
  }

  bindEvents() {
    document.getElementById('spacewalk-exit-btn')?.addEventListener('click', () => this.destroy());

    // Task 1: Solar Slider
    const slider = document.getElementById('solar-slider');
    slider?.addEventListener('input', (e) => {
      this.solarAngle = parseInt(e.target.value);
      const wing = document.getElementById('solar-wing');
      if (wing) wing.style.transform = `rotate(${this.solarAngle}deg)`;

      const diff = Math.abs(this.solarAngle - this.targetSolarAngle);
      const eff = Math.max(10, Math.round(100 - diff * 3));
      document.getElementById('solar-eff-val').innerText = `${eff}%`;

      const status = document.getElementById('solar-status');
      if (diff <= 3) {
        status.innerHTML = '<span class="highlight">✔ OPTIMAL SUNLIGHT CAPTURE (100%)</span>';
        if (!this.solarAligned) {
          this.solarAligned = true;
          if (window.cosmicAudio) window.cosmicAudio.playSuccess();
          this.checkMissionComplete();
        }
      } else {
        status.innerText = `Angle: ${this.solarAngle}° (Adjust to ${this.targetSolarAngle}°)`;
      }
    });

    // Task 2: Relay connection
    let selectedRelay = null;
    document.querySelectorAll('.circuit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (btn.classList.contains('connected')) return;
        if (window.cosmicAudio) window.cosmicAudio.playMinecraftClick();

        if (!selectedRelay) {
          selectedRelay = btn;
          btn.classList.add('selected');
        } else {
          if (selectedRelay === btn) {
            btn.classList.remove('selected');
            selectedRelay = null;
            return;
          }

          if (selectedRelay.dataset.circuit === btn.dataset.circuit) {
            // Match!
            selectedRelay.classList.remove('selected');
            selectedRelay.classList.add('connected');
            btn.classList.add('connected');
            selectedRelay = null;
            this.connectedCircuits++;
            document.getElementById('circuit-val').innerText = `${this.connectedCircuits} / 3`;

            if (window.cosmicAudio) window.cosmicAudio.playSuccess();
            document.getElementById('circuit-status').innerHTML = '<span class="highlight">✔ Circuit conduit linked!</span>';

            this.checkMissionComplete();
          } else {
            // Mismatch
            selectedRelay.classList.remove('selected');
            selectedRelay = null;
            document.getElementById('circuit-status').innerText = 'Mismatch! Conduits must match colors.';
          }
        }
      });
    });

    // Task 3: Debris removal
    document.querySelectorAll('.debris-item').forEach(item => {
      item.addEventListener('click', () => {
        if (item.classList.contains('cleared')) return;
        item.classList.add('cleared');
        this.debrisCleared++;
        if (window.cosmicAudio) window.cosmicAudio.playMinecraftClick();

        if (this.debrisCleared >= this.debrisCount) {
          if (window.cosmicAudio) window.cosmicAudio.playSuccess();
          this.checkMissionComplete();
        }
      });
    });

    document.getElementById('spacewalk-done-btn')?.addEventListener('click', () => {
      this.destroy();
      if (this.onComplete) this.onComplete({ xp: 350, badge: 'eva_spacewalker' });
    });
  }

  checkMissionComplete() {
    if (this.solarAligned && this.connectedCircuits >= 3 && this.debrisCleared >= 4) {
      clearInterval(this.timerId);
      if (window.cosmicAudio) window.cosmicAudio.playSuccess();
      const overlay = document.getElementById('spacewalk-overlay');
      overlay?.classList.remove('hidden');
    }
  }

  destroy() {
    if (this.timerId) clearInterval(this.timerId);
    this.container.innerHTML = '';
    const event = new CustomEvent('cadet:exitMission');
    window.dispatchEvent(event);
  }
}

window.SpacewalkGame = SpacewalkGame;
