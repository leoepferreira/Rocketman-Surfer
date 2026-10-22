import React, { useState } from 'react';
import { Play, Menu, X, Compass, Trophy, Gamepad2, Server, Volume2, VolumeX, Smartphone, Download } from 'lucide-react';
import { PlanetConfig } from '../types/game';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface StartScreenProps {
  currentPlanet: PlanetConfig;
  soundEnabled: boolean;
  onStart: () => void;
  onOpenPlanetSelect: () => void;
  onOpenLeaderboard: () => void;
  onOpenControlsGuide: () => void;
  onOpenHostingGuide: () => void;
  onOpenPWAInstall: () => void;
  onToggleSound: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  currentPlanet,
  soundEnabled,
  onStart,
  onOpenPlanetSelect,
  onOpenLeaderboard,
  onOpenControlsGuide,
  onOpenHostingGuide,
  onOpenPWAInstall,
  onToggleSound,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isInstallable, isInstalled } = usePWAInstall();

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 md:p-8 select-none pointer-events-auto h-full h-[100dvh]">
      {/* Top Header: Clean & Minimal */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 border border-slate-700/60 backdrop-blur-md text-xs">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: currentPlanet.accentColor }}
          />
          <span className="font-mono text-slate-300 uppercase tracking-wider text-[11px]">
            {currentPlanet.portugueseName} ({currentPlanet.id}/8)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Install Pill if supported and not installed */}
          {isInstallable && !isInstalled && (
            <button
              onClick={onOpenPWAInstall}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 transition text-[11px] font-bold"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instalar App</span>
            </button>
          )}

          {/* ☰ Hamburger Menu Button */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 text-slate-200 hover:text-white transition shadow-lg backdrop-blur-md text-xs font-semibold"
            aria-label="Abrir Menu de Opções"
          >
            <Menu className="w-4 h-4 text-cyan-400" />
            <span>Menu</span>
          </button>
        </div>
      </div>

      {/* Center: Super Clean Title & JOGAR Button */}
      <div className="flex flex-col items-center justify-center text-center my-auto">
        <h1 className="font-display font-black text-5xl sm:text-7xl tracking-tight text-white drop-shadow-[0_4px_24px_rgba(56,189,248,0.7)] uppercase">
          Rocketman
          <span className="block text-amber-400 text-3xl sm:text-5xl mt-1 tracking-wider">
            Surfer
          </span>
        </h1>

        {/* Big Start Button */}
        <button
          onClick={onStart}
          className="group relative mt-6 md:mt-8 px-10 py-5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-white rounded-3xl font-display font-black text-2xl tracking-widest uppercase flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(245,158,11,0.6)] transition-all transform hover:scale-105 active:scale-95"
        >
          <Play className="w-7 h-7 fill-white group-hover:translate-x-0.5 transition-transform" />
          <span>JOGAR</span>
        </button>
      </div>

      {/* Bottom Minimal Hint */}
      <div className="text-center text-[11px] text-slate-400 font-mono pb-2">
        Pressione <span className="text-amber-400 font-bold">JOGAR</span> para iniciar a corrida no Sistema Solar
      </div>

      {/* Clean Drawer / Modal Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#0a0f1d] border-2 border-sky-500/40 rounded-3xl p-6 shadow-2xl text-white flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="font-display font-bold text-base uppercase tracking-wider text-slate-200">
                Menu do Jogo
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Options List */}
            <div className="space-y-2 overflow-y-auto pr-1">
              {/* PWA Android Install Button */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenPWAInstall();
                }}
                className="w-full p-3 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 flex items-center gap-3 text-left transition"
              >
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    Instalar no Android (App)
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                      Tela Cheia
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300">Remove a barra do navegador</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenControlsGuide();
                }}
                className="w-full p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 flex items-center gap-3 text-left transition"
              >
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Tutorial &amp; Controles</div>
                  <div className="text-[11px] text-slate-400">Teclado, Controle TV, Joystick e Mobile</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenPlanetSelect();
                }}
                className="w-full p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 flex items-center gap-3 text-left transition"
              >
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">8 Planetas do Sistema Solar</div>
                  <div className="text-[11px] text-slate-400">Escolha o planeta para começar</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenLeaderboard();
                }}
                className="w-full p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-yellow-500/40 flex items-center gap-3 text-left transition"
              >
                <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Rankings &amp; Recordes</div>
                  <div className="text-[11px] text-slate-400">Recordes locais e globais</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenHostingGuide();
                }}
                className="w-full p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 flex items-center gap-3 text-left transition"
              >
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Hospedagem 100% Grátis</div>
                  <div className="text-[11px] text-slate-400">Como colocar online sem custos de servidor</div>
                </div>
              </button>

              <button
                onClick={onToggleSound}
                className="w-full p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 flex items-center justify-between transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                    {soundEnabled ? <Volume2 className="w-5 h-5 text-cyan-400" /> : <VolumeX className="w-5 h-5 text-rose-400" />}
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Efeitos &amp; Música
                  </span>
                </div>
                <span className={`text-xs font-mono font-bold ${soundEnabled ? 'text-cyan-400' : 'text-rose-400'}`}>
                  {soundEnabled ? 'LIGADO' : 'MUDO'}
                </span>
              </button>
            </div>

            <button
              onClick={() => setMenuOpen(false)}
              className="mt-4 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs uppercase transition"
            >
              Fechar Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
