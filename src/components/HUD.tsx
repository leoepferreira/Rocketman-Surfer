import React from 'react';
import { PlanetConfig } from '../types/game';
import { Pause, Play, Zap, Gem, Compass, Gauge, Volume2, VolumeX } from 'lucide-react';

interface HUDProps {
  score: number;
  distance: number;
  collectibles: number;
  speedMultiplier: number;
  speedKmh: number;
  currentPlanet: PlanetConfig;
  isPaused: boolean;
  isWarping: boolean;
  soundEnabled: boolean;
  onTogglePause: () => void;
  onToggleSound: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  distance,
  collectibles,
  speedMultiplier,
  speedKmh,
  currentPlanet,
  isPaused,
  isWarping,
  soundEnabled,
  onTogglePause,
  onToggleSound,
}) => {
  // Progress towards next planet (every 1,000 items)
  const currentChunk = collectibles % 1000;
  const progressPercent = Math.min(100, (currentChunk / 1000) * 100);
  const speedBonusPercent = ((speedMultiplier - 1.0) * 100).toFixed(1);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 md:p-6 select-none overflow-hidden">
      {/* Top Telemetry Bar */}
      <div className="flex items-start justify-between gap-3 pointer-events-auto">
        {/* Left: Score & Distance */}
        <div className="flex flex-col gap-1.5 bg-[#0b0f19]/85 border border-sky-500/30 backdrop-blur-md rounded-xl p-3 shadow-lg shadow-black/50 min-w-[150px] md:min-w-[190px]">
          <div className="flex items-center justify-between text-xs text-sky-300 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" /> Placar
            </span>
            <span className="text-slate-400 font-mono text-[10px]">PTS</span>
          </div>
          <div className="font-display font-black text-2xl md:text-3xl tracking-tight text-white drop-shadow-[0_2px_8px_rgba(56,189,248,0.4)]">
            {score.toLocaleString()}
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-700/50 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-sky-400" /> Distância
            </span>
            <span className="font-mono font-bold text-sky-200">
              {distance >= 1000 ? `${(distance / 1000).toFixed(2)} km` : `${distance} m`}
            </span>
          </div>
        </div>

        {/* Center: Current Planet Badge & 1,000 Collectibles Progression */}
        <div className="flex flex-col items-center bg-[#0b0f19]/85 border border-amber-500/30 backdrop-blur-md rounded-xl px-4 py-2.5 shadow-lg shadow-black/50 max-w-[280px] md:max-w-[360px] w-full text-center">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full ring-2 ring-white/30"
              style={{ backgroundColor: currentPlanet.accentColor }}
            />
            <span className="font-display font-bold text-xs md:text-sm text-amber-300 uppercase tracking-widest">
              {currentPlanet.portugueseName}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({currentPlanet.id}/8)
            </span>
          </div>

          {/* Progress bar towards next planet */}
          <div className="w-full mt-2">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-300 mb-1">
              <span className="flex items-center gap-1 text-emerald-400">
                <Gem className="w-3 h-3 text-cyan-400" /> {currentChunk}/1.000 Coletas
              </span>
              <span className="text-yellow-400 font-semibold">
                Próximo Planeta
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-amber-400 to-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Speedometer & Controls */}
        <div className="flex items-center gap-2">
          {/* Speedometer Gauge */}
          <div className="hidden sm:flex flex-col items-end bg-[#0b0f19]/85 border border-emerald-500/30 backdrop-blur-md rounded-xl p-3 shadow-lg shadow-black/50 min-w-[130px]">
            <div className="flex items-center gap-1 text-xs text-emerald-300 font-semibold uppercase tracking-wider">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" /> Velocidade
            </div>
            <div className="font-display font-bold text-xl md:text-2xl text-emerald-200">
              {speedKmh} <span className="text-xs text-slate-400">km/h</span>
            </div>
            <div className="text-[10px] font-mono text-cyan-300">
              +{speedBonusPercent}% (+0.1%/item)
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onToggleSound}
              className="p-2.5 rounded-xl bg-[#0b0f19]/85 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition shadow-md"
              title={soundEnabled ? 'Silenciar Áudio' : 'Ativar Áudio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            </button>
            <button
              onClick={onTogglePause}
              className="p-2.5 rounded-xl bg-[#0b0f19]/85 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition shadow-md"
              title={isPaused ? 'Continuar' : 'Pausar'}
            >
              {isPaused ? <Play className="w-4 h-4 text-amber-400 fill-amber-400" /> : <Pause className="w-4 h-4 text-slate-200" />}
            </button>
          </div>
        </div>
      </div>

      {/* Warp Transition Banner Alert */}
      {isWarping && (
        <div className="self-center my-auto animate-bounce pointer-events-none">
          <div className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl border-2 border-white/80 shadow-[0_0_40px_rgba(99,102,241,0.8)] backdrop-blur-md text-center">
            <div className="font-display font-black text-xl md:text-2xl tracking-widest uppercase">
              🚀 SALTO HIPERESPACIAL!
            </div>
            <div className="text-xs md:text-sm text-cyan-100 font-semibold">
              Entrando na órbita de {currentPlanet.portugueseName}!
            </div>
          </div>
        </div>
      )}

      {/* Mobile Speedometer minimal pill */}
      <div className="sm:hidden self-center mb-2 bg-[#0b0f19]/80 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-mono text-emerald-300">
        ⚡ {speedKmh} km/h (+{speedBonusPercent}%)
      </div>
    </div>
  );
};
