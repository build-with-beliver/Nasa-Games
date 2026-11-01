/**
 * Believers Junior Astronaut Space Academy - Live 3D Space Background Engine
 * Built with Three.js (Procedural planet textures, twinkling stars, comets, interactive orbit)
 */

class LiveSpaceEngine {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.planets = [];
    this.starField = null;
    this.comets = [];
    this.animationFrameId = null;

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.cameraTarget = new THREE.Vector3(0, 0, 0);
    this.focusedPlanet = null;
    this.isPaused = false;
    this.quality = 'high'; // 'high', 'medium', 'low'

    this.init();
  }

  init() {
    if (!this.container) return;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x02030d, 0.0008);

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 3000);
    this.camera.position.set(0, 35, 140);
    this.camera.lookAt(0, 0, 0);

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 3. Lighting
    this.setupLighting();

    // 4. Background Starfields & Nebula
    this.createStarfields();

    // 5. Celestial Bodies (Sun, Earth, Moon, Mars, Jupiter, Saturn)
    this.createCelestialBodies();

    // 6. Comet / Shooting Star Spawner
    this.initComets();

    // 7. Event Listeners
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: true });
    this.renderer.domElement.addEventListener('click', (e) => this.onCanvasClick(e));

    // 8. Start Animation Loop
    this.animate();
  }

  setupLighting() {
    // Ambient celestial light
    const ambientLight = new THREE.AmbientLight(0x22263a, 0.6);
    this.scene.add(ambientLight);

    // Sun light source (PointLight from Sun coordinates)
    const sunLight = new THREE.PointLight(0xfff4d6, 2.8, 800, 0.7);
    sunLight.position.set(-80, 20, -40);
    this.scene.add(sunLight);

    // Directional rim light for atmospheric edge glow
    const rimLight = new THREE.DirectionalLight(0x4d79ff, 0.8);
    rimLight.position.set(50, 40, 70);
    this.scene.add(rimLight);
  }

  // --- Procedural Canvas Textures for crisp instantaneous loading ---
  createNoiseCanvas(width, height, generatorFn) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    generatorFn(ctx, width, height);
    return new THREE.CanvasTexture(canvas);
  }

  createSunTexture() {
    return this.createNoiseCanvas(512, 256, (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#ff9900');
      grad.addColorStop(0.3, '#ffcc00');
      grad.addColorStop(0.7, '#ff5500');
      grad.addColorStop(1, '#ffdd33');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Solar flare spots
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 25 + 5;
        const radGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
        radGrad.addColorStop(0, 'rgba(255, 255, 220, 0.8)');
        radGrad.addColorStop(0.5, 'rgba(255, 120, 0, 0.4)');
        radGrad.addColorStop(1, 'rgba(255, 60, 0, 0)');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  createEarthTexture() {
    return this.createNoiseCanvas(1024, 512, (ctx, w, h) => {
      // Deep Blue Ocean
      ctx.fillStyle = '#0a235c';
      ctx.fillRect(0, 0, w, h);

      // Continent landmass blobs
      ctx.fillStyle = '#1c5e2a';
      for (let i = 0; i < 50; i++) {
        const cx = Math.random() * w;
        const cy = 60 + Math.random() * (h - 120);
        const cr = 30 + Math.random() * 70;
        ctx.beginPath();
        ctx.ellipse(cx, cy, cr * 1.5, cr, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }

      // Desert sand highlights
      ctx.fillStyle = '#8f7b3b';
      for (let i = 0; i < 25; i++) {
        const cx = Math.random() * w;
        const cy = 100 + Math.random() * (h - 200);
        ctx.beginPath();
        ctx.arc(cx, cy, 18 + Math.random() * 25, 0, Math.PI * 2);
        ctx.fill();
      }

      // Polar ice caps
      ctx.fillStyle = '#e8f4f8';
      ctx.fillRect(0, 0, w, 35);
      ctx.fillRect(0, h - 35, w, 35);
    });
  }

  createEarthCloudsTexture() {
    return this.createNoiseCanvas(1024, 512, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      for (let i = 0; i < 70; i++) {
        const cx = Math.random() * w;
        const cy = Math.random() * h;
        const rw = 40 + Math.random() * 110;
        const rh = 15 + Math.random() * 35;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rw, rh, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  createMarsTexture() {
    return this.createNoiseCanvas(512, 256, (ctx, w, h) => {
      // Rusty Red Soil
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#c1440e');
      grad.addColorStop(0.5, '#e77d32');
      grad.addColorStop(1, '#8f2e06');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Dark basalt plains & craters
      ctx.fillStyle = 'rgba(60, 20, 10, 0.4)';
      for (let i = 0; i < 40; i++) {
        const cx = Math.random() * w;
        const cy = Math.random() * h;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.random() * 30 + 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Small polar cap
      ctx.fillStyle = '#f0f0ff';
      ctx.fillRect(0, 0, w, 15);
      ctx.fillRect(0, h - 15, w, 15);
    });
  }

  createJupiterTexture() {
    return this.createNoiseCanvas(1024, 512, (ctx, w, h) => {
      // Swirling atmospheric stripes
      const colors = ['#d8caaf', '#a56c42', '#cf9b6b', '#804c2b', '#edd8b7', '#bf8255'];
      const sliceHeight = h / 24;
      for (let i = 0; i < 24; i++) {
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(0, i * sliceHeight, w, sliceHeight);
      }

      // Atmospheric waves
      ctx.fillStyle = 'rgba(165, 108, 66, 0.4)';
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.arc(x, h * 0.45 + Math.sin(x * 0.05) * 8, 25, 0, Math.PI * 2);
        ctx.fill();
      }

      // The Great Red Spot!
      const grsX = w * 0.65;
      const grsY = h * 0.62;
      const redSpotGrad = ctx.createRadialGradient(grsX, grsY, 5, grsX, grsY, 50);
      redSpotGrad.addColorStop(0, '#a73822');
      redSpotGrad.addColorStop(0.6, '#cb4e2d');
      redSpotGrad.addColorStop(1, 'rgba(203, 78, 45, 0)');
      ctx.fillStyle = redSpotGrad;
      ctx.beginPath();
      ctx.ellipse(grsX, grsY, 55, 30, 0.1, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  createSaturnTexture() {
    return this.createNoiseCanvas(512, 256, (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#e2bf7d');
      grad.addColorStop(0.3, '#cbb387');
      grad.addColorStop(0.7, '#e4ce9f');
      grad.addColorStop(1, '#b59b6b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    });
  }

  createSaturnRingsTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0.0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.2, 'rgba(190, 160, 120, 0.7)');
    grad.addColorStop(0.45, 'rgba(160, 130, 90, 0.85)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0)'); // Cassini division gap!
    grad.addColorStop(0.55, 'rgba(210, 180, 140, 0.9)');
    grad.addColorStop(0.85, 'rgba(180, 150, 110, 0.6)');
    grad.addColorStop(1.0, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 32);
    return new THREE.CanvasTexture(canvas);
  }

  // --- Celestial Bodies Creation ---
  createCelestialBodies() {
    // 1. The Sun
    const sunGeom = new THREE.SphereGeometry(18, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({
      map: this.createSunTexture(),
    });
    const sun = new THREE.Mesh(sunGeom, sunMat);
    sun.position.set(-90, 20, -50);
    this.scene.add(sun);

    // Sun Corona Glow
    const coronaGeom = new THREE.SphereGeometry(22, 24, 24);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xffaa22,
      transparent: true,
      opacity: 0.28,
      side: THREE.BackSide,
    });
    const corona = new THREE.Mesh(coronaGeom, coronaMat);
    sun.add(corona);

    this.planets.push({
      name: 'Sun',
      mesh: sun,
      rotationSpeed: 0.002,
      orbitRadius: 0,
      orbitSpeed: 0,
      orbitAngle: 0,
      info: {
        title: 'The Sun (Star)',
        diameter: '1,392,700 km',
        temp: '5,500°C (Surface)',
        fact: 'The center of our solar system! Contains 99.8% of all mass.',
      },
    });

    // 2. Earth & Moon Group
    const earthGroup = new THREE.Group();
    earthGroup.position.set(-20, 4, 30);
    this.scene.add(earthGroup);

    const earthGeom = new THREE.SphereGeometry(7, 32, 32);
    const earthMat = new THREE.MeshStandardMaterial({
      map: this.createEarthTexture(),
      roughness: 0.65,
      metalness: 0.1,
    });
    const earth = new THREE.Mesh(earthGeom, earthMat);
    earthGroup.add(earth);

    // Earth Clouds Layer
    const cloudsGeom = new THREE.SphereGeometry(7.18, 32, 32);
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: this.createEarthCloudsTexture(),
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const clouds = new THREE.Mesh(cloudsGeom, cloudsMat);
    earth.add(clouds);

    // Moon
    const moonGeom = new THREE.SphereGeometry(1.8, 24, 24);
    const moonMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.9 });
    const moon = new THREE.Mesh(moonGeom, moonMat);
    moon.position.set(15, 2, 0);
    earthGroup.add(moon);

    this.planets.push({
      name: 'Earth',
      mesh: earthGroup,
      planetBody: earth,
      cloudsBody: clouds,
      moonBody: moon,
      rotationSpeed: 0.005,
      orbitRadius: 45,
      orbitCenter: new THREE.Vector3(-90, 20, -50),
      orbitSpeed: 0.0006,
      orbitAngle: 0.8,
      info: {
        title: 'Earth (Our Home)',
        diameter: '12,742 km',
        temp: '15°C (Average)',
        fact: 'Only known planet with liquid oceans and astronaut training camps!',
      },
    });

    // 3. Mars
    const marsGeom = new THREE.SphereGeometry(4.2, 32, 32);
    const marsMat = new THREE.MeshStandardMaterial({
      map: this.createMarsTexture(),
      roughness: 0.8,
    });
    const mars = new THREE.Mesh(marsGeom, marsMat);
    mars.position.set(38, -5, 10);
    this.scene.add(mars);

    this.planets.push({
      name: 'Mars',
      mesh: mars,
      rotationSpeed: 0.004,
      orbitRadius: 75,
      orbitCenter: new THREE.Vector3(-90, 20, -50),
      orbitSpeed: 0.00045,
      orbitAngle: 2.1,
      info: {
        title: 'Mars (The Red Planet)',
        diameter: '6,779 km',
        temp: '-60°C (Chilly!)',
        fact: 'Home to Olympus Mons, the largest volcano in the entire solar system!',
      },
    });

    // 4. Jupiter
    const jupiterGeom = new THREE.SphereGeometry(12, 32, 32);
    const jupiterMat = new THREE.MeshStandardMaterial({
      map: this.createJupiterTexture(),
      roughness: 0.7,
    });
    const jupiter = new THREE.Mesh(jupiterGeom, jupiterMat);
    jupiter.position.set(95, 15, -45);
    this.scene.add(jupiter);

    this.planets.push({
      name: 'Jupiter',
      mesh: jupiter,
      rotationSpeed: 0.008,
      orbitRadius: 130,
      orbitCenter: new THREE.Vector3(-90, 20, -50),
      orbitSpeed: 0.00025,
      orbitAngle: 3.5,
      info: {
        title: 'Jupiter (Giant Planet)',
        diameter: '139,820 km',
        temp: '-110°C (Gas giant)',
        fact: 'Over 1,300 Earths could fit inside Jupiter! The Red Spot is a giant storm.',
      },
    });

    // 5. Saturn with Rings
    const saturnGroup = new THREE.Group();
    saturnGroup.position.set(-45, -20, -80);
    this.scene.add(saturnGroup);

    const saturnGeom = new THREE.SphereGeometry(9, 32, 32);
    const saturnMat = new THREE.MeshStandardMaterial({
      map: this.createSaturnTexture(),
      roughness: 0.75,
    });
    const saturn = new THREE.Mesh(saturnGeom, saturnMat);
    saturnGroup.add(saturn);

    // Rings (tilted disk)
    const ringGeom = new THREE.RingGeometry(12, 23, 64);
    // Rotate ring to lie flat in XZ plane
    ringGeom.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshStandardMaterial({
      map: this.createSaturnRingsTexture(),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      roughness: 0.8,
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = 0.45; // Characteristic tilt
    ringMesh.rotation.y = 0.2;
    saturnGroup.add(ringMesh);

    this.planets.push({
      name: 'Saturn',
      mesh: saturnGroup,
      planetBody: saturn,
      rotationSpeed: 0.006,
      orbitRadius: 180,
      orbitCenter: new THREE.Vector3(-90, 20, -50),
      orbitSpeed: 0.00018,
      orbitAngle: 4.8,
      info: {
        title: 'Saturn (Ringed Wonder)',
        diameter: '116,460 km',
        temp: '-140°C',
        fact: 'Its spectacular rings are made of billions of pieces of glittering ice and rock!',
      },
    });
  }

  // --- Twinkling Multilayer Starfield & Cosmic Dust ---
  createStarfields() {
    const starCount = this.quality === 'low' ? 1200 : 3500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    const colorPalette = [
      new THREE.Color('#ffffff'), // pure white
      new THREE.Color('#94c2ff'), // blue giant
      new THREE.Color('#ffe599'), // warm yellow
      new THREE.Color('#ffb3ba'), // red star
      new THREE.Color('#88ffff'), // cyan
    ];

    for (let i = 0; i < starCount; i++) {
      // Spherical distribution around user
      const r = 250 + Math.random() * 900;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i] = Math.random() * 2.2 + 0.6;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom star sprite
    const starCanvas = document.createElement('canvas');
    starCanvas.width = 32;
    starCanvas.height = 32;
    const ctx = starCanvas.getContext('2d');
    const radGrad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    radGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    radGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.7)');
    radGrad.addColorStop(0.7, 'rgba(150, 200, 255, 0.2)');
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, 32, 32);

    const starTexture = new THREE.CanvasTexture(starCanvas);

    const material = new THREE.PointsMaterial({
      size: 2.8,
      vertexColors: true,
      map: starTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.starField = new THREE.Points(geometry, material);
    this.scene.add(this.starField);
  }

  // --- Periodic Shooting Stars (Comets) ---
  initComets() {
    this.cometGeom = new THREE.BufferGeometry();
    const trailLength = 16;
    const pos = new Float32Array(trailLength * 3);
    this.cometGeom.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const cometMat = new THREE.LineBasicMaterial({
      color: 0x99e6ff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      linewidth: 2,
    });

    this.activeComet = null;
    this.cometTimer = 0;
  }

  spawnComet() {
    const startX = (Math.random() - 0.5) * 300;
    const startY = 80 + Math.random() * 40;
    const startZ = -100 + Math.random() * 50;

    const dirX = 2.5 + Math.random() * 1.5;
    const dirY = -(1.5 + Math.random());
    const dirZ = 1.0;

    const trailPoints = [];
    for (let i = 0; i < 18; i++) {
      trailPoints.push(new THREE.Vector3(startX, startY, startZ));
    }

    const lineGeom = new THREE.BufferGeometry().setFromPoints(trailPoints);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x66ddff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    const mesh = new THREE.Line(lineGeom, lineMat);
    this.scene.add(mesh);

    this.activeComet = {
      mesh,
      pos: new THREE.Vector3(startX, startY, startZ),
      vel: new THREE.Vector3(dirX, dirY, dirZ),
      points: trailPoints,
      life: 0,
      maxLife: 70,
    };
  }

  // --- Mouse / Parallax Handling ---
  onMouseMove(e) {
    this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  onTouchMove(e) {
    if (e.touches.length > 0) {
      this.mouse.targetX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
      this.mouse.targetY = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
    }
  }

  onResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // Click on planet to inspect
  onCanvasClick(e) {
    const mouseCoord = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouseCoord, this.camera);

    const testMeshes = [];
    this.planets.forEach(p => {
      if (p.mesh) testMeshes.push(p.mesh);
      if (p.planetBody) testMeshes.push(p.planetBody);
    });

    const intersects = raycaster.intersectObjects(testMeshes, true);
    if (intersects.length > 0) {
      // Find matching planet
      const hitObj = intersects[0].object;
      const matched = this.planets.find(p => p.mesh === hitObj || p.planetBody === hitObj || hitObj.parent === p.mesh);
      if (matched) {
        this.focusPlanet(matched);
      }
    }
  }

  focusPlanet(planet) {
    this.focusedPlanet = planet;
    if (window.cosmicAudio) window.cosmicAudio.playPlanetScan();

    // Trigger UI event for planet inspection card
    const event = new CustomEvent('cadet:planetScanned', { detail: planet.info });
    window.dispatchEvent(event);
  }

  resetFocus() {
    this.focusedPlanet = null;
  }

  setQuality(q) {
    this.quality = q;
    // Adjust starfield or particle budget if needed
  }

  // --- Main Animation Loop ---
  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    if (this.isPaused) return;

    // Smooth mouse lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.04;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.04;

    // Starfield gentle rotation
    if (this.starField) {
      this.starField.rotation.y += 0.00015;
    }

    // Planets rotation & orbit
    this.planets.forEach(p => {
      // Axial rotation
      if (p.planetBody) {
        p.planetBody.rotation.y += p.rotationSpeed;
      } else if (p.mesh) {
        p.mesh.rotation.y += p.rotationSpeed;
      }

      // Earth clouds
      if (p.cloudsBody) {
        p.cloudsBody.rotation.y += p.rotationSpeed * 1.35;
      }

      // Moon orbit
      if (p.moonBody) {
        p.moonBody.position.x = Math.cos(Date.now() * 0.001) * 14;
        p.moonBody.position.z = Math.sin(Date.now() * 0.001) * 14;
      }

      // Orbit around center
      if (p.orbitRadius > 0 && p.orbitCenter) {
        p.orbitAngle += p.orbitSpeed;
        p.mesh.position.x = p.orbitCenter.x + Math.cos(p.orbitAngle) * p.orbitRadius;
        p.mesh.position.z = p.orbitCenter.z + Math.sin(p.orbitAngle) * p.orbitRadius;
      }
    });

    // Shooting Star / Comet Update
    this.cometTimer++;
    if (this.cometTimer > 320 && !this.activeComet) {
      this.spawnComet();
      this.cometTimer = 0;
    }

    if (this.activeComet) {
      const c = this.activeComet;
      c.life++;
      c.pos.add(c.vel);

      // Shift trail points
      for (let i = c.points.length - 1; i > 0; i--) {
        c.points[i].copy(c.points[i - 1]);
      }
      c.points[0].copy(c.pos);
      c.mesh.geometry.setFromPoints(c.points);
      c.mesh.material.opacity = Math.max(0, 1 - c.life / c.maxLife);

      if (c.life >= c.maxLife) {
        this.scene.remove(c.mesh);
        c.mesh.geometry.dispose();
        c.mesh.material.dispose();
        this.activeComet = null;
      }
    }

    // Camera Positioning
    if (this.focusedPlanet) {
      // Glide camera close to focused planet
      const targetPos = new THREE.Vector3();
      this.focusedPlanet.mesh.getWorldPosition(targetPos);
      
      const desiredCamPos = new THREE.Vector3()
        .copy(targetPos)
        .add(new THREE.Vector3(15, 8, 25));

      this.camera.position.lerp(desiredCamPos, 0.04);
      this.cameraTarget.lerp(targetPos, 0.06);
      this.camera.lookAt(this.cameraTarget);
    } else {
      // Default cinematic floating angle with mouse parallax
      const baseX = Math.sin(Date.now() * 0.00018) * 15;
      const targetCamX = baseX + this.mouse.x * 14;
      const targetCamY = 28 - this.mouse.y * 12;
      const targetCamZ = 135;

      this.camera.position.x += (targetCamX - this.camera.position.x) * 0.03;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 0.03;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.03;

      this.cameraTarget.set(0, 0, 0);
      this.camera.lookAt(this.cameraTarget);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Global hook
window.LiveSpaceEngine = LiveSpaceEngine;
