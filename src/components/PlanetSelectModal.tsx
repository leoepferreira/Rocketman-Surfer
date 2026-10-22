import React from 'react';
import { X, Play, ShieldAlert, Sparkles, Compass } from 'lucide-react';
import { SOLAR_PLANETS } from '../game/planets';
import { PlanetConfig } from '../types/game';

interface PlanetSelectModalProps {
  currentPlanetIndex: number;
  onSelectPlanet: (index: number) => void;
  onClose: () => void;
}

export const PlanetSelectModal: React.FC<PlanetSelectModalProps> = ({
  currentPlanetIndex,
  onSelectPlanet,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0a0f1d] border-2 border-sky-500/40 rounded-3xl p-5 md:p-6 shadow-2xl text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🪐</span>
              <h2 className="font-display font-black text-xl md:text-2xl tracking-tight uppercase">
                Expedição Solar: 8 Planetas
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Cada planeta possui atmosfera única, gravidade adaptada e perigos específicos.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Planet Grid */}
        <div className="flex-1 overflow-y-auto pr-1 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SOLAR_PLANETS.map((planet, idx) => {
            const isCurrent = idx === currentPlanetIndex;

            return (
              <div
                key={planet.id}
                className={`relative flex flex-col justify-between p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-sky-950/40 border-sky-400 ring-2 ring-sky-400/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {/* Header badge */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20 shadow-sm"
                      style={{ backgroundColor: planet.accentColor }}
                    />
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                      Planeta {planet.id}/8
                    </span>
                  </div>

                  <h3 className="font-display font-black text-lg text-white">
                    {planet.portugueseName}
                  </h3>
                  <div className="text-[11px] text-amber-300 font-semibold mb-2 line-clamp-1">
                    {planet.tagline}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-3 mb-3 leading-relaxed">
                    {planet.description}
                  </p>
                </div>

                {/* Badges / Hazards */}
                <div>
                  <div className="space-y-1 mb-3 pt-2 border-t border-slate-800/80 text-[10px]">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Compass className="w-3 h-3 text-cyan-400" /> Gravidade:
                      </span>
                      <span className="font-mono font-bold text-cyan-300">
                        {(planet.gravityFactor * 9.8).toFixed(1)} m/s² ({planet.gravityFactor}g)
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Sparkles className="w-3 h-3 text-amber-400" /> Cristal Nativo:
                      </span>
                      <span
                        className="font-bold flex items-center gap-1"
                        style={{ color: planet.crystalColor }}
                      >
                        ◆ Raro
                      </span>
                    </div>

                    <div className="flex items-start gap-1 text-slate-400 pt-1">
                      <ShieldAlert className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                      <span className="text-[10px] text-rose-300 line-clamp-1">
                        {planet.hazardTypes.join(', ')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectPlanet(idx);
                      onClose();
                    }}
                    className={`w-full py-2 px-3 rounded-xl font-display font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition ${
                      isCurrent
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-600/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {isCurrent ? 'Planeta Atual' : 'Surfar Aqui'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
          <span>
            💡 <strong className="text-white">Dica:</strong> A cada 1.000 coletas no modo infinito você salta automaticamente para o próximo planeta!
          </span>
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
