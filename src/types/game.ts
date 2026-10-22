export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'WARPING';

export interface PlanetConfig {
  id: number;
  name: string;
  portugueseName: string;
  tagline: string;
  description: string;
  skyColor: string;
  fogColor: string;
  groundColor: string;
  accentColor: string;
  crystalColor: string;
  trackColor: string;
  gemPalettes: string[];
  meteorPalettes: string[];
  gravityFactor: number;
  hazardTypes: string[];
  hasRings?: boolean;
  ringColor?: string;
  planetScale?: number;
  atmosphereDensity?: number;
}

export type Lane = -1 | 0 | 1; // -1: Left, 0: Center, 1: Right

export interface Collectible {
  id: string;
  type: 'CRYSTAL' | 'MINERAL' | 'ENERGY_CORE';
  lane: Lane;
  z: number;
  y: number;
  points: number;
  collected: boolean;
}

export interface Obstacle {
  id: string;
  type: 'BARRIER_HIGH' | 'BARRIER_LOW' | 'BOULDER' | 'DRONE' | 'CRYSTAL_SPIRE';
  lane: Lane;
  z: number;
  width: number;
  height: number;
  requiresAction: 'JUMP' | 'SLIDE' | 'CHANGE_LANE';
  hit: boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  distance: number;
  collectibles: number;
  planetReached: string;
  planetIndex: number;
  maxSpeedKmh: number;
  date: string;
  isLocal?: boolean;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  sfxVolume: number;
  musicVolume: number;
  touchControlsVisible: boolean;
  graphicsQuality: 'high' | 'medium' | 'low';
}
