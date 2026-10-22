import React from 'react';
import { Play, RotateCcw, Home, ListOrdered, Volume2, VolumeX, X } from 'lucide-react';

interface PauseModalProps {
  score: number;
  collectibles: number;
  planetName: string;
  speedKmh: number;
  soundEnabled: boolean;
  onResume: () => void;
  onRestart: () => void;
  onOpenLeaderboard: () => void;
  onToggleSound: () => void;
  onHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  score,
  collectibles,
  planetName,
  speedKmh,
  soundEnabled,
  onResume,
  onRestart,
  onOpenLeaderboard,
  onToggleSound,
  onHome,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#0a0f1d] border-2 border-sky-500/40 rounded-3xl p-6 shadow-2xl text-white flex flex-col items-center">
        <h2 className="font-display font-black text-2xl uppercase tracking-wider text-amber-400 mb-1">
          Corrida Pausada
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Planeta: <span className="text-sky-300 font-bold">{planetName}</span>
        </p>

        {/* Mini stats */}
        <div className="w-full grid grid-cols-2 gap-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-3 mb-5 text-center text-xs">
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-mono">Pontos</div>
            <div className="font-display font-bold text-white text-base">{score.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-mono">Velocidade</div>
            <div className="font-display font-bold text-emerald-400 text-base">{speedKmh} km/h</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-display font-black text-sm uppercase flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition"
          >
            <Play className="w-4 h-4 fill-white" /> Continuar
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl font-semibold text-xs uppercase flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" /> Reiniciar Partida
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenLeaderboard}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl font-semibold text-xs uppercase flex items-center justify-center gap-1.5 transition"
            >
              <ListOrdered className="w-4 h-4 text-yellow-400" /> Rankings
            </button>

            <button
              onClick={onToggleSound}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl font-semibold text-xs uppercase flex items-center justify-center gap-1.5 transition"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-cyan-400" /> Áudio Ligado
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400" /> Silenciado
                </>
              )}
            </button>
          </div>

          <button
            onClick={onHome}
            className="w-full py-2.5 px-4 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl font-semibold text-xs uppercase flex items-center justify-center gap-2 transition mt-1"
          >
            <Home className="w-4 h-4" /> Menu Principal
          </button>
        </div>
      </div>
    </div>
  );
};
