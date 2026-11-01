/**
 * Believers Junior Astronaut Space Academy - Main Application Controller
 */

class SpaceAcademyApp {
  constructor() {
    this.spaceEngine = null;
    this.currentView = 'login'; // 'login', 'logo-splash', 'main-menu', 'mission-select', 'gameplay', 'license'
    this.activeGame = null;

    // Cadet State
    this.cadet = {
      name: 'Cadet Orion',
      isGuest: true,
      phoneNumber: '',
      avatar: 'assets/mascot.jpg',
      xp: 150,
      level: 1,
      rank: 'Junior Space Cadet',
      badges: ['cadet_recruit'],
      stars: 3,
    };

    // Splash texts (like Minecraft's iconic yellow bouncing text)
    this.splashQuotes = [
      'To infinity and beyond!',
      'Space Cadets assemble!',
      'Houston, we have cookies!',
      'Zero gravity, 100% fun!',
      'Minecraft meets NASA!',
      '10, 9, 8... Blast off!',
      'Powered by Believers!',
      'Watch out for asteroids!',
      'Oxygen levels: 100% awesome!',
      'Dream big, fly higher!',
      'Don’t forget your space suit!',
    ];

    this.init();
  }

  init() {
    // 1. Initialize Live 3D Space Background
    if (window.LiveSpaceEngine) {
      this.spaceEngine = new window.LiveSpaceEngine('space-canvas-container');
    }

    // 2. Load saved cadet profile if any
    this.loadProfile();

    // 3. Bind UI event listeners
    this.bindUI();

    // 4. Random splash text
    this.updateSplashText();

    // 5. Global custom event listeners
    window.addEventListener('cadet:exitMission', () => {
      this.switchView('mission-select');
      this.updateProfileDisplay();
    });

    window.addEventListener('cadet:planetScanned', (e) => {
      this.showPlanetFactCard(e.detail);
    });
  }

  loadProfile() {
    try {
      const saved = localStorage.getItem('believers_cadet_profile');
      if (saved) {
        this.cadet = Object.assign(this.cadet, JSON.parse(saved));
      }
    } catch (e) {}
    this.calculateRank();
  }

  saveProfile() {
    try {
      localStorage.setItem('believers_cadet_profile', JSON.stringify(this.cadet));
    } catch (e) {}
  }

  calculateRank() {
    const xp = this.cadet.xp;
    if (xp >= 1200) {
      this.cadet.rank = 'Master Space Explorer 🌟🌟🌟';
      this.cadet.level = 5;
    } else if (xp >= 800) {
      this.cadet.rank = 'Orbital Flight Commander 🌟🌟';
      this.cadet.level = 4;
    } else if (xp >= 500) {
      this.cadet.rank = 'Senior Space Specialist 🌟';
      this.cadet.level = 3;
    } else if (xp >= 250) {
      this.cadet.rank = 'Junior Space Specialist';
      this.cadet.level = 2;
    } else {
      this.cadet.rank = 'Junior Space Cadet';
      this.cadet.level = 1;
    }
  }

  awardRewards(xpEarned, badgeKey) {
    this.cadet.xp += xpEarned;
    if (badgeKey && !this.cadet.badges.includes(badgeKey)) {
      this.cadet.badges.push(badgeKey);
    }
    this.calculateRank();
    this.saveProfile();
    this.updateProfileDisplay();
  }

  updateProfileDisplay() {
    const nameEl = document.getElementById('hud-cadet-name');
    const rankEl = document.getElementById('hud-cadet-rank');
    const xpEl = document.getElementById('hud-cadet-xp');
    const avatarEl = document.getElementById('hud-cadet-avatar');

    if (nameEl) nameEl.innerText = this.cadet.name;
    if (rankEl) rankEl.innerText = this.cadet.rank;
    if (xpEl) xpEl.innerText = `${this.cadet.xp} XP`;
    if (avatarEl) avatarEl.src = this.cadet.avatar;

    // Update Badges List
    this.updateBadgesUI();
  }

  updateBadgesUI() {
    const badges = {
      cadet_recruit: { name: 'Cadet Recruit', icon: '🚀', desc: 'Enlisted in the Believers Academy' },
      docking_master: { name: 'Docking Master', icon: '🏅', desc: 'Perfected orbital space docking' },
      cosmic_scholar: { name: 'Cosmic Scholar', icon: '🪐', desc: 'Decrypted solar system telemetry' },
      eva_spacewalker: { name: 'EVA Spacewalker', icon: '👨‍🚀', desc: 'Completed spacewalk repair mission' },
      planetary_guardian: { name: 'Planetary Guardian', icon: '🛡️', desc: 'Defended lunar dome from meteors' },
    };

    const container = document.getElementById('badges-inventory');
    if (!container) return;

    container.innerHTML = Object.entries(badges).map(([key, data]) => {
      const unlocked = this.cadet.badges.includes(key);
      return `
        <div class="badge-card ${unlocked ? 'unlocked' : 'locked'}">
          <div class="badge-icon">${data.icon}</div>
          <div class="badge-title">${data.name}</div>
          <div class="badge-desc">${unlocked ? data.desc : 'Mission locked'}</div>
        </div>
      `;
    }).join('');
  }

  updateSplashText() {
    const splash = document.getElementById('minecraft-splash-text');
    if (splash) {
      const randomQuote = this.splashQuotes[Math.floor(Math.random() * this.splashQuotes.length)];
      splash.innerText = randomQuote;
    }
  }

  switchView(viewName) {
    this.currentView = viewName;

    // Hide all view panels
    document.querySelectorAll('.view-screen').forEach(el => el.classList.remove('active'));

    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.add('active');
    }

    // Top HUD visibility: only on main menu, mission-select, license
    const topHud = document.getElementById('top-astronaut-hud');
    if (topHud) {
      if (viewName === 'main-menu' || viewName === 'mission-select' || viewName === 'license') {
        topHud.classList.remove('hidden');
      } else {
        topHud.classList.add('hidden');
      }
    }

    // Settings icon visibility: specifically requested at top right corner
    const settingsBtn = document.getElementById('global-settings-btn');
    if (settingsBtn) {
      if (viewName !== 'login') {
        settingsBtn.classList.remove('hidden');
      } else {
        settingsBtn.classList.add('hidden');
      }
    }
  }

  // --- UI Bindings ---
  bindUI() {
    // 1. Audio hover on buttons
    document.querySelectorAll('button, .interactive').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        if (window.cosmicAudio) window.cosmicAudio.playHover();
      });
    });

    // 2. Login Flow: Number Login
    const phoneForm = document.getElementById('phone-login-form');
    phoneForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const phoneInput = document.getElementById('cadet-phone-input');
      const nameInput = document.getElementById('cadet-name-input');
      const num = phoneInput.value.trim();

      if (!num || num.length < 6) {
        alert('Please enter a valid astronaut phone number (at least 6 digits)!');
        return;
      }

      this.cadet.phoneNumber = num;
      this.cadet.isGuest = false;
      if (nameInput.value.trim()) {
        this.cadet.name = nameInput.value.trim();
      } else {
        this.cadet.name = `Cadet #${num.slice(-4)}`;
      }

      this.saveProfile();
      this.onLoginSuccess();
    });

    // 2b. Login Flow: Play as Guest
    const guestBtn = document.getElementById('guest-login-btn');
    guestBtn?.addEventListener('click', () => {
      this.cadet.isGuest = true;
      this.cadet.name = 'Cadet Nova (Guest)';
      this.cadet.phoneNumber = '';
      this.saveProfile();
      this.onLoginSuccess();
    });

    // 3. Post-login "BELIEVERS" Logo Splash Screen
    const logoSplash = document.getElementById('view-logo-splash');
    const enterMenuBtn = document.getElementById('enter-academy-btn');
    const skipSplash = () => {
      if (window.cosmicAudio) {
        window.cosmicAudio.playMinecraftClick();
        window.cosmicAudio.startSpaceAmbient();
      }
      this.switchView('main-menu');
    };
    enterMenuBtn?.addEventListener('click', skipSplash);
    logoSplash?.addEventListener('click', (e) => {
      if (e.target === logoSplash || e.target.closest('.believers-reveal-card')) {
        skipSplash();
      }
    });

    // 4. Main Menu Buttons
    const playBtn = document.getElementById('main-play-btn');
    playBtn?.addEventListener('click', () => {
      if (window.cosmicAudio) window.cosmicAudio.playMinecraftClick();
      this.switchView('mission-select');
    });

    const cadetIdCardBtn = document.getElementById('view-id-card-btn');
    cadetIdCardBtn?.addEventListener('click', () => {
      if (window.cosmicAudio) window.cosmicAudio.playMinecraftClick();
      this.showCadetLicense();
    });

    const missionsBackBtn = document.getElementById('missions-back-btn');
    missionsBackBtn?.addEventListener('click', () => {
      if (window.cosmicAudio) window.cosmicAudio.playMinecraftClick();
      this.switchView('main-menu');
    });

    // 5. Settings Modal (Top Right Corner)
    const settingsBtn = document.getElementById('global-settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings-btn');

    settingsBtn?.addEventListener('click', () => {
      if (window.cosmicAudio) window.cosmicAudio.playMinecraftClick();
      settingsModal?.classList.remove('hidden');
    });

    closeSettingsBtn?.addEventListener('click', () => {
      if (window.cosmicAudio) window.cosmicAudio.playMinecraftClick();
      settingsModal?.classList.add('hidden');
    });

    // Settings Controls
    const sfxVol = document.getElementById('settings-sfx-vol');
    sfxVol?.addEventListener('input', (e) => {
      if (window.cosmicAudio) window.cosmicAudio.setSfxVolume(parseFloat(e.target.value));
    });

    const musicVol = document.getElementById('settings-music-vol');
    musicVol?.addEventListener('input', (e) => {
      if (window.cosmicAudio) window.cosmicAudio.setMusicVolume(parseFloat(e.target.value));
    });

    const muteToggle = document.getElementById('settings-mute-toggle');
    muteToggle?.addEventListener('change', (e) => {
      if (window.cosmicAudio) window.cosmicAudio.setMute(e.target.checked);
    });

    const nameSetting = document.getElementById('settings-cadet-name');
    nameSetting?.addEventListener('change', (e) => {
      if (e.target.value.trim()) {
        this.cadet.name = e.target.value.trim();
        this.saveProfile();
        this.updateProfileDisplay();
      }
    });

    const logoutBtn = document.getElementById('settings-logout-btn');
    logoutBtn?.addEventListener('click', () => {
      if (window.cosmicAudio) {
        window.cosmicAudio.playMinecraftClick();
        window.cosmicAudio.stopSpaceAmbient();
      }
      settingsModal?.classList.add('hidden');
      this.switchView('login');
    });

    // 6. Mission Launch Cards
    document.querySelectorAll('.mission-card').forEach(card => {
      card.addEventListener('click', () => {
        const missionType = card.dataset.mission;
        this.startMission(missionType);
      });
    });

    // 7. Planet scanned detail card close
    document.getElementById('planet-card-close')?.addEventListener('click', () => {
      document.getElementById('planet-detail-modal')?.classList.add('hidden');
      if (this.spaceEngine) this.spaceEngine.resetFocus();
    });

    // 8. License Certificate close / print
    document.getElementById('license-close-btn')?.addEventListener('click', () => {
      if (window.cosmicAudio) window.cosmicAudio.playMinecraftClick();
      this.switchView('main-menu');
    });

    document.getElementById('license-print-btn')?.addEventListener('click', () => {
      window.print();
    });
  }

  onLoginSuccess() {
    if (window.cosmicAudio) {
      window.cosmicAudio.playSuccess();
      window.cosmicAudio.playLogoCinematic();
    }

    this.updateProfileDisplay();
    this.updateSplashText();

    // Show the iconic Believers Minecraft-style logo screen
    this.switchView('logo-splash');

    // Automatic smooth transition after 3.8s if not clicked
    setTimeout(() => {
      if (this.currentView === 'logo-splash') {
        if (window.cosmicAudio) window.cosmicAudio.startSpaceAmbient();
        this.switchView('main-menu');
      }
    }, 4200);
  }

  startMission(missionType) {
    if (window.cosmicAudio) window.cosmicAudio.playMinecraftClick();
    this.switchView('gameplay');

    const gameContainerId = 'active-game-container';
    const container = document.getElementById(gameContainerId);
    container.innerHTML = '';

    const onFinish = (reward) => {
      this.awardRewards(reward.xp, reward.badge);
    };

    switch (missionType) {
      case 'lander':
        this.activeGame = new window.LanderGame(gameContainerId, onFinish);
        break;
      case 'scanner':
        this.activeGame = new window.ScannerGame(gameContainerId, onFinish);
        break;
      case 'spacewalk':
        this.activeGame = new window.SpacewalkGame(gameContainerId, onFinish);
        break;
      case 'defense':
        this.activeGame = new window.DefenseGame(gameContainerId, onFinish);
        break;
      default:
        console.warn('Unknown mission', missionType);
        this.switchView('mission-select');
    }
  }

  showPlanetFactCard(info) {
    const modal = document.getElementById('planet-detail-modal');
    if (!modal) return;

    document.getElementById('planet-modal-title').innerText = info.title;
    document.getElementById('planet-modal-dia').innerText = info.diameter;
    document.getElementById('planet-modal-temp').innerText = info.temp;
    document.getElementById('planet-modal-fact').innerText = info.fact;

    modal.classList.remove('hidden');
  }

  showCadetLicense() {
    this.switchView('license');

    const certName = document.getElementById('cert-cadet-name');
    const certRank = document.getElementById('cert-cadet-rank');
    const certXp = document.getElementById('cert-cadet-xp');
    const certDate = document.getElementById('cert-date');
    const certBadges = document.getElementById('cert-badges-count');

    if (certName) certName.innerText = this.cadet.name;
    if (certRank) certRank.innerText = this.cadet.rank;
    if (certXp) certXp.innerText = `${this.cadet.xp} XP`;
    if (certDate) certDate.innerText = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    if (certBadges) certBadges.innerText = `${this.cadet.badges.length} Badges`;
  }
}

// Bootstrap once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.spaceApp = new SpaceAcademyApp();
});
