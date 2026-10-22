import React, { useState } from 'react';
import { Trophy, Globe, User, X, Trash2, Medal, Gem, Gauge } from 'lucide-react';
import { getGlobalLeaderboard, getLocalLeaderboard, clearLocalLeaderboard } from '../game/leaderboard';
import { LeaderboardEntry } from '../types/game';

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'global' | 'local'>('global');
  const [localScores, setLocalScores] = useState<LeaderboardEntry[]>(() => getLocalLeaderboard());
  const globalScores = getGlobalLeaderboard();

  const handleClearLocal = () => {
    if (window.confirm('Tem certeza que deseja apagar seus recordes locais?')) {
      clearLocalLeaderboard();
      setLocalScores([]);
    }
  };

  const list = tab === 'global' ? globalScores : localScores;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0a0f1d] border-2 border-sky-500/40 rounded-3xl p-5 md:p-6 shadow-2xl text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl md:text-2xl tracking-tight uppercase">
                Ranking Galáctico
              </h2>
              <p className="text-xs text-slate-400">
                Os maiores surfistas espaciais do Sistema Solar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-2 my-4">
          <button
            onClick={() => setTab('global')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-display font-bold text-xs uppercase flex items-center justify-center gap-2 transition ${
              tab === 'global'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" /> Global (Ases do Espaço)
          </button>

          <button
            onClick={() => setTab('local')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-display font-bold text-xs uppercase flex items-center justify-center gap-2 transition ${
              tab === 'local'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <User className="w-4 h-4" /> Meus Recordes Locais ({localScores.length})
          </button>
        </div>

        {/* Scores Table */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {list.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Nenhuma partida registrada ainda. Jogue uma rodada para marcar seu nome!
            </div>
          ) : (
            list.map((entry, idx) => {
              const isFirst = idx === 0;
              const isSecond = idx === 1;
              const isThird = idx === 2;

              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                    entry.isLocal
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : isFirst
                      ? 'bg-yellow-500/10 border-yellow-500/40'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  {/* Left: Position & Name */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-display font-black text-xs ${
                        isFirst
                          ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/50'
                          : isSecond
                          ? 'bg-slate-300 text-black'
                          : isThird
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          {entry.name}
                        </span>
                        {entry.isLocal && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full font-mono border border-amber-500/30">
                            VOCÊ
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="text-cyan-300 font-medium">
                          🪐 {entry.planetReached}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <Gem className="w-3 h-3 text-cyan-400" /> {entry.collectibles}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Gauge className="w-3 h-3" /> {entry.maxSpeedKmh} km/h
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Score */}
                  <div className="text-right">
                    <div className="font-display font-black text-base md:text-lg text-yellow-400">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {entry.distance >= 1000 ? `${(entry.distance / 1000).toFixed(1)} km` : `${entry.distance} m`}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800 text-xs text-slate-400">
          <div>
            {tab === 'local' && localScores.length > 0 && (
              <button
                onClick={handleClearLocal}
                className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Limpar Meus Recordes
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold uppercase transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
