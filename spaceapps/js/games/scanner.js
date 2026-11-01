/**
 * Believers Junior Astronaut Space Academy
 * Mission 2: Solar System Planetary Scanner & Quiz
 */

class ScannerGame {
  constructor(containerId, onComplete) {
    this.container = document.getElementById(containerId);
    this.onComplete = onComplete;
    this.currentPlanetIndex = 0;
    this.scannedPlanets = new Set();
    this.quizScore = 0;
    this.inQuiz = false;

    this.planetsData = [
      {
        name: 'MERCURY',
        color: '#a0a0a0',
        dist: '57.9M km from Sun',
        temp: '-180°C to 430°C',
        moons: 0,
        gravity: '38% of Earth',
        badge: 'Swift Scout',
        fact: 'Mercury has no atmosphere to trap heat, so nights are freezing cold and days are scorching hot!',
        quiz: {
          q: 'Does Mercury have any moons orbiting it?',
          opts: ['No moons at all', 'Yes, 2 moons', 'Yes, 12 moons'],
          ans: 0,
          hint: 'Mercury is closest to the Sun, where gravity makes holding moons very tricky!',
        },
      },
      {
        name: 'VENUS',
        color: '#e3bb7b',
        dist: '108.2M km from Sun',
        temp: '465°C (Hottest!)',
        moons: 0,
        gravity: '90% of Earth',
        badge: 'Volcanic Voyager',
        fact: 'Venus is the hottest planet because of thick greenhouse gas clouds of carbon dioxide and sulfuric acid!',
        quiz: {
          q: 'Why is Venus hotter than Mercury even though Mercury is closer to the Sun?',
          opts: ['It is made of fire', 'Thick greenhouse clouds trap heat', 'It spins faster'],
          ans: 1,
          hint: 'Think about a thick blanket trapping all the thermal energy inside!',
        },
      },
      {
        name: 'EARTH',
        color: '#2b82c9',
        dist: '149.6M km from Sun',
        temp: '15°C Average',
        moons: 1,
        gravity: '9.8 m/s² (1G)',
        badge: 'Earth Guardian',
        fact: 'Earth is in the "Goldilocks Zone" where liquid water can exist, making life and future astronauts possible!',
        quiz: {
          q: 'What is Earth’s natural satellite called?',
          opts: ['Phobos', 'The Moon', 'Titan'],
          ans: 1,
          hint: 'You see it glowing in the night sky every evening!',
        },
      },
      {
        name: 'MARS',
        color: '#e05338',
        dist: '227.9M km from Sun',
        temp: '-60°C Average',
        moons: 2,
        gravity: '38% of Earth',
        badge: 'Red Planet Pioneer',
        fact: 'Mars has giant red dust storms that can cover the whole planet for weeks. It also has the tallest volcano: Olympus Mons!',
        quiz: {
          q: 'What gives Mars its famous red color?',
          opts: ['Red lava oceans', 'Iron oxide (rust) in the soil', 'Red alien plants'],
          ans: 1,
          hint: 'It is the same element found in rusty old nails!',
        },
      },
      {
        name: 'JUPITER',
        color: '#d29661',
        dist: '778.5M km from Sun',
        temp: '-110°C',
        moons: 95,
        gravity: '240% of Earth',
        badge: 'Gas Giant Navigator',
        fact: 'Jupiter’s famous Great Red Spot is a gigantic hurricane storm that has been raging for over 300 years!',
        quiz: {
          q: 'How many Earths could fit inside the giant planet Jupiter?',
          opts: ['About 10', 'About 100', 'More than 1,300'],
          ans: 2,
          hint: 'Jupiter is the largest planet in our entire solar system by far!',
        },
      },
      {
        name: 'SATURN',
        color: '#e5ca8b',
        dist: '1.43B km from Sun',
        temp: '-140°C',
        moons: 146,
        gravity: '106% of Earth',
        badge: 'Lord of the Rings',
        fact: 'Saturn is the only planet in our solar system with an average density less than water—if you had a big enough bathtub, Saturn would float!',
        quiz: {
          q: 'What are Saturn’s majestic rings mainly made of?',
          opts: ['Glittering chunks of ice and rock', 'Solid steel sheets', 'Alien space stations'],
          ans: 0,
          hint: 'Comets and icy asteroids shattered over millions of years!',
        },
      },
    ];

    this.init();
  }

  init() {
    this.render();
  }

  render() {
    const p = this.planetsData[this.currentPlanetIndex];
    const isScanned = this.scannedPlanets.has(p.name);

    this.container.innerHTML = `
      <div class="mission-hud">
        <div class="hud-item"><span class="hud-label">PLANETARY SCANNER</span><span class="hud-val highlight">${p.name}</span></div>
        <div class="hud-item"><span class="hud-label">PROGRESS</span><span class="hud-val">${this.scannedPlanets.size} / ${this.planetsData.length} SCANNED</span></div>
        <div class="hud-item"><span class="hud-label">MISSION STATUS</span><span class="hud-val ${this.scannedPlanets.size >= 4 ? 'highlight' : ''}">${this.scannedPlanets.size >= 4 ? 'QUALIFIED FOR BADGE!' : 'SCAN AT LEAST 4 PLANETS'}</span></div>
        <button id="scanner-exit-btn" class="hud-btn-exit" title="Exit to Academy">✕ EXIT</button>
      </div>

      <div class="scanner-body">
        <!-- Planet Visualizer Card -->
        <div class="planet-display-panel">
          <div class="planet-halo" style="box-shadow: 0 0 50px ${p.color}88">
            <div class="planet-orb" style="background: radial-gradient(circle at 35% 35%, #fff 0%, ${p.color} 50%, #111 95%)">
              ${p.name === 'SATURN' ? '<div class="saturn-ring-css"></div>' : ''}
            </div>
          </div>
          <h2 class="planet-title">${p.name}</h2>
          <div class="planet-controls-nav">
            <button id="prev-planet" class="cyber-btn" ${this.currentPlanetIndex === 0 ? 'disabled' : ''}>◄ PREVIOUS</button>
            <button id="scan-planet-btn" class="cyber-btn primary pulse">${isScanned ? '✔ RE-SCAN TELEMETRY' : '📡 SCAN PLANET'}</button>
            <button id="next-planet" class="cyber-btn" ${this.currentPlanetIndex === this.planetsData.length - 1 ? 'disabled' : ''}>NEXT ►</button>
          </div>
        </div>

        <!-- Planet Telemetry & Quiz Card -->
        <div class="planet-data-panel">
          <div class="cyber-card ${isScanned ? '' : 'locked'}">
            <div class="card-header">
              <h3>TELEMETRY SENSOR DATA</h3>
              <span class="card-badge">${isScanned ? 'DATA DECRYPTED' : 'ENCRYPTED - INITIATE SCAN'}</span>
            </div>

            <div class="telemetry-grid">
              <div class="t-cell"><span class="t-label">Distance from Sun:</span><span class="t-val">${isScanned ? p.dist : '???'}</span></div>
              <div class="t-cell"><span class="t-label">Surface Temperature:</span><span class="t-val">${isScanned ? p.temp : '???'}</span></div>
              <div class="t-cell"><span class="t-label">Known Moons:</span><span class="t-val">${isScanned ? p.moons : '???'}</span></div>
              <div class="t-cell"><span class="t-label">Surface Gravity:</span><span class="t-val">${isScanned ? p.gravity : '???'}</span></div>
            </div>

            <div class="fact-box">
              <h4>🚀 ASTRONAUT FLIGHT LOG</h4>
              <p>${isScanned ? p.fact : 'Target your telescope scanner at this world to unlock NASA orbital flight telemetry and mission quiz!'}</p>
            </div>

            ${isScanned ? `
              <div class="quiz-box">
                <h4>🎯 CADET KNOWLEDGE CHECK</h4>
                <p class="quiz-q">${p.quiz.q}</p>
                <div class="quiz-options">
                  ${p.quiz.opts.map((opt, idx) => `
                    <button class="quiz-opt-btn" data-opt="${idx}">${opt}</button>
                  `).join('')}
                </div>
                <div id="quiz-feedback" class="quiz-feedback hidden"></div>
              </div>
            ` : ''}

            ${this.scannedPlanets.size >= 4 ? `
              <div class="mission-complete-bar">
                <span>🌟 Junior Astronaut Scholar Requirements Met!</span>
                <button id="claim-scholar-btn" class="cyber-btn primary">CLAIM SCHOLAR BADGE & +300 XP</button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    document.getElementById('scanner-exit-btn')?.addEventListener('click', () => this.destroy());

    document.getElementById('prev-planet')?.addEventListener('click', () => {
      if (this.currentPlanetIndex > 0) {
        this.currentPlanetIndex--;
        if (window.cosmicAudio) window.cosmicAudio.playMinecraftClick();
        this.render();
      }
    });

    document.getElementById('next-planet')?.addEventListener('click', () => {
      if (this.currentPlanetIndex < this.planetsData.length - 1) {
        this.currentPlanetIndex++;
        if (window.cosmicAudio) window.cosmicAudio.playMinecraftClick();
        this.render();
      }
    });

    document.getElementById('scan-planet-btn')?.addEventListener('click', () => {
      const p = this.planetsData[this.currentPlanetIndex];
      if (window.cosmicAudio) window.cosmicAudio.playPlanetScan();
      this.scannedPlanets.add(p.name);
      this.render();
    });

    // Quiz options
    const p = this.planetsData[this.currentPlanetIndex];
    document.querySelectorAll('.quiz-opt-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selected = parseInt(e.target.dataset.opt);
        const fb = document.getElementById('quiz-feedback');
        fb.classList.remove('hidden');

        if (selected === p.quiz.ans) {
          fb.innerHTML = '<span class="correct">✔ CORRECT! Outstanding scientific reasoning, Cadet!</span>';
          if (window.cosmicAudio) window.cosmicAudio.playSuccess();
          e.target.classList.add('correct-btn');
        } else {
          fb.innerHTML = `<span class="incorrect">✕ Not quite. Astronaut hint: ${p.quiz.hint}</span>`;
          if (window.cosmicAudio) window.cosmicAudio.playMinecraftClick();
          e.target.classList.add('wrong-btn');
        }
      });
    });

    document.getElementById('claim-scholar-btn')?.addEventListener('click', () => {
      if (window.cosmicAudio) window.cosmicAudio.playSuccess();
      this.destroy();
      if (this.onComplete) this.onComplete({ xp: 300, badge: 'cosmic_scholar' });
    });
  }

  destroy() {
    this.container.innerHTML = '';
    const event = new CustomEvent('cadet:exitMission');
    window.dispatchEvent(event);
  }
}

window.ScannerGame = ScannerGame;
