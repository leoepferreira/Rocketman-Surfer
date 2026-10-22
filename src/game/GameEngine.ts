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
  onScoreUpdate: (
    score: number,
    distance: number,
    planetCollectibles: number,
    totalCollectibles: number,
    speedMultiplier: number,
    speedKmh: number,
    ratePercent: number
  ) => void;
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
  private isLoopRunning: boolean = false;
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
  public planetCollectiblesCount: number = 0;
  public totalCollectiblesCount: number = 0;
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

  // Dedicated Groups for 100% clean obstacle & track management
  private trackGroup: THREE.Group;
  private obstacleGroup: THREE.Group;
  private collectibleGroup: THREE.Group;

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

    // Dedicated structural groups
    this.trackGroup = new THREE.Group();
    this.scene.add(this.trackGroup);

    this.obstacleGroup = new THREE.Group();
    this.scene.add(this.obstacleGroup);

    this.collectibleGroup = new THREE.Group();
    this.scene.add(this.collectibleGroup);

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
    this.isLoopRunning = true;
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

  private clearGroup(group: THREE.Group) {
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      obj.traverse((child) => {
        if ((child as THREE.Mesh).geometry) {
          (child as THREE.Mesh).geometry.dispose();
        }
        if ((child as THREE.Mesh).material) {
          const mat = (child as THREE.Mesh).material;
          if (Array.isArray(mat)) {
            mat.forEach((m) => m.dispose());
          } else {
            mat.dispose();
          }
        }
      });
    }
  }

  /**
   * Limpeza Absoluta de Obstáculos e Itens:
   * Remove 100% dos obstáculos (incluindo monólitos bloqueadores, barreiras altas e baixas)
   * e itens colecionáveis, limpa os arrays de controle e faz uma varredura
   * defensiva na cena inteira para descartar qualquer mesh órfão.
   */
  private purgeAllObstaclesAndCollectibles() {
    this.clearGroup(this.obstacleGroup);
    this.clearGroup(this.collectibleGroup);
    this.activeObstacles = [];
    this.activeCollectibles = [];

    // Varredura defensiva no grafo da cena
    for (let i = this.scene.children.length - 1; i >= 0; i--) {
      const child = this.scene.children[i];
      if (
        child !== this.dirLight &&
        child !== this.hemiLight &&
        child !== this.starfield &&
        child !== this.celestialGroup &&
        child !== this.player.group &&
        child !== this.particlePool &&
        child !== this.trackGroup &&
        child !== this.obstacleGroup &&
        child !== this.collectibleGroup
      ) {
        this.scene.remove(child);
        child.traverse((sub: any) => {
          if (sub.geometry) sub.geometry.dispose();
          if (sub.material) {
            if (Array.isArray(sub.material)) sub.material.forEach((m: any) => m.dispose());
            else sub.material.dispose();
          }
        });
      }
    }
  }

  private initTrackChunks() {
    this.clearGroup(this.trackGroup);
    this.trackChunks = [];

    // Purga total e irrestrita de todos os elementos anteriores
    this.purgeAllObstaclesAndCollectibles();

    // Build 6 seamless continuous track chunks
    for (let i = 0; i < this.chunkCount; i++) {
      const z = -i * this.chunkLength;
      const mesh = createTrackChunk(this.currentPlanet, this.chunkLength);
      mesh.position.z = z;
      this.trackGroup.add(mesh);
      this.trackChunks.push({ mesh, z });
    }

    // Ponto de partida seguro: obstáculos iniciam a partir de 100 metros de distância (-100m)
    this.spawnRow(-100);
    this.spawnRow(-145);
    this.spawnRow(-190);
    this.spawnRow(-235);
    this.spawnRow(-280);
  }

  private onWindowResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private addObstacle(lane: -1 | 0 | 1, type: 'BARRIER_HIGH' | 'BARRIER_LOW' | 'SPIRE', spawnZ: number) {
    let mesh: THREE.Group;
    if (type === 'BARRIER_HIGH') {
      mesh = createHighBarrierMesh(this.currentPlanet.accentColor);
    } else if (type === 'BARRIER_LOW') {
      mesh = createLowBarrierMesh(this.currentPlanet.accentColor);
    } else {
      mesh = createCrystalSpireMesh(this.currentPlanet);
    }

    mesh.position.set(lane * 2.4, 0, spawnZ);
    this.obstacleGroup.add(mesh);

    this.activeObstacles.push({
      id: `obs-${Date.now()}-${Math.random()}`,
      mesh,
      lane,
      type,
      z: spawnZ,
      passed: false,
    });
  }

  private addCollectible(
    lane: number,
    y: number,
    z: number,
    isCrystal = true,
    bonusPoints = 0,
    specificColor?: string
  ) {
    const palette = this.currentPlanet.gemPalettes && this.currentPlanet.gemPalettes.length > 0
      ? this.currentPlanet.gemPalettes
      : [this.currentPlanet.crystalColor];
    const gemColor = specificColor || palette[Math.floor(Math.random() * palette.length)];

    // Padrões de meteoros com cores frias e escuras relativas ao planeta atual
    const meteorColors = this.currentPlanet.meteorPalettes && this.currentPlanet.meteorPalettes.length > 0
      ? this.currentPlanet.meteorPalettes
      : ['#1e293b'];
    const rockColor = meteorColors[Math.floor(Math.random() * meteorColors.length)];

    const itemMesh = isCrystal
      ? createCrystalMesh(gemColor)
      : createMineralMesh(gemColor, rockColor);

    itemMesh.position.set(lane * 2.4, y, z);
    this.collectibleGroup.add(itemMesh);

    this.activeCollectibles.push({
      id: `item-${Date.now()}-${Math.random()}`,
      mesh: itemMesh,
      lane,
      type: isCrystal ? 'CRYSTAL' : 'MINERAL',
      z,
      points: (isCrystal ? 100 : 50) + bonusPoints,
      collected: false,
    });
  }

  /**
   * Spawns hazards and collectibles carefully along the track.
   * Regra estrita de risco vs recompensa:
   * Quando uma fileira possui jóias em obstáculos (pular ou se abaixar), NÃO surgem jóias
   * em trilhas abertas na mesma fileira! Para ganhar as jóias, o piloto DEVE encarar o obstáculo.
   */
  private spawnRow(spawnZ: number) {
    const allLanes: (-1 | 0 | 1)[] = [-1, 0, 1];
    const planetIdx = this.currentPlanetIndex;

    // Pool de padrões cumulativos disponíveis para este planeta
    const patternPool: string[] = ['SINGLE_OBSTACLE'];

    if (planetIdx >= 1) {
      // Fase 2+: Jóias aéreas para resgatar pulando sobre objetos puláveis
      patternPool.push('JUMP_WITH_AIRBORNE_GEMS');
    }
    if (planetIdx >= 2) {
      // Fase 3+: Jóias para buscar se arrastando por baixo de barreiras de abaixar
      patternPool.push('SLIDE_WITH_UNDER_GEMS');
    }
    if (planetIdx >= 3) {
      // Fase 4+: 2 caminhos bloqueados ao mesmo tempo por barreiras puláveis
      patternPool.push('DUAL_LOW_BARRIERS');
    }
    if (planetIdx >= 4) {
      // Fase 5+: 2 caminhos bloqueados ao mesmo tempo por barreiras de se abaixar
      patternPool.push('DUAL_HIGH_BARRIERS');
    }
    if (planetIdx >= 5) {
      // Fase 6+: Até 3 caminhos com barreiras puláveis OU 3 caminhos para passar por baixo
      patternPool.push('TRIPLE_LOW_BARRIERS');
      patternPool.push('TRIPLE_HIGH_BARRIERS');
    }
    if (planetIdx >= 6) {
      // Fase 7+: Até 2 caminhos com barreiras passáveis e um bloqueado (Monólito impassável)
      patternPool.push('SPIRE_AND_TWO_PASSABLE');
    }
    if (planetIdx >= 7) {
      // Fase 8+: Até 2 caminhos bloqueados (Monólitos) e um caminho passável
      patternPool.push('TWO_SPIRES_AND_ONE_PASSABLE');
    }

    // Seleciona um padrão aleatório do conjunto cumulativo
    const selectedPattern = patternPool[Math.floor(Math.random() * patternPool.length)];

    switch (selectedPattern) {
      case 'JUMP_WITH_AIRBORNE_GEMS': {
        // 1 barreira de pulo com jóias aéreas EXCLUSIVAS acima do obstáculo
        const jumpLane = allLanes[Math.floor(Math.random() * allLanes.length)];
        this.addObstacle(jumpLane, 'BARRIER_LOW', spawnZ);

        // Trilha de jóias aéreas em arco de salto (1.35m na subida/descida e 1.60m no ápice do salto)
        // Faixas abertas ficam sem jóias para valorizar o salto no obstáculo!
        const heights = [1.35, 1.60, 1.35];
        for (let i = 0; i < 3; i++) {
          const itemZ = spawnZ + 2 - i * 2;
          this.addCollectible(jumpLane, heights[i], itemZ, true, 50);
        }
        break;
      }

      case 'SLIDE_WITH_UNDER_GEMS': {
        // 1 barreira alta com jóias EXCLUSIVAS diretamente sob o vão do portal (exige deslize)
        const slideLane = allLanes[Math.floor(Math.random() * allLanes.length)];
        this.addObstacle(slideLane, 'BARRIER_HIGH', spawnZ);

        // Jóias no solo sob a barreira a 0.40m de altura
        // Faixas abertas ficam vazias para valorizar encarar o obstáculo!
        for (let i = 0; i < 3; i++) {
          const itemZ = spawnZ + 2 - i * 2;
          this.addCollectible(slideLane, 0.40, itemZ, true, 50);
        }
        break;
      }

      case 'DUAL_LOW_BARRIERS': {
        // 2 caminhos bloqueados ao mesmo tempo por barreiras puláveis
        const freeLane = allLanes[Math.floor(Math.random() * allLanes.length)];
        const blockedLanes = allLanes.filter((l) => l !== freeLane);

        // Jóias aéreas exclusivamente nas barreiras de pulo; faixa livre fica sem jóias
        for (const lane of blockedLanes) {
          this.addObstacle(lane, 'BARRIER_LOW', spawnZ);
          this.addCollectible(lane, 1.55, spawnZ, true, 50);
        }
        break;
      }

      case 'DUAL_HIGH_BARRIERS': {
        // 2 caminhos bloqueados ao mesmo tempo por barreiras de se abaixar
        const freeLane = allLanes[Math.floor(Math.random() * allLanes.length)];
        const blockedLanes = allLanes.filter((l) => l !== freeLane);

        // Jóias exclusivamente sob os portais de deslize; faixa livre fica sem jóias
        for (const lane of blockedLanes) {
          this.addObstacle(lane, 'BARRIER_HIGH', spawnZ);
          this.addCollectible(lane, 0.40, spawnZ, true, 50);
        }
        break;
      }

      case 'TRIPLE_LOW_BARRIERS': {
        // Até 3 caminhos com barreiras puláveis: salto obrigatório em qualquer faixa!
        for (const lane of allLanes) {
          this.addObstacle(lane, 'BARRIER_LOW', spawnZ);
          this.addCollectible(lane, 1.55, spawnZ, true, 60);
        }
        break;
      }

      case 'TRIPLE_HIGH_BARRIERS': {
        // Até 3 caminhos com barreiras para passar por baixo: deslize obrigatório em qualquer faixa!
        for (const lane of allLanes) {
          this.addObstacle(lane, 'BARRIER_HIGH', spawnZ);
          this.addCollectible(lane, 0.40, spawnZ, true, 60);
        }
        break;
      }

      case 'SPIRE_AND_TWO_PASSABLE': {
        // 1 caminho bloqueado por Monólito intransponível e 2 caminhos com barreiras passáveis
        const spireLane = allLanes[Math.floor(Math.random() * allLanes.length)];
        const passableLanes = allLanes.filter((l) => l !== spireLane);

        this.addObstacle(spireLane, 'SPIRE', spawnZ);

        // Jóias exclusivamente nas barreiras passáveis
        const type1: 'BARRIER_LOW' | 'BARRIER_HIGH' = Math.random() > 0.5 ? 'BARRIER_LOW' : 'BARRIER_HIGH';
        const type2: 'BARRIER_LOW' | 'BARRIER_HIGH' = Math.random() > 0.5 ? 'BARRIER_LOW' : 'BARRIER_HIGH';

        this.addObstacle(passableLanes[0], type1, spawnZ);
        if (type1 === 'BARRIER_LOW') {
          this.addCollectible(passableLanes[0], 1.55, spawnZ, true, 75);
        } else {
          this.addCollectible(passableLanes[0], 0.40, spawnZ, true, 75);
        }

        this.addObstacle(passableLanes[1], type2, spawnZ);
        if (type2 === 'BARRIER_LOW') {
          this.addCollectible(passableLanes[1], 1.55, spawnZ, true, 75);
        } else {
          this.addCollectible(passableLanes[1], 0.40, spawnZ, true, 75);
        }
        break;
      }

      case 'TWO_SPIRES_AND_ONE_PASSABLE': {
        // 2 caminhos bloqueados por Monólitos intransponíveis e 1 único caminho passável!
        const passableLane = allLanes[Math.floor(Math.random() * allLanes.length)];
        const spireLanes = allLanes.filter((l) => l !== passableLane);

        for (const lane of spireLanes) {
          this.addObstacle(lane, 'SPIRE', spawnZ);
        }

        // O único caminho passável: com barreira passável ou corredor livre de jóias
        if (Math.random() > 0.35) {
          const passType: 'BARRIER_LOW' | 'BARRIER_HIGH' = Math.random() > 0.5 ? 'BARRIER_LOW' : 'BARRIER_HIGH';
          this.addObstacle(passableLane, passType, spawnZ);
          if (passType === 'BARRIER_LOW') {
            this.addCollectible(passableLane, 1.55, spawnZ, true, 100);
          } else {
            this.addCollectible(passableLane, 0.40, spawnZ, true, 100);
          }
        } else {
          for (let i = 0; i < 3; i++) {
            this.addCollectible(passableLane, 0.75, spawnZ + 5 - i * 3, true, 100);
          }
        }
        break;
      }

      default:
      case 'SINGLE_OBSTACLE': {
        // Padrão Fase 1 (Mercúrio): 1 obstáculo aleatório, 2 faixas abertas
        const obsLane = allLanes[Math.floor(Math.random() * allLanes.length)];
        const openLanes = allLanes.filter((l) => l !== obsLane);

        const randType = Math.random();
        let type: 'BARRIER_HIGH' | 'BARRIER_LOW' | 'SPIRE';
        if (randType < 0.35) {
          type = 'BARRIER_HIGH';
        } else if (randType < 0.7) {
          type = 'BARRIER_LOW';
        } else {
          type = 'SPIRE';
        }

        this.addObstacle(obsLane, type, spawnZ);

        // Se colocarmos jóias no obstáculo, NÃO geramos jóias na faixa aberta!
        let hasObstacleGems = false;
        if (planetIdx >= 1 && type === 'BARRIER_LOW' && Math.random() > 0.35) {
          this.addCollectible(obsLane, 1.55, spawnZ, true, 50);
          hasObstacleGems = true;
        } else if (planetIdx >= 2 && type === 'BARRIER_HIGH' && Math.random() > 0.35) {
          this.addCollectible(obsLane, 0.40, spawnZ, true, 50);
          hasObstacleGems = true;
        }

        // Somente se NÃO houver jóias no obstáculo é que surgem jóias na faixa aberta!
        if (!hasObstacleGems) {
          const itemLane = openLanes[Math.floor(Math.random() * openLanes.length)];
          const isCrystal = Math.random() > 0.4;
          for (let i = 0; i < 3; i++) {
            const itemZ = spawnZ + 6 - i * 4;
            this.addCollectible(itemLane, 0.75, itemZ, isCrystal);
          }
        }
        break;
      }
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
      this.playerVy = 11.2; // Calibrated jump arc: clears hurdles gracefully and intercepts airborne gems
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
    // 1. Cancel previous frame to prevent double loops or race conditions
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = 0;
    }

    // 2. Planet and score state reset
    this.currentPlanetIndex = planetIndex;
    this.currentPlanet = SOLAR_PLANETS[this.currentPlanetIndex];
    this.score = 0;
    this.distanceMeters = 0;
    this.planetCollectiblesCount = 0;
    this.totalCollectiblesCount = 0;
    this.speedMultiplier = 1.0;
    this.baseSpeed = 24;
    this.maxSpeedKmh = 86;
    this.isWarping = false;
    this.warpTimer = 0;

    // 3. Player lane & physics reset
    this.playerLane = 0;
    this.targetPlayerX = 0;
    this.playerY = 0;
    this.playerVy = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;

    // 4. Reset 3D character transforms & poses completely
    this.player.group.position.set(0, 0, 0);
    this.player.group.rotation.set(0, 0, 0);
    this.player.characterRoot.scale.set(1, 1, 1);
    this.player.characterRoot.position.set(0, 0, 0);
    this.player.torso.rotation.set(0, 0, 0);
    this.player.leftLeg.rotation.set(0, 0, 0);
    this.player.rightLeg.rotation.set(0, 0, 0);
    this.player.leftArm.rotation.set(0, 0, 0);
    this.player.rightArm.rotation.set(0, 0, 0);

    // 5. Reset camera to default perspective looking down track
    this.camera.position.set(0, 3.4, 5.8);
    this.camera.lookAt(0, 1.4, -18);

    // 6. Purge all obstacles/collectibles and build fresh runway with empty space in front
    this.applyPlanetVisuals(this.currentPlanet);
    this.initTrackChunks();

    // 7. Update state and restart audio
    this.state = 'PLAYING';
    this.callbacks.onStateChange(this.state);
    soundManager.startMusic();

    // 8. Re-initialize clock and trigger render loop cleanly
    this.clock = new THREE.Clock();
    this.clock.start();
    this.isLoopRunning = true;
    this.tick();
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
      if (this.state === 'PLAYING') {
        this.transitionToPlanet(index, false);
      } else {
        this.currentPlanetIndex = index;
        this.currentPlanet = SOLAR_PLANETS[index];
        this.applyPlanetVisuals(this.currentPlanet);
        this.callbacks.onPlanetChange(this.currentPlanet, false);
      }
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

  /**
   * Transição Completa de Planeta:
   * 1. Remove 100% dos obstáculos e jóias da tela imediatamente
   * 2. Recria os trechos da pista com o tema e cores do novo planeta
   * 3. Reseta a velocidade para a velocidade inicial (speedMultiplier = 1.0)
   * 4. Gera novos obstáculos a partir da linha de partida segura (-70m), garantindo
   *    tempo de manobra e reação para o piloto se ajustar à nova realidade!
   */
  private transitionToPlanet(index: number, isWarp: boolean) {
    this.currentPlanetIndex = index;
    this.currentPlanet = SOLAR_PLANETS[index];
    this.planetCollectiblesCount = 0;
    this.speedMultiplier = 1.0;

    // Reseta física e pose do astronauta
    this.playerY = 0;
    this.playerVy = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.player.torso.rotation.set(0, 0, 0);
    this.player.characterRoot.position.set(0, 0, 0);
    this.player.leftLeg.rotation.set(0, 0, 0);
    this.player.rightLeg.rotation.set(0, 0, 0);
    this.player.leftArm.rotation.set(0, 0, 0);
    this.player.rightArm.rotation.set(0, 0, 0);

    // 1. Exclui 100% de todos os obstáculos (monólitos bloqueadores e barreiras) e itens da tela
    this.purgeAllObstaclesAndCollectibles();

    // 2. Reconstrói a pista com as texturas e iluminação do novo planeta
    this.clearGroup(this.trackGroup);
    this.trackChunks = [];
    for (let i = 0; i < this.chunkCount; i++) {
      const z = -i * this.chunkLength;
      const mesh = createTrackChunk(this.currentPlanet, this.chunkLength);
      mesh.position.z = z;
      this.trackGroup.add(mesh);
      this.trackChunks.push({ mesh, z });
    }

    // 3. Gera novos obstáculos a partir da distância de segurança de 100 metros (-100m)
    // A 24 m/s (86 km/h base), -100m concede mais de 4 segundos inteiros de pista limpa
    // para adaptação total à nova realidade do planeta!
    this.spawnRow(-100);
    this.spawnRow(-145);
    this.spawnRow(-190);
    this.spawnRow(-235);
    this.spawnRow(-280);

    // 4. Aplica ambientação visual
    this.applyPlanetVisuals(this.currentPlanet);

    // 5. Efeitos de Hiper-salto (Warp)
    if (isWarp) {
      this.isWarping = true;
      this.warpTimer = 2.8;
      soundManager.playWarp();
      // Rajada de partículas estelares de dobra espacial
      for (let i = 0; i < 40; i++) {
        this.triggerSparkle(
          this.player.group.position.x + (Math.random() - 0.5) * 4,
          Math.random() * 2.5 + 0.5,
          -Math.random() * 25 - 5,
          1,
          false
        );
      }
    }

    // 6. Notifica interface do usuário
    this.callbacks.onPlanetChange(this.currentPlanet, isWarp);
  }

  private triggerWarpToNextPlanet() {
    if (this.isWarping) return;
    const nextIndex = (this.currentPlanetIndex + 1) % SOLAR_PLANETS.length;
    this.transitionToPlanet(nextIndex, true);
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

      // Scaled rate per planet: Mercúrio = 1.0%, Vênus = 1.5%, Terra = 2.0%, etc.
      const currentRate = 0.01 + (this.currentPlanetIndex * 0.005);
      this.speedMultiplier = 1.0 + (this.planetCollectiblesCount * currentRate);
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
      const gravity = 28;
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

        // Pickup detection (within 1.4m of player in Z)
        if (!item.collected && Math.abs(item.mesh.position.z) < 1.4) {
          const dx = Math.abs(playerX - item.mesh.position.x);
          if (dx < 1.2) {
            // Check vertical reach (Y):
            // Ground items (y ~ 0.75m) are collected running, jumping or sliding.
            // Airborne items (y ~ 1.35-1.60m) are collected during jump flight.
            // Sliding items (y ~ 0.40m) are collected while sliding.
            const itemY = item.mesh.position.y;
            let canReach = false;

            if (this.isJumping) {
              // During jump: Player easily collects any airborne gems or ground gems in flight path
              canReach = itemY >= 0.25 && itemY <= playerY + 2.4;
            } else if (this.isSliding) {
              // During slide: Crouching low, collects ground gems and under-barrier gems
              canReach = itemY >= -0.2 && itemY <= 1.4;
            } else {
              // Running on track: Collects ground gems (y ~ 0.75m), cannot reach airborne gems without jumping (y >= 1.3m)
              canReach = itemY >= -0.2 && itemY <= 1.25;
            }

            if (canReach) {
              item.collected = true;
              this.planetCollectiblesCount++;
              this.totalCollectiblesCount++;
              this.score += item.points;

              if (item.type === 'CRYSTAL') {
                soundManager.playCrystalCollect();
              } else {
                soundManager.playMineralCollect();
              }

              this.triggerSparkle(item.mesh.position.x, item.mesh.position.y, 0, 16);

              // Reached 100 gems on this planet: WARP to next planet and reset speed!
              // Game continues seamless run without calculating ranking here!
              if (this.planetCollectiblesCount >= 100) {
                this.triggerWarpToNextPlanet();
                break;
              }

              this.collectibleGroup.remove(item.mesh);
              this.activeCollectibles.splice(i, 1);
              continue;
            }
          }
        }

        // Cleanup passed items
        if (item.mesh.position.z > 10) {
          this.collectibleGroup.remove(item.mesh);
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
          // Escudo de dobra estelar: imunidade total a colisões durante o hiper-salto entre planetas
          if (this.isWarping) {
            continue;
          }

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
                // Low Hurdle: Player is safe IF JUMPING over it (clears 0.45m beam)!
                if (this.isJumping && playerY > 0.35) {
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
                break;
              }
            }
          }
        }

        // Cleanup passed obstacles
        if (obs.mesh.position.z > 15) {
          this.obstacleGroup.remove(obs.mesh);
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
      const ratePercent = 1.0 + (this.currentPlanetIndex * 0.5);
      this.callbacks.onScoreUpdate(
        this.score,
        Math.floor(this.distanceMeters),
        this.planetCollectiblesCount,
        this.totalCollectiblesCount,
        this.speedMultiplier,
        Math.floor(kmh),
        ratePercent
      );
    }

    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.tick);
  };

  private gameOver() {
    this.state = 'GAMEOVER';
    this.callbacks.onStateChange(this.state);
    soundManager.stopMusic();

    // Final ranking and stats calculated ONLY on collision
    this.callbacks.onGameOver({
      score: this.score,
      distance: Math.floor(this.distanceMeters),
      collectibles: this.totalCollectiblesCount,
      planetReached: this.currentPlanet.portugueseName,
      planetIndex: this.currentPlanetIndex,
      maxSpeedKmh: Math.floor(this.maxSpeedKmh),
    });
  }

  public destroy() {
    this.isLoopRunning = false;
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.onWindowResize);
    soundManager.stopMusic();
    this.renderer.dispose();
    if (this.container && this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
