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

  // 1. Hoverboard platform completely REMOVED as requested (astronaut runs directly on boots)
  const hoverboard = new THREE.Group();
  const boardGlow = new THREE.Mesh();

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

  // 5. High-Detail Sculpted Space Boots & Running Legs
  const thighGeom = new THREE.CylinderGeometry(0.12, 0.13, 0.38, 10);
  const kneeGeom = new THREE.BoxGeometry(0.19, 0.13, 0.13);
  const calfGeom = new THREE.CylinderGeometry(0.13, 0.15, 0.40, 10);
  const soleGeom = new THREE.BoxGeometry(0.24, 0.08, 0.48); // Tread sole in dark grip rubber
  const bootFootGeom = new THREE.BoxGeometry(0.22, 0.17, 0.40); // Boot main body
  const toeCapGeom = new THREE.CylinderGeometry(0.11, 0.11, 0.22, 10); // Rounded front toe cap
  toeCapGeom.rotateZ(Math.PI / 2);
  const heelLedGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.06, 8); // Cyan heel thruster LED
  const cyanLedMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

  // Left Leg & Boot
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.24, 0.88, 0);

  const lThigh = new THREE.Mesh(thighGeom, suitWhite);
  lThigh.position.y = -0.19;
  lThigh.castShadow = true;
  leftLeg.add(lThigh);

  const lKnee = new THREE.Mesh(kneeGeom, suitAccent);
  lKnee.position.set(0, -0.38, -0.02);
  leftLeg.add(lKnee);

  const lCalf = new THREE.Mesh(calfGeom, suitWhite);
  lCalf.position.y = -0.60;
  lCalf.castShadow = true;
  leftLeg.add(lCalf);

  const lFoot = new THREE.Group();
  lFoot.position.set(0, -0.80, 0);

  const lBootFoot = new THREE.Mesh(bootFootGeom, darkMetal);
  lBootFoot.position.set(0, 0, -0.06);
  lBootFoot.castShadow = true;
  lFoot.add(lBootFoot);

  const lSole = new THREE.Mesh(soleGeom, darkMetal);
  lSole.position.set(0, -0.08, -0.06);
  lFoot.add(lSole);

  const lToe = new THREE.Mesh(toeCapGeom, suitAccent);
  lToe.position.set(0, -0.02, -0.25);
  lFoot.add(lToe);

  const lLed = new THREE.Mesh(heelLedGeom, cyanLedMat);
  lLed.position.set(0, -0.02, 0.15);
  lFoot.add(lLed);

  leftLeg.add(lFoot);
  characterRoot.add(leftLeg);

  // Right Leg & Boot
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.24, 0.88, 0);

  const rThigh = new THREE.Mesh(thighGeom, suitWhite);
  rThigh.position.y = -0.19;
  rThigh.castShadow = true;
  rightLeg.add(rThigh);

  const rKnee = new THREE.Mesh(kneeGeom, suitAccent);
  rKnee.position.set(0, -0.38, -0.02);
  rightLeg.add(rKnee);

  const rCalf = new THREE.Mesh(calfGeom, suitWhite);
  rCalf.position.y = -0.60;
  rCalf.castShadow = true;
  rightLeg.add(rCalf);

  const rFoot = new THREE.Group();
  rFoot.position.set(0, -0.80, 0);

  const rBootFoot = new THREE.Mesh(bootFootGeom, darkMetal);
  rBootFoot.position.set(0, 0, -0.06);
  rBootFoot.castShadow = true;
  rFoot.add(rBootFoot);

  const rSole = new THREE.Mesh(soleGeom, darkMetal);
  rSole.position.set(0, -0.08, -0.06);
  rFoot.add(rSole);

  const rToe = new THREE.Mesh(toeCapGeom, suitAccent);
  rToe.position.set(0, -0.02, -0.25);
  rFoot.add(rToe);

  const rLed = new THREE.Mesh(heelLedGeom, cyanLedMat);
  rLed.position.set(0, -0.02, 0.15);
  rFoot.add(rLed);

  rightLeg.add(rFoot);
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
    const cycle = time * 13 * Math.min(speedMultiplier, 2.2);

    if (isSliding) {
      // Crouch / Slide pose: crouches down low, sliding smoothly on boots
      characterRoot.scale.y = 0.45;
      characterRoot.position.y = -0.15;
      torso.rotation.x = 0.4;
      leftLeg.rotation.x = -0.7;
      rightLeg.rotation.x = 0.4;

      // Intense thruster fire during slide
      const pulse = 2.0 + Math.sin(time * 35) * 0.4;
      flameLeft.scale.set(1.4, pulse, 1.4);
      flameRight.scale.set(1.4, pulse, 1.4);
    } else if (isJumping) {
      // Jump pose: soaring in the air with jetpack blast
      characterRoot.scale.y = 1.0;
      characterRoot.position.y = 0;
      torso.rotation.x = -0.15;
      leftLeg.rotation.x = 0.35;
      rightLeg.rotation.x = 0.35;

      // Huge jetpack flames
      const flameScale = 2.4 + Math.sin(time * 30) * 0.5;
      flameLeft.scale.set(1.6, flameScale, 1.6);
      flameRight.scale.set(1.6, flameScale, 1.6);
    } else {
      // Running pose: natural running gait on feet
      characterRoot.scale.y = 1.0;
      characterRoot.position.y = Math.abs(Math.sin(cycle * 2)) * 0.08;
      torso.rotation.x = -0.06;

      // Legs swing forward and back
      leftLeg.rotation.x = Math.sin(cycle) * 0.55;
      rightLeg.rotation.x = -Math.sin(cycle) * 0.55;

      // Arms swing in counter-motion
      leftArm.rotation.x = -Math.sin(cycle) * 0.45;
      rightArm.rotation.x = Math.sin(cycle) * 0.45;

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
 * Procedural Space Mineral / Raw Ore Geode / Dark Meteor
 * Cool, dark planetary body with high-contrast energy glow aura for unmistakable visibility
 */
export function createMineralMesh(accentColorHex: string, rockColorHex?: string): THREE.Group {
  const group = new THREE.Group();

  // Cool & dark craggy meteor body with specular highlights and rim emissive
  const rockGeom = new THREE.DodecahedronGeometry(0.44, 1);
  const rockBaseColor = new THREE.Color(rockColorHex || '#334155');
  const rockMat = new THREE.MeshStandardMaterial({
    color: rockBaseColor,
    roughness: 0.35, // Low roughness to produce crisp sun reflections on craggy faces
    metalness: 0.60,
    emissive: new THREE.Color(accentColorHex).multiplyScalar(0.22), // Subtle planetary rim glow to never blend with road
  });
  const rock = new THREE.Mesh(rockGeom, rockMat);
  rock.castShadow = true;
  group.add(rock);

  // Embedded luminous crystalline core
  const veinGeom = new THREE.BoxGeometry(0.22, 0.48, 0.22);
  const veinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentColorHex),
    emissive: new THREE.Color(accentColorHex),
    emissiveIntensity: 1.4,
    roughness: 0.15,
  });
  const vein = new THREE.Mesh(veinGeom, veinMat);
  vein.rotation.set(0.4, 0.6, 0.2);
  group.add(vein);

  // Secondary glowing mineral shards jutting out
  const nodeGeom = new THREE.OctahedronGeometry(0.18, 0);
  const node = new THREE.Mesh(nodeGeom, veinMat);
  node.position.set(-0.24, 0.20, 0.22);
  node.rotation.set(0.3, 0.8, -0.4);
  group.add(node);

  const node2Geom = new THREE.OctahedronGeometry(0.14, 0);
  const node2 = new THREE.Mesh(node2Geom, veinMat);
  node2.position.set(0.22, -0.18, -0.20);
  node2.rotation.set(-0.5, 0.2, 0.7);
  group.add(node2);

  // Outer glowing halo aura (ensures meteor beacon is 100% visible from long range)
  const spriteMat = new THREE.SpriteMaterial({
    map: getEnergyGlowTexture(),
    color: new THREE.Color(accentColorHex),
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(1.25, 1.25, 1.25);
  group.add(sprite);

  return group;
}


/**
 * Obstacle: HIGH BARRIER ARCH
 * Clearance underneath is 1.2m!
 * Player MUST SLIDE to pass underneath! (Standing hits at y = 1.8m)
 */
export function createHighBarrierMesh(accentColor: string): THREE.Group {
  const group = new THREE.Group();

  // High-Tech Aerospace Titanium Alloy (eliminates pitch-black posts)
  const titaniumMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0, // Sleek silver-white metallic alloy
    metalness: 0.88,
    roughness: 0.2,
  });

  const neonStripeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentColor),
    emissive: new THREE.Color(accentColor),
    emissiveIntensity: 1.4,
    roughness: 0.1,
  });

  const baseRingMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentColor),
    emissive: new THREE.Color(accentColor),
    emissiveIntensity: 1.1,
    metalness: 0.5,
  });

  // Support posts on the sides
  const postGeom = new THREE.CylinderGeometry(0.12, 0.14, 3.2, 10);
  const neonStripeGeom = new THREE.CylinderGeometry(0.04, 0.04, 3.1, 8);
  const baseRingGeom = new THREE.CylinderGeometry(0.24, 0.26, 0.14, 12);

  // Left Post + Glow Strip + Base Collar
  const postL = new THREE.Mesh(postGeom, titaniumMat);
  postL.position.set(-1.15, 1.6, 0);
  postL.castShadow = true;
  group.add(postL);

  const stripeL = new THREE.Mesh(neonStripeGeom, neonStripeMat);
  stripeL.position.set(-1.15, 1.6, 0.10);
  group.add(stripeL);

  const baseCollarL = new THREE.Mesh(baseRingGeom, baseRingMat);
  baseCollarL.position.set(-1.15, 0.07, 0);
  group.add(baseCollarL);

  // Right Post + Glow Strip + Base Collar
  const postR = new THREE.Mesh(postGeom, titaniumMat);
  postR.position.set(1.15, 1.6, 0);
  postR.castShadow = true;
  group.add(postR);

  const stripeR = new THREE.Mesh(neonStripeGeom, neonStripeMat);
  stripeR.position.set(1.15, 1.6, 0.10);
  group.add(stripeR);

  const baseCollarR = new THREE.Mesh(baseRingGeom, baseRingMat);
  baseCollarR.position.set(1.15, 0.07, 0);
  group.add(baseCollarR);

  // High Arch Bar (bottom is at y = 1.45, player slides at y = 0.5)
  const barGeom = new THREE.BoxGeometry(2.4, 0.75, 0.38);
  const barMat = new THREE.MeshStandardMaterial({
    color: 0xef4444, // Red danger
    emissive: 0x991b1b,
    emissiveIntensity: 0.75,
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

  // High-Tech Titanium Pylon Housing (eliminates pitch-black base blocks)
  const pylonMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0, // Sleek silver titanium
    metalness: 0.88,
    roughness: 0.18,
  });

  const pylonCoreMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentColor),
    emissive: new THREE.Color(accentColor),
    emissiveIntensity: 1.3,
    roughness: 0.1,
  });

  const baseGeom = new THREE.BoxGeometry(0.34, 0.55, 0.36);
  const coreGeom = new THREE.BoxGeometry(0.14, 0.45, 0.38);
  const footRingGeom = new THREE.BoxGeometry(0.42, 0.08, 0.44);

  // Left Pylon Generator + Core + Glowing Foot
  const baseL = new THREE.Mesh(baseGeom, pylonMat);
  baseL.position.set(-1.05, 0.28, 0);
  baseL.castShadow = true;
  group.add(baseL);

  const coreL = new THREE.Mesh(coreGeom, pylonCoreMat);
  coreL.position.set(-1.05, 0.28, 0);
  group.add(coreL);

  const footL = new THREE.Mesh(footRingGeom, pylonCoreMat);
  footL.position.set(-1.05, 0.04, 0);
  group.add(footL);

  // Right Pylon Generator + Core + Glowing Foot
  const baseR = new THREE.Mesh(baseGeom, pylonMat);
  baseR.position.set(1.05, 0.28, 0);
  baseR.castShadow = true;
  group.add(baseR);

  const coreR = new THREE.Mesh(coreGeom, pylonCoreMat);
  coreR.position.set(1.05, 0.28, 0);
  group.add(coreR);

  const footR = new THREE.Mesh(footRingGeom, pylonCoreMat);
  footR.position.set(1.05, 0.04, 0);
  group.add(footR);

  // Low Plasma Beam (y = 0.45m)
  const beamGeom = new THREE.CylinderGeometry(0.11, 0.11, 2.1, 8);
  beamGeom.rotateZ(Math.PI / 2);
  const beamMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentColor),
    emissive: new THREE.Color(accentColor),
    emissiveIntensity: 1.25,
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
