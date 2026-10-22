import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

interface MobileControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onJump: () => void;
  onSlide: () => void;
  visible: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onLeft,
  onRight,
  onJump,
  onSlide,
  visible,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-2 inset-x-0 px-3 flex justify-between items-end pointer-events-none z-20 select-none pb-[env(safe-area-inset-bottom,6px)]">
      {/* Left / Right directional pad */}
      <div className="flex gap-2 pointer-events-auto">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onLeft();
          }}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/85 active:bg-cyan-600/75 border-2 border-cyan-500/50 active:border-cyan-300 active:scale-95 flex items-center justify-center text-cyan-300 shadow-xl transition-transform touch-none"
          aria-label="Mover para esquerda"
        >
          <ArrowLeft className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onRight();
          }}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/85 active:bg-cyan-600/75 border-2 border-cyan-500/50 active:border-cyan-300 active:scale-95 flex items-center justify-center text-cyan-300 shadow-xl transition-transform touch-none"
          aria-label="Mover para direita"
        >
          <ArrowRight className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>
      </div>

      {/* Jump / Slide action pad */}
      <div className="flex flex-col gap-2 pointer-events-auto">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onJump();
          }}
          className="w-14 h-13 sm:w-16 sm:h-15 rounded-2xl bg-amber-950/75 active:bg-amber-500/85 border-2 border-amber-500/50 active:border-amber-300 active:scale-95 flex flex-col items-center justify-center text-amber-300 shadow-xl transition-transform touch-none"
          aria-label="Pular com Jetpack"
        >
          <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Pular</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onSlide();
          }}
          className="w-14 h-13 sm:w-16 sm:h-15 rounded-2xl bg-indigo-950/75 active:bg-indigo-500/85 border-2 border-indigo-500/50 active:border-indigo-300 active:scale-95 flex flex-col items-center justify-center text-indigo-300 shadow-xl transition-transform touch-none"
          aria-label="Agachar ou Deslizar"
        >
          <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Agachar</span>
        </button>
      </div>
    </div>
  );
};
