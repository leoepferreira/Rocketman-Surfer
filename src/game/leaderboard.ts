import { LeaderboardEntry } from '../types/game';

const LOCAL_STORAGE_KEY = 'rocketman_surfer_local_records_v1';

// Initial simulated global aces for galactic competition
const INITIAL_GLOBAL_ACES: LeaderboardEntry[] = [
  {
    id: 'ace-1',
    name: 'Major Tom',
    score: 842500,
    distance: 14820,
    collectibles: 2450,
    planetReached: 'Netuno',
    planetIndex: 7,
    maxSpeedKmh: 322,
    date: '2026-10-18',
  },
  {
    id: 'ace-2',
    name: 'Valkyrie_Orbital',
    score: 685100,
    distance: 12150,
    collectibles: 1980,
    planetReached: 'Urano',
    planetIndex: 6,
    maxSpeedKmh: 278,
    date: '2026-10-19',
  },
  {
    id: 'ace-3',
    name: 'SolarWind_BR',
    score: 541200,
    distance: 10450,
    collectibles: 1620,
    planetReached: 'Saturno',
    planetIndex: 5,
    maxSpeedKmh: 245,
    date: '2026-10-20',
  },
  {
    id: 'ace-4',
    name: 'Astra_Nova',
    score: 412900,
    distance: 8200,
    collectibles: 1250,
    planetReached: 'Júpiter',
    planetIndex: 4,
    maxSpeedKmh: 210,
    date: '2026-10-21',
  },
  {
    id: 'ace-5',
    name: 'Martian_Surfer',
    score: 320400,
    distance: 6540,
    collectibles: 980,
    planetReached: 'Marte',
    planetIndex: 3,
    maxSpeedKmh: 185,
    date: '2026-10-17',
  },
  {
    id: 'ace-6',
    name: 'CosmicRider',
    score: 215600,
    distance: 4890,
    collectibles: 720,
    planetReached: 'Terra',
    planetIndex: 2,
    maxSpeedKmh: 160,
    date: '2026-10-16',
  },
  {
    id: 'ace-7',
    name: 'Mercury_Ghost',
    score: 142000,
    distance: 3120,
    collectibles: 480,
    planetReached: 'Vênus',
    planetIndex: 1,
    maxSpeedKmh: 138,
    date: '2026-10-15',
  },
];

export function getLocalLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalScore(entry: Omit<LeaderboardEntry, 'id' | 'date' | 'isLocal'>): LeaderboardEntry {
  const current = getLocalLeaderboard();
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: `rec-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    isLocal: true,
  };

  current.push(newEntry);
  current.sort((a, b) => b.score - a.score);

  // Keep top 25 local scores
  const trimmed = current.slice(0, 25);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore quota error
  }

  return newEntry;
}

export function getGlobalLeaderboard(): LeaderboardEntry[] {
  const locals = getLocalLeaderboard();
  const combined = [...INITIAL_GLOBAL_ACES];

  // Merge player's best entries into the global ranking view
  for (const local of locals) {
    combined.push(local);
  }

  // Sort descending by score
  combined.sort((a, b) => b.score - a.score);
  return combined.slice(0, 20);
}

export function clearLocalLeaderboard() {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // ignore
  }
}
