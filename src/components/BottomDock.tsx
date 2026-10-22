import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Trophy,
  Compass,
  Gamepad2,
  Server,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface BottomDockProps {
  currentPlanetName: string;
  soundEnabled: boolean;
  isPlaying: boolean;
  onOpenPlanetSelect: () => void;
  onOpenLeaderboard: () => void;
  onOpenControlsGuide: () => void;
  onOpenHostingGuide: () => void;
  onToggleSound: () => void;
  onRestart: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  currentPlanetName,
  soundEnabled,
  isPlaying,
  onOpenPlanetSelect,
  onOpenLeaderboard,
  onOpenControlsGuide,
  onOpenHostingGuide,
  onToggleSound,
  onRestart,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center select-none pointer-events-auto max-w-[94vw]">
      {/* Collapse / Expand Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="px-3.5 py-1 mb-1 rounded-full bg-[#0b0f19]/90 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-mono text-slate-300 hover:text-white transition flex items-center gap-1.5 shadow-lg backdrop-blur-md"
        aria-label={collapsed ? 'Mostrar Painel Inferior' : 'Ocultar Painel Inferior'}
      >
        {collapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Menu &amp; Opções</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Ocultar Dock</span>
          </>
        )}
      </button>

      {/* Main Dock Container */}
      {!collapsed && (
        <div className="flex items-center gap-1.5 md:gap-2 p-1.5 md:p-2 rounded-2xl bg-[#090d18]/92 border border-sky-500/30 shadow-2xl shadow-black/80 backdrop-blur-lg overflow-x-auto max-w-full">
          {/* Planet Switcher Button */}
          <button
            onClick={onOpenPlanetSelect}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/70 text-xs text-slate-200 hover:text-white transition whitespace-nowrap"
            title="Escolher entre os 8 planetas do Sistema Solar"
          >
            <Compass className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold hidden sm:inline">Planetas:</span>
            <span className="font-mono text-amber-300 font-bold">{currentPlanetName}</span>
          </button>

          {/* Rankings Button */}
          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/70 text-xs text-slate-200 hover:text-white transition whitespace-nowrap"
            title="Ver Rankings Globais e Locais"
          >
            <Trophy className="w-4 h-4 text-yellow-400 shrink-0" />
            <span className="font-semibold">Rankings</span>
          </button>

          {/* Controls Guide Button */}
          <button
            onClick={onOpenControlsGuide}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/70 text-xs text-slate-200 hover:text-white transition whitespace-nowrap"
            title="Guia de controles para PC, TV e Celular"
          >
            <Gamepad2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-semibold hidden md:inline">Controles</span>
          </button>

          {/* Free Hosting Guide Button */}
          <button
            onClick={onOpenHostingGuide}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-xs text-emerald-300 hover:text-emerald-200 transition whitespace-nowrap"
            title="Como hospedar esse jogo 100% grátis"
          >
            <Server className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">Hospedar Grátis</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white transition"
            title={soundEnabled ? 'Silenciar Áudio' : 'Ativar Áudio'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
          </button>

          {/* Restart Button if in game */}
          {isPlaying && (
            <button
              onClick={onRestart}
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white transition"
              title="Reiniciar Corrida"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
