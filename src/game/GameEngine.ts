import * as THREE from 'three';
import { SOLAR_PLANETS } from './planets';
import { PlanetConfig, GameState } from '../types/game';
import {
  AstronautActor,
  createRocketmanAstronaut,
  createCrystalMesh,
  createMineralMesh,
  createHighBarrierMesh,
  createLowBarrierMesh,
  createCrystalSpireMesh,
  createTrackChunk,
  createCelestialBackdrop,
} from './proceduralModels';
import { soundManager } from '../audio/SoundEffects';

export interface GameEngineCallbacks {
  onScoreUpdate: (score: number, distance: number, collectibles: number, speedMultiplier: number, speedKmh: number) => void;
  onPlanetChange: (planet: PlanetConfig, isWarp: boolean) => void;
  onGameOver: (finalStats: {
    score: number;
    distance: number;
    collectibles: number;
    planetReached: string;
    planetIndex: number;
    maxSpeedKmh: number;
  }) => void;
  onStateChange: (state: GameState) => void;
}

export class RocketmanGameEngine {
  private container: HTMLDivElement;
  private callbacks: GameEngineCallbacks;

  // Three.js Core
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private isSoftwareGl: boolean;
  private frameId: number = 0;
  private clock: THREE.Clock;

  // Environment
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private celestialGroup: THREE.Group | null = null;
  private starfield: THREE.Points;

  // Game Logic
  public state: GameState = 'START';
  public currentPlanetIndex: number = 0;
  public currentPlanet: PlanetConfig;
  public score: number = 0;
  public distanceMeters: number = 0;
  public collectiblesCount: number = 0;
  public baseSpeed: number = 24; // Units per second
  public speedMultiplier: number = 1.0;
  public maxSpeedKmh: number = 86;

  // Warp
  private isWarping: boolean = false;
  private warpTimer: number = 0;

  // Player Character
  private player: AstronautActor;
  private playerLane: number = 0; // -1: Left, 0: Center, 1: Right
  private targetPlayerX: number = 0;
  public playerY: number = 0;
  private playerVy: number = 0;
  public isJumping: boolean = false;
  public isSliding: boolean = false;
  private slideTimer: number = 0;

  // World Generation
  private trackChunks: { mesh: THREE.Group; z: number }[] = [];
  private readonly chunkLength = 50;
  private readonly chunkCount = 6;
  private nextObstacleZ: number = -60; // Initial safe runway

  // Active items
  private activeObstacles: {
    id: string;
    mesh: THREE.Group;
    lane: number;
    type: 'BARRIER_HIGH' | 'BARRIER_LOW' | 'SPIRE';
    z: number;
    passed: boolean;
  }[] = [];

  private activeCollectibles: {
    id: string;
    mesh: THREE.Group;
    lane: number;
    type: 'CRYSTAL' | 'MINERAL';
    z: number;
    points: number;
    collected: boolean;
  }[] = [];

  // Particles
  private particlePool: THREE.Points;
  private particlePositions: Float32Array;
  private particleVelocities: Float32Array;
  private particleLifespans: Float32Array;
  private particleCount = 180;

  // Gamepad
  private lastGamepadLeft = false;
  private lastGamepadRight = false;
  private lastGamepadJump = false;
  private lastGamepadSlide = false;

  constructor(container: HTMLDivElement, callbacks: GameEngineCallbacks, initialPlanetIndex = 0) {
    this.container = container;
    this.callbacks = callbacks;
    this.currentPlanetIndex = initialPlanetIndex;
    this.currentPlanet = SOLAR_PLANETS[this.currentPlanetIndex];

    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.currentPlanet.skyColor);
    this.scene.fog = new THREE.FogExp2(
      new THREE.Color(this.currentPlanet.fogColor),
      0.007
    );

    // Camera: behind and above player, looking down the track towards -Z
    this.camera = new THREE.PerspectiveCamera(
      62,
      container.clientWidth / container.clientHeight,
      0.1,
      600
    );
    this.camera.position.set(0, 3.4, 5.8);
    this.camera.lookAt(0, 1.4, -18);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    // Lighting
    this.hemiLight = new THREE.HemisphereLight(
      new THREE.Color(this.currentPlanet.skyColor),
      new THREE.Color(this.currentPlanet.groundColor),
      1.4
    );
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    this.dirLight.position.set(10, 25, 15);
    if (!this.isSoftwareGl) {
      this.dirLight.castShadow = true;
      this.dirLight.shadow.mapSize.width = 1024;
      this.dirLight.shadow.mapSize.height = 1024;
      this.dirLight.shadow.bias = -0.0005;
    }
    this.scene.add(this.dirLight);

    // Starfield
    this.starfield = this.createStarfield();
    this.scene.add(this.starfield);

    // Celestial backdrop
    this.updateCelestialBackdrop();

    // Astronaut Player (facing forward towards -Z)
    this.player = createRocketmanAstronaut();
    this.player.group.position.set(0, 0, 0);
    this.scene.add(this.player.group);

    // Sparkle Particle System
    const particleGeom = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(this.particleCount * 3);
    this.particleVelocities = new Float32Array(this.particleCount * 3);
    this.particleLifespans = new Float32Array(this.particleCount);
    particleGeom.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.28,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    this.particlePool = new THREE.Points(particleGeom, particleMat);
    this.scene.add(this.particlePool);

    this.initTrackChunks();

    window.addEventListener('resize', this.onWindowResize);
    this.tick();
  }

  private createStarfield(): THREE.Points {
    const starCount = 1000;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 350;
      positions[i * 3 + 1] = Math.random() * 180 - 10;
      positions[i * 3 + 2] = -Math.random() * 450;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      size: 1.6,
      color: 0xffffff,
      transparent: true,
      opacity: 0.75,
    });
    return new THREE.Points(geom, mat);
  }

  private updateCelestialBackdrop() {
    if (this.celestialGroup) {
      this.scene.remove(this.celestialGroup);
      this.celestialGroup = null;
    }
    this.celestialGroup = createCelestialBackdrop(this.currentPlanet);
    this.scene.add(this.celestialGroup);
  }

  private initTrackChunks() {
    for (const chunk of this.trackChunks) {
      this.scene.remove(chunk.mesh);
    }
    this.trackChunks = [];

    for (const obs of this.activeObstacles) {
      this.scene.remove(obs.mesh);
    }
    this.activeObstacles = [];

    for (const item of this.activeCollectibles) {
      this.scene.remove(item.mesh);
    }
    this.activeCollectibles = [];

    for (let i = 0; i < this.chunkCount; i++) {
      const z = -i * this.chunkLength;
      const mesh = createTrackChunk(this.currentPlanet, this.chunkLength);
      mesh.position.z = z;
      this.scene.add(mesh);
      this.trackChunks.push({ mesh, z });
    }

    this.nextObstacleZ = -55;
  }

  private onWindowResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  /**
   * Spawns hazards and collectibles carefully along the track
   * Guaranteed: Safe runway, clear lane to dodge, only 1 obstacle per row!
   */
  private spawnRow(spawnZ: number) {
    const lanes: (-1 | 0 | 1)[] = [-1, 0, 1];

    // Pick 1 lane for obstacle (never blocks all lanes)
    const obsLane = lanes[Math.floor(Math.random() * lanes.length)];
    const openLanes = lanes.filter((l) => l !== obsLane);

    // Obstacle types: High Barrier (Slide), Low Hurdle (Jump), Spire (Change Lane)
    const randType = Math.random();
    let type: 'BARRIER_HIGH' | 'BARRIER_LOW' | 'SPIRE';
    let mesh: THREE.Group;

    if (randType < 0.35) {
      type = 'BARRIER_HIGH'; // Player must SLIDE
      mesh = createHighBarrierMesh(this.currentPlanet.accentColor);
    } else if (randType < 0.7) {
      type = 'BARRIER_LOW'; // Player must JUMP
      mesh = createLowBarrierMesh(this.currentPlanet.accentColor);
    } else {
      type = 'SPIRE'; // Player must CHANGE LANE
      mesh = createCrystalSpireMesh(this.currentPlanet);
    }

    mesh.position.set(obsLane * 2.4, 0, spawnZ);
    this.scene.add(mesh);

    this.activeObstacles.push({
      id: `obs-${Date.now()}-${Math.random()}`,
      mesh,
      lane: obsLane,
      type,
      z: spawnZ,
      passed: false,
    });

    // Spawn 2-3 collectibles in one of the open lanes
    const itemLane = openLanes[Math.floor(Math.random() * openLanes.length)];
    const isCrystal = Math.random() > 0.4;
    for (let i = 0; i < 3; i++) {
      const itemZ = spawnZ + 6 - i * 4;
      const itemMesh = isCrystal
        ? createCrystalMesh(this.currentPlanet.crystalColor)
        : createMineralMesh(this.currentPlanet.accentColor);

      itemMesh.position.set(itemLane * 2.4, 0.75, itemZ);
      this.scene.add(itemMesh);

      this.activeCollectibles.push({
        id: `item-${Date.now()}-${Math.random()}`,
        mesh: itemMesh,
        lane: itemLane,
        type: isCrystal ? 'CRYSTAL' : 'MINERAL',
        z: itemZ,
        points: isCrystal ? 100 : 50,
        collected: false,
      });
    }
  }

  public triggerSparkle(x: number, y: number, z: number, count = 20, isImpact = false) {
    let spawned = 0;
    for (let i = 0; i < this.particleCount && spawned < count; i++) {
      if (this.particleLifespans[i] <= 0) {
        this.particlePositions[i * 3] = x;
        this.particlePositions[i * 3 + 1] = y;
        this.particlePositions[i * 3 + 2] = z;

        const spd = isImpact ? 7.0 : 3.5;
        this.particleVelocities[i * 3] = (Math.random() - 0.5) * spd;
        this.particleVelocities[i * 3 + 1] = (Math.random() * 0.8 + 0.2) * spd;
        this.particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * spd;

        this.particleLifespans[i] = isImpact ? 0.6 : 0.4;
        spawned++;
      }
    }
    this.particlePool.geometry.attributes.position.needsUpdate = true;
  }

  // --- CONTROLS ---

  public moveLeft() {
    if (this.state !== 'PLAYING') return;
    if (this.playerLane > -1) {
      this.playerLane = (this.playerLane - 1) as -1 | 0 | 1;
      this.targetPlayerX = this.playerLane * 2.4;
      soundManager.playLaneChange();
    }
  }

  public moveRight() {
    if (this.state !== 'PLAYING') return;
    if (this.playerLane < 1) {
      this.playerLane = (this.playerLane + 1) as -1 | 0 | 1;
      this.targetPlayerX = this.playerLane * 2.4;
      soundManager.playLaneChange();
    }
  }

  public jump() {
    if (this.state !== 'PLAYING') return;
    if (!this.isJumping) {
      this.isJumping = true;
      this.playerVy = 16.5; // High, snappy jetpack boost!
      this.isSliding = false;
      this.slideTimer = 0;
      soundManager.playJump();
      this.triggerSparkle(this.player.group.position.x, 0.4, 0, 15);
    }
  }

  public slide() {
    if (this.state !== 'PLAYING') return;
    if (this.isJumping) {
      // Fast dive down to track
      this.playerVy = -22.0;
    }
    this.isSliding = true;
    this.slideTimer = 0.85; // 0.85s slide duration
    soundManager.playSlide();
    this.triggerSparkle(this.player.group.position.x, 0.2, 0, 12);
  }

  public start(planetIndex = 0) {
    this.currentPlanetIndex = planetIndex;
    this.currentPlanet = SOLAR_PLANETS[this.currentPlanetIndex];
    this.score = 0;
    this.distanceMeters = 0;
    this.collectiblesCount = 0;
    this.speedMultiplier = 1.0;
    this.maxSpeedKmh = 86;
    this.playerLane = 0;
    this.targetPlayerX = 0;
    this.player.group.position.set(0, 0, 0);
    this.playerY = 0;
    this.playerVy = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.isWarping = false;

    this.applyPlanetVisuals(this.currentPlanet);
    this.initTrackChunks();

    this.state = 'PLAYING';
    this.callbacks.onStateChange(this.state);
    soundManager.startMusic();
  }

  public pause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.callbacks.onStateChange(this.state);
      soundManager.pauseMusic();
    }
  }

  public resume() {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.callbacks.onStateChange(this.state);
      soundManager.resumeMusic();
    }
  }

  public setPlanet(index: number) {
    if (index >= 0 && index < SOLAR_PLANETS.length) {
      this.currentPlanetIndex = index;
      this.currentPlanet = SOLAR_PLANETS[index];
      this.applyPlanetVisuals(this.currentPlanet);
      this.callbacks.onPlanetChange(this.currentPlanet, false);
    }
  }

  private applyPlanetVisuals(planet: PlanetConfig) {
    this.scene.background = new THREE.Color(planet.skyColor);
    if (this.scene.fog) {
      this.scene.fog.color = new THREE.Color(planet.fogColor);
    }
    this.hemiLight.color = new THREE.Color(planet.skyColor);
    this.hemiLight.groundColor = new THREE.Color(planet.groundColor);
    this.updateCelestialBackdrop();
  }

  private triggerWarpToNextPlanet() {
    if (this.isWarping) return;
    this.isWarping = true;
    this.warpTimer = 2.2;

    const nextIndex = (this.currentPlanetIndex + 1) % SOLAR_PLANETS.length;
    this.currentPlanetIndex = nextIndex;
    this.currentPlanet = SOLAR_PLANETS[nextIndex];

    soundManager.playWarp();
    this.callbacks.onPlanetChange(this.currentPlanet, true);

    setTimeout(() => {
      this.applyPlanetVisuals(this.currentPlanet);
    }, 1000);
  }

  private pollGamepad() {
    if (typeof navigator.getGamepads !== 'function') return;
    const gamepads = navigator.getGamepads();
    if (!gamepads) return;

    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (!gp) continue;

      const leftPressed = gp.buttons[14]?.pressed || gp.axes[0] < -0.4;
      const rightPressed = gp.buttons[15]?.pressed || gp.axes[0] > 0.4;
      const jumpPressed = gp.buttons[0]?.pressed || gp.buttons[12]?.pressed || gp.axes[1] < -0.4;
      const slidePressed = gp.buttons[1]?.pressed || gp.buttons[13]?.pressed || gp.axes[1] > 0.4;

      if (leftPressed && !this.lastGamepadLeft) this.moveLeft();
      if (rightPressed && !this.lastGamepadRight) this.moveRight();
      if (jumpPressed && !this.lastGamepadJump) this.jump();
      if (slidePressed && !this.lastGamepadSlide) this.slide();

      this.lastGamepadLeft = leftPressed;
      this.lastGamepadRight = rightPressed;
      this.lastGamepadJump = jumpPressed;
      this.lastGamepadSlide = slidePressed;
      break;
    }
  }

  private tick = () => {
    const delta = Math.min(this.clock.getDelta(), 0.05);
    const time = this.clock.getElapsedTime();

    this.pollGamepad();

    if (this.state === 'PLAYING') {
      if (this.isWarping) {
        this.warpTimer -= delta;
        if (this.warpTimer <= 0) this.isWarping = false;
      }

      // Speed calculation: +0.1% per collectible item
      this.speedMultiplier = 1.0 + this.collectiblesCount * 0.001;
      const currentSpeed = this.baseSpeed * this.speedMultiplier;
      const kmh = currentSpeed * 3.6;
      if (kmh > this.maxSpeedKmh) this.maxSpeedKmh = kmh;

      const distanceDelta = currentSpeed * delta;
      this.distanceMeters += distanceDelta;
      this.score += Math.floor(distanceDelta * 2.5 * this.speedMultiplier);

      // Player horizontal lane interpolation (snappy & smooth)
      this.player.group.position.x = THREE.MathUtils.damp(
        this.player.group.position.x,
        this.targetPlayerX,
        18,
        delta
      );

      // Banking lean
      const laneDiff = this.targetPlayerX - this.player.group.position.x;
      this.player.group.rotation.z = -laneDiff * 0.18;
      this.player.group.rotation.y = laneDiff * 0.12;

      // Jump & Slide Physics
      const gravity = 36;
      if (this.isJumping) {
        this.playerY += this.playerVy * delta;
        this.playerVy -= gravity * delta;
        if (this.playerY <= 0) {
          this.playerY = 0;
          this.playerVy = 0;
          this.isJumping = false;
        }
      }

      if (this.isSliding) {
        this.slideTimer -= delta;
        if (this.slideTimer <= 0) {
          this.isSliding = false;
        }
      }

      this.player.group.position.y = this.playerY;
      this.player.updateAnimation(time, this.isJumping, this.isSliding, this.speedMultiplier);

      // Move track chunks toward player (infinite track)
      for (const chunk of this.trackChunks) {
        chunk.mesh.position.z += distanceDelta;
      }

      for (const chunk of this.trackChunks) {
        if (chunk.mesh.position.z > 25) {
          let minZ = 0;
          for (const c of this.trackChunks) {
            if (c.mesh.position.z < minZ) minZ = c.mesh.position.z;
          }
          chunk.mesh.position.z = minZ - this.chunkLength;

          // Spawn new row of obstacles in this recycled track chunk
          this.spawnRow(chunk.mesh.position.z);
        }
      }

      // Collectibles handling
      const playerX = this.player.group.position.x;
      const playerY = this.playerY;

      for (let i = this.activeCollectibles.length - 1; i >= 0; i--) {
        const item = this.activeCollectibles[i];
        item.mesh.position.z += distanceDelta;
        item.mesh.rotation.y += delta * 3.5;

        // Pickup detection (within 1.4m of player)
        if (!item.collected && Math.abs(item.mesh.position.z) < 1.4) {
          const dx = Math.abs(playerX - item.mesh.position.x);
          if (dx < 1.2) {
            item.collected = true;
            this.collectiblesCount++;
            this.score += item.points;

            if (item.type === 'CRYSTAL') {
              soundManager.playCrystalCollect();
            } else {
              soundManager.playMineralCollect();
            }

            this.triggerSparkle(item.mesh.position.x, item.mesh.position.y, 0, 16);

            // 1,000 collectibles planetary jump!
            if (this.collectiblesCount % 1000 === 0) {
              this.triggerWarpToNextPlanet();
            }

            this.scene.remove(item.mesh);
            this.activeCollectibles.splice(i, 1);
            continue;
          }
        }

        // Cleanup passed items
        if (item.mesh.position.z > 10) {
          this.scene.remove(item.mesh);
          this.activeCollectibles.splice(i, 1);
        }
      }

      // Obstacle Collision Detection (FAIR, PRECISE & TESTED)
      for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
        const obs = this.activeObstacles[i];
        obs.mesh.position.z += distanceDelta;

        // Critical fix: An obstacle only collides when it is strictly in the contact zone!
        // Contact zone is z between -0.6 and +0.6 (where the astronaut stands at z=0).
        // It NEVER collides if it's already passed (z > 0.8) or far ahead (z < -0.8)!
        if (!obs.passed) {
          const obsZ = obs.mesh.position.z;

          // If obstacle safely passed behind astronaut, mark as passed forever!
          if (obsZ > 0.8) {
            obs.passed = true;
          } else if (obsZ >= -0.7 && obsZ <= 0.7) {
            // Player is in the same row! Now check LANE:
            const inSameLane = Math.abs(playerX - obs.mesh.position.x) < 0.9;

            if (inSameLane) {
              let safe = false;

              if (obs.type === 'BARRIER_HIGH') {
                // High Barrier: Player is safe IF SLIDING underneath!
                if (this.isSliding) {
                  safe = true;
                }
              } else if (obs.type === 'BARRIER_LOW') {
                // Low Hurdle: Player is safe IF JUMPING over it!
                if (this.isJumping && playerY > 0.6) {
                  safe = true;
                }
              }

              if (safe) {
                // Mark passed so it won't check again on next frames
                obs.passed = true;
              } else {
                // Real collision crash!
                obs.passed = true;
                soundManager.playCrash();
                this.triggerSparkle(playerX, 1.0, 0, 35, true);
                this.gameOver();
                return;
              }
            }
          }
        }

        // Cleanup passed obstacles
        if (obs.mesh.position.z > 15) {
          this.scene.remove(obs.mesh);
          this.activeObstacles.splice(i, 1);
        }
      }

      // Particle system update
      for (let i = 0; i < this.particleCount; i++) {
        if (this.particleLifespans[i] > 0) {
          this.particleLifespans[i] -= delta;
          this.particlePositions[i * 3] += this.particleVelocities[i * 3] * delta;
          this.particlePositions[i * 3 + 1] += this.particleVelocities[i * 3 + 1] * delta;
          this.particlePositions[i * 3 + 2] += this.particleVelocities[i * 3 + 2] * delta;
        } else {
          this.particlePositions[i * 3 + 1] = -100;
        }
      }
      this.particlePool.geometry.attributes.position.needsUpdate = true;

      // Camera follow
      this.camera.position.x = THREE.MathUtils.damp(
        this.camera.position.x,
        playerX * 0.45,
        10,
        delta
      );

      this.starfield.position.z = (this.distanceMeters * 0.15) % 80;

      // Telemetry update
      this.callbacks.onScoreUpdate(
        this.score,
        Math.floor(this.distanceMeters),
        this.collectiblesCount,
        this.speedMultiplier,
        Math.floor(kmh)
      );
    }

    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.tick);
  };

  private gameOver() {
    this.state = 'GAMEOVER';
    this.callbacks.onStateChange(this.state);
    soundManager.stopMusic();

    this.callbacks.onGameOver({
      score: this.score,
      distance: Math.floor(this.distanceMeters),
      collectibles: this.collectiblesCount,
      planetReached: this.currentPlanet.portugueseName,
      planetIndex: this.currentPlanetIndex,
      maxSpeedKmh: Math.floor(this.maxSpeedKmh),
    });
  }

  public destroy() {
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.onWindowResize);
    soundManager.stopMusic();
    this.renderer.dispose();
    if (this.container && this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
