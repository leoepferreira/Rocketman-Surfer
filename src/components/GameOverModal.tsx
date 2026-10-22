import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, ListOrdered, Globe, Zap, Gauge, Gem, Compass } from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveLocalScore } from '../game/leaderboard';

interface GameOverModalProps {
  stats: {
    score: number;
    distance: number;
    collectibles: number;
    planetReached: string;
    planetIndex: number;
    maxSpeedKmh: number;
  };
  onRestart: () => void;
  onOpenLeaderboard: () => void;
  onOpenPlanetSelect: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRestart,
  onOpenLeaderboard,
  onOpenPlanetSelect,
}) => {
  const [pilotName, setPilotName] = useState(() => {
    return localStorage.getItem('rocketman_pilot_name') || 'Piloto';
  });
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    // Launch festive space confetti
    try {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#f59e0b', '#a855f7', '#10b981'],
      });
    } catch {
      // ignore
    }
  }, []);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hasSaved) {
      const cleanName = pilotName.trim() || 'Astronauta';
      localStorage.setItem('rocketman_pilot_name', cleanName);
      saveLocalScore({
        name: cleanName,
        score: stats.score,
        distance: stats.distance,
        collectibles: stats.collectibles,
        planetReached: stats.planetReached,
        planetIndex: stats.planetIndex,
        maxSpeedKmh: stats.maxSpeedKmh,
      });
      setHasSaved(true);
    }
  };

  const handleRestartWithSave = () => {
    if (!hasSaved) handleSave();
    onRestart();
  };

  const handleLeaderboardWithSave = () => {
    if (!hasSaved) handleSave();
    onOpenLeaderboard();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-[#0a0f1d] border-2 border-sky-500/40 rounded-3xl p-6 shadow-2xl shadow-sky-900/40 text-white">
        {/* Glow corner accents */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-2">
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="font-display font-black text-2xl md:text-3xl tracking-tight text-white uppercase">
            Missão Finalizada
          </h2>
          <p className="text-xs text-slate-400">
            Você surfou até <span className="text-amber-400 font-bold">{stats.planetReached}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-col">
            <span className="flex items-center gap-1.5 text-xs text-sky-400 font-medium">
              <Zap className="w-3.5 h-3.5 text-yellow-400" /> Pontos
            </span>
            <span className="font-display font-black text-xl text-white mt-1">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-col">
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <Compass className="w-3.5 h-3.5 text-emerald-400" /> Distância
            </span>
            <span className="font-display font-black text-xl text-white mt-1">
              {stats.distance >= 1000 ? `${(stats.distance / 1000).toFixed(2)} km` : `${stats.distance} m`}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-col">
            <span className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
              <Gem className="w-3.5 h-3.5 text-cyan-400" /> Coletas (+0.1%)
            </span>
            <span className="font-display font-bold text-lg text-white mt-1">
              {stats.collectibles} <span className="text-xs text-slate-400">itens</span>
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-col">
            <span className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" /> Vel. Máxima
            </span>
            <span className="font-display font-bold text-lg text-white mt-1">
              {stats.maxSpeedKmh} <span className="text-xs text-slate-400">km/h</span>
            </span>
          </div>
        </div>

        {/* Pilot Name for Local Ranking */}
        <form onSubmit={handleSave} className="mb-5">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Seu Nome / Identificação do Piloto
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={18}
              value={pilotName}
              onChange={(e) => {
                setPilotName(e.target.value);
                setHasSaved(false);
              }}
              placeholder="Digite seu nome ou tag..."
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-sky-400 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={hasSaved}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase transition ${
                hasSaved
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                  : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30'
              }`}
            >
              {hasSaved ? 'Salvo!' : 'Salvar'}
            </button>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleRestartWithSave}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/40 transition active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" /> Jogar Novamente
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleLeaderboardWithSave}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition"
            >
              <ListOrdered className="w-4 h-4 text-amber-400" /> Rankings
            </button>

            <button
              onClick={onOpenPlanetSelect}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition"
            >
              <Globe className="w-4 h-4 text-cyan-400" /> Ver Planetas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
