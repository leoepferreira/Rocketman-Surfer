import * as THREE from 'three';
import { PlanetConfig } from '../types/game';

/**
 * Procedural texture helpers
 */
let glowCanvasTexture: THREE.CanvasTexture | null = null;

function getEnergyGlowTexture(): THREE.CanvasTexture {
  if (!glowCanvasTexture) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(56, 189, 248, 0.9)');
    grad.addColorStop(0.7, 'rgba(14, 165, 233, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    glowCanvasTexture = new THREE.CanvasTexture(canvas);
    glowCanvasTexture.colorSpace = THREE.SRGBColorSpace;
  }
  return glowCanvasTexture;
}

/**
 * Procedural Astronaut (Rocketman)
 * Crucial fix: The astronaut must face FORWARD (-Z direction) with the back/jetpack facing the camera (+Z direction)!
 * When viewed from behind, the player sees:
 * - Astronaut's back, backpack/jetpack with dual nozzles blasting glowing plasma flames towards the camera!
 * - Helmet facing into the screen towards the horizon.
 * - Surfing stance on the cosmic repulsor board.
 */
export interface AstronautActor {
  group: THREE.Group;
  characterRoot: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  torso: THREE.Mesh;
  jetpack: THREE.Group;
  flameLeft: THREE.Mesh;
  flameRight: THREE.Mesh;
  hoverboard: THREE.Group;
  boardGlow: THREE.Mesh;
  updateAnimation: (time: number, isJumping: boolean, isSliding: boolean, speedMultiplier: number) => void;
}

export function createRocketmanAstronaut(): AstronautActor {
  const root = new THREE.Group();
  const characterRoot = new THREE.Group();
  root.add(characterRoot);

  // Materials
  const suitWhite = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.35,
    metalness: 0.2,
  });

  const suitAccent = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Cyan blue
    roughness: 0.3,
    metalness: 0.5,
  });

  const visorGold = new THREE.MeshStandardMaterial({
    color: 0xffb703,
    roughness: 0.1,
    metalness: 0.9,
  });

  const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.4,
    metalness: 0.8,
  });

  const flameMaterial = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.9,
  });

  // 1. Cosmic Surfboard (repulsor hoverboard under feet)
  const hoverboard = new THREE.Group();
  hoverboard.position.y = 0.08;

  const deckGeom = new THREE.BoxGeometry(0.85, 0.08, 1.6);
  const deck = new THREE.Mesh(deckGeom, darkMetal);
  deck.castShadow = true;
  hoverboard.add(deck);

  // Board nose points forward (-Z)
  const noseGeom = new THREE.ConeGeometry(0.25, 0.45, 4);
  const nose = new THREE.Mesh(noseGeom, suitAccent);
  nose.rotation.x = -Math.PI / 2;
  nose.position.z = -0.95;
  nose.scale.set(1, 1, 0.3);
  hoverboard.add(nose);

  // Glowing neon rails along the board
  const railGeom = new THREE.BoxGeometry(0.06, 0.08, 1.5);
  const neonCyan = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
  const railL = new THREE.Mesh(railGeom, neonCyan);
  railL.position.x = -0.42;
  hoverboard.add(railL);

  const railR = new THREE.Mesh(railGeom, neonCyan);
  railR.position.x = 0.42;
  hoverboard.add(railR);

  // Board repulsor glow under deck
  const glowPlaneGeom = new THREE.PlaneGeometry(0.8, 1.4);
  const boardGlowMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  });
  const boardGlow = new THREE.Mesh(glowPlaneGeom, boardGlowMat);
  boardGlow.rotation.x = -Math.PI / 2;
  boardGlow.position.y = -0.06;
  hoverboard.add(boardGlow);

  characterRoot.add(hoverboard);

  // 2. Torso (Body suit)
  const torsoGeom = new THREE.BoxGeometry(0.65, 0.85, 0.45);
  const torso = new THREE.Mesh(torsoGeom, suitWhite);
  torso.position.y = 1.15;
  torso.castShadow = true;
  characterRoot.add(torso);

  // Front chest display (points forward to -Z)
  const chestPlateGeom = new THREE.BoxGeometry(0.4, 0.35, 0.05);
  const chestPlate = new THREE.Mesh(chestPlateGeom, suitAccent);
  chestPlate.position.set(0, 0.1, -0.24);
  torso.add(chestPlate);

  // 3. Jetpack Unit (Mounted on the BACK facing the camera, +Z)
  const jetpack = new THREE.Group();
  jetpack.position.set(0, 1.25, 0.28); // On the back (+Z)

  const packGeom = new THREE.BoxGeometry(0.55, 0.65, 0.22);
  const packMesh = new THREE.Mesh(packGeom, darkMetal);
  packMesh.castShadow = true;
  jetpack.add(packMesh);

  // Dual Thruster Rockets
  const thrusterGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.75, 12);
  const podL = new THREE.Mesh(thrusterGeom, suitAccent);
  podL.position.set(-0.24, 0, 0.04);
  jetpack.add(podL);

  const podR = new THREE.Mesh(thrusterGeom, suitAccent);
  podR.position.set(0.24, 0, 0.04);
  jetpack.add(podR);

  // Exhaust Nozzles (pointing down and slightly back)
  const nozGeom = new THREE.CylinderGeometry(0.09, 0.15, 0.18, 12);
  const nozL = new THREE.Mesh(nozGeom, darkMetal);
  nozL.position.set(-0.24, -0.42, 0.04);
  jetpack.add(nozL);

  const nozR = new THREE.Mesh(nozGeom, darkMetal);
  nozR.position.set(0.24, -0.42, 0.04);
  jetpack.add(nozR);

  // Plasma Flames blasting downward from thrusters
  const flameGeom = new THREE.ConeGeometry(0.14, 0.65, 8);
  flameGeom.rotateX(Math.PI); // Tip points downward

  const flameLeft = new THREE.Mesh(flameGeom, flameMaterial);
  flameLeft.position.set(-0.24, -0.78, 0.04);
  jetpack.add(flameLeft);

  const flameRight = new THREE.Mesh(flameGeom, flameMaterial.clone());
  flameRight.position.set(0.24, -0.78, 0.04);
  jetpack.add(flameRight);

  characterRoot.add(jetpack);

  // 4. Helmet & Gold Visor (Facing forward towards -Z)
  const helmet = new THREE.Group();
  helmet.position.set(0, 1.82, 0);

  const helmetGeom = new THREE.SphereGeometry(0.35, 16, 16);
  const helmetMesh = new THREE.Mesh(helmetGeom, suitWhite);
  helmetMesh.castShadow = true;
  helmet.add(helmetMesh);

  // Golden Sun-Shield Visor facing FORWARD (-Z)
  const visorGeom = new THREE.SphereGeometry(0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
  const visor = new THREE.Mesh(visorGeom, visorGold);
  visor.rotation.x = -Math.PI / 2; // Face forward -Z
  visor.position.set(0, 0.02, -0.15);
  visor.scale.set(1.02, 1.05, 0.88);
  helmet.add(visor);

  characterRoot.add(helmet);

  // 5. Legs & Boots (surfer stance)
  const legGeom = new THREE.CylinderGeometry(0.12, 0.14, 0.62, 8);
  const bootGeom = new THREE.BoxGeometry(0.22, 0.18, 0.4);

  // Left Leg (front-left foot)
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.24, 0.72, 0);
  const lMesh = new THREE.Mesh(legGeom, suitWhite);
  lMesh.position.y = -0.3;
  lMesh.castShadow = true;
  leftLeg.add(lMesh);
  const lBoot = new THREE.Mesh(bootGeom, darkMetal);
  lBoot.position.set(0, -0.6, -0.05);
  leftLeg.add(lBoot);
  characterRoot.add(leftLeg);

  // Right Leg (rear foot)
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.24, 0.72, 0);
  const rMesh = new THREE.Mesh(legGeom, suitWhite);
  rMesh.position.y = -0.3;
  rMesh.castShadow = true;
  rightLeg.add(rMesh);
  const rBoot = new THREE.Mesh(bootGeom, darkMetal);
  rBoot.position.set(0, -0.6, 0.1);
  rightLeg.add(rBoot);
  characterRoot.add(rightLeg);

  // 6. Arms & Gloves
  const armGeom = new THREE.CylinderGeometry(0.09, 0.1, 0.55, 8);
  const gloveGeom = new THREE.SphereGeometry(0.11, 8, 8);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.44, 1.48, 0);
  const lArm = new THREE.Mesh(armGeom, suitWhite);
  lArm.position.y = -0.28;
  lArm.castShadow = true;
  leftArm.add(lArm);
  const lGlove = new THREE.Mesh(gloveGeom, darkMetal);
  lGlove.position.y = -0.56;
  leftArm.add(lGlove);
  characterRoot.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.44, 1.48, 0);
  const rArm = new THREE.Mesh(armGeom, suitWhite);
  rArm.position.y = -0.28;
  rArm.castShadow = true;
  rightArm.add(rArm);
  const rGlove = new THREE.Mesh(gloveGeom, darkMetal);
  rGlove.position.y = -0.56;
  rightArm.add(rGlove);
  characterRoot.add(rightArm);

  // Animation Update
  const updateAnimation = (time: number, isJumping: boolean, isSliding: boolean, speedMultiplier: number) => {
    const cycle = time * 12 * Math.min(speedMultiplier, 2.2);

    if (isSliding) {
      // Crouch / Slide pose: body compresses down onto board, leaning back
      characterRoot.scale.y = 0.45;
      characterRoot.position.y = -0.1;
      torso.rotation.x = 0.35; // Lean back away from obstacle
      hoverboard.rotation.x = 0.05;

      // Intense thruster fire during slide
      const pulse = 2.0 + Math.sin(time * 35) * 0.4;
      flameLeft.scale.set(1.4, pulse, 1.4);
      flameRight.scale.set(1.4, pulse, 1.4);
    } else if (isJumping) {
      // Jump pose: soaring in the air with jetpack blast
      characterRoot.scale.y = 1.0;
      characterRoot.position.y = 0;
      torso.rotation.x = -0.15; // Lean forward slightly into flight
      hoverboard.rotation.x = -0.25;

      // Huge jetpack flames
      const flameScale = 2.4 + Math.sin(time * 30) * 0.5;
      flameLeft.scale.set(1.6, flameScale, 1.6);
      flameRight.scale.set(1.6, flameScale, 1.6);
    } else {
      // Normal Surfing pose
      characterRoot.scale.y = 1.0;
      characterRoot.position.y = 0;
      torso.rotation.x = -0.05;

      // Surfer rhythm sway
      const sway = Math.sin(cycle * 0.4) * 0.06;
      hoverboard.rotation.z = sway;
      torso.rotation.z = -sway * 0.5;

      // Running/surfing leg sway
      leftLeg.rotation.x = Math.sin(cycle) * 0.35;
      rightLeg.rotation.x = -Math.sin(cycle) * 0.35;
      leftArm.rotation.x = -Math.sin(cycle) * 0.35;
      rightArm.rotation.x = Math.sin(cycle) * 0.35;

      // Idle thruster flame flicker
      const f = 1.0 + Math.sin(time * 20) * 0.2;
      flameLeft.scale.set(1.0, f, 1.0);
      flameRight.scale.set(1.0, f, 1.0);
    }
  };

  return {
    group: root,
    characterRoot,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    torso,
    jetpack,
    flameLeft,
    flameRight,
    hoverboard,
    boardGlow,
    updateAnimation,
  };
}

/**
 * Procedural Space Crystal (Collectable)
 */
export function createCrystalMesh(colorHex: string): THREE.Group {
  const group = new THREE.Group();

  const crystalGeom = new THREE.OctahedronGeometry(0.45, 0);
  const crystalMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.15,
    metalness: 0.6,
    emissive: new THREE.Color(colorHex),
    emissiveIntensity: 0.8,
  });

  const mesh = new THREE.Mesh(crystalGeom, crystalMat);
  mesh.castShadow = true;
  group.add(mesh);

  // Outer glowing halo
  const spriteMat = new THREE.SpriteMaterial({
    map: getEnergyGlowTexture(),
    color: new THREE.Color(colorHex),
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(1.3, 1.3, 1.3);
  group.add(sprite);

  return group;
}

/**
 * Procedural Space Mineral / Raw Ore Geode
 */
export function createMineralMesh(accentColorHex: string): THREE.Group {
  const group = new THREE.Group();

  const rockGeom = new THREE.DodecahedronGeometry(0.4, 0);
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.85,
    metalness: 0.3,
  });
  const rock = new THREE.Mesh(rockGeom, rockMat);
  rock.castShadow = true;
  group.add(rock);

  const veinGeom = new THREE.BoxGeometry(0.2, 0.45, 0.2);
  const veinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentColorHex),
    emissive: new THREE.Color(accentColorHex),
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });
  const vein = new THREE.Mesh(veinGeom, veinMat);
  vein.rotation.set(0.4, 0.6, 0.2);
  group.add(vein);

  return group;
}

/**
 * Obstacle: HIGH BARRIER ARCH
 * Clearance underneath is 1.2m!
 * Player MUST SLIDE to pass underneath! (Standing hits at y = 1.8m)
 */
export function createHighBarrierMesh(accentColor: string): THREE.Group {
  const group = new THREE.Group();

  // Support posts on the sides
  const postGeom = new THREE.CylinderGeometry(0.12, 0.15, 3.2, 8);
  const postMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.8,
    roughness: 0.3,
  });

  const postL = new THREE.Mesh(postGeom, postMat);
  postL.position.set(-1.15, 1.6, 0);
  group.add(postL);

  const postR = new THREE.Mesh(postGeom, postMat);
  postR.position.set(1.15, 1.6, 0);
  group.add(postR);

  // High Arch Bar (bottom is at y = 1.45, player slides at y = 0.5)
  const barGeom = new THREE.BoxGeometry(2.4, 0.8, 0.4);
  const barMat = new THREE.MeshStandardMaterial({
    color: 0xef4444, // Red danger
    emissive: 0x991b1b,
    emissiveIntensity: 0.7,
    roughness: 0.3,
  });
  const bar = new THREE.Mesh(barGeom, barMat);
  bar.position.set(0, 1.9, 0);
  group.add(bar);

  // Downward Chevron / Slide Indicator
  const signGeom = new THREE.ConeGeometry(0.25, 0.35, 3);
  signGeom.rotateZ(Math.PI); // Points DOWN
  const signMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const sign = new THREE.Mesh(signGeom, signMat);
  sign.position.set(0, 1.7, 0.22);
  group.add(sign);

  return group;
}

/**
 * Obstacle: LOW PLASMA HURDLE
 * Height is ~0.6m.
 * Player MUST JUMP to clear it!
 */
export function createLowBarrierMesh(accentColor: string): THREE.Group {
  const group = new THREE.Group();

  // Low base pylons
  const baseGeom = new THREE.BoxGeometry(0.35, 0.55, 0.4);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.8,
  });

  const baseL = new THREE.Mesh(baseGeom, baseMat);
  baseL.position.set(-1.05, 0.28, 0);
  group.add(baseL);

  const baseR = new THREE.Mesh(baseGeom, baseMat);
  baseR.position.set(1.05, 0.28, 0);
  group.add(baseR);

  // Low Plasma Beam (y = 0.45m)
  const beamGeom = new THREE.CylinderGeometry(0.1, 0.1, 2.1, 8);
  beamGeom.rotateZ(Math.PI / 2);
  const beamMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentColor),
    emissive: new THREE.Color(accentColor),
    emissiveIntensity: 1.0,
  });
  const beam = new THREE.Mesh(beamGeom, beamMat);
  beam.position.set(0, 0.45, 0);
  group.add(beam);

  // Upward Arrow / Jump Indicator
  const arrowGeom = new THREE.ConeGeometry(0.2, 0.3, 3);
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const arrow = new THREE.Mesh(arrowGeom, arrowMat);
  arrow.position.set(0, 0.45, 0.1);
  group.add(arrow);

  return group;
}

/**
 * Obstacle: TALL SPIRE / MONOLITH (Must dodge lane)
 */
export function createCrystalSpireMesh(planet: PlanetConfig): THREE.Group {
  const group = new THREE.Group();

  const spireGeom = new THREE.ConeGeometry(0.65, 3.2, 6);
  const spireMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(planet.accentColor),
    emissive: new THREE.Color(planet.accentColor),
    emissiveIntensity: 0.4,
    roughness: 0.3,
    metalness: 0.6,
  });

  const spire = new THREE.Mesh(spireGeom, spireMat);
  spire.position.y = 1.6;
  spire.castShadow = true;
  group.add(spire);

  return group;
}

/**
 * Track Chunk (3 lanes)
 */
export function createTrackChunk(planet: PlanetConfig, chunkLength: number): THREE.Group {
  const group = new THREE.Group();

  // Track Surface
  const roadGeom = new THREE.BoxGeometry(7.6, 0.2, chunkLength);
  const roadMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(planet.trackColor),
    roughness: 0.6,
    metalness: 0.3,
  });
  const road = new THREE.Mesh(roadGeom, roadMat);
  road.position.y = -0.1;
  road.receiveShadow = true;
  group.add(road);

  // Neon lane dividers (at x = -1.25 and x = +1.25)
  const stripeGeom = new THREE.PlaneGeometry(0.1, chunkLength);
  const stripeMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(planet.accentColor),
  });

  const stripeL = new THREE.Mesh(stripeGeom, stripeMat);
  stripeL.rotation.x = -Math.PI / 2;
  stripeL.position.set(-1.25, 0.01, 0);
  group.add(stripeL);

  const stripeR = new THREE.Mesh(stripeGeom, stripeMat);
  stripeR.rotation.x = -Math.PI / 2;
  stripeR.position.set(1.25, 0.01, 0);
  group.add(stripeR);

  // Side Rails
  const railGeom = new THREE.BoxGeometry(0.2, 0.4, chunkLength);
  const railMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.8,
  });

  const railL = new THREE.Mesh(railGeom, railMat);
  railL.position.set(-3.8, 0.2, 0);
  group.add(railL);

  const railR = new THREE.Mesh(railGeom, railMat);
  railR.position.set(3.8, 0.2, 0);
  group.add(railR);

  return group;
}

/**
 * Planet Backdrop
 */
export function createCelestialBackdrop(planet: PlanetConfig): THREE.Group {
  const group = new THREE.Group();

  const sphereGeom = new THREE.SphereGeometry(50, 32, 32);
  const sphereMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(planet.accentColor),
    roughness: 0.8,
    metalness: 0.1,
  });
  const sphere = new THREE.Mesh(sphereGeom, sphereMat);
  group.add(sphere);

  if (planet.hasRings) {
    const ringGeom = new THREE.RingGeometry(60, 95, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(planet.ringColor || '#e2d9b8'),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2.6;
    group.add(ring);
  }

  group.position.set(0, 45, -280);
  return group;
}
