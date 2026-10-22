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
    <div className="absolute bottom-4 inset-x-0 px-4 flex justify-between items-end pointer-events-none z-20 select-none pb-safe">
      {/* Left / Right directional pad */}
      <div className="flex gap-3 pointer-events-auto">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onLeft();
          }}
          className="w-16 h-16 rounded-2xl bg-slate-900/80 active:bg-cyan-600/70 border-2 border-cyan-500/40 active:border-cyan-400 active:scale-95 flex items-center justify-center text-cyan-300 shadow-xl transition-transform touch-none"
          aria-label="Mover para esquerda"
        >
          <ArrowLeft className="w-8 h-8" />
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onRight();
          }}
          className="w-16 h-16 rounded-2xl bg-slate-900/80 active:bg-cyan-600/70 border-2 border-cyan-500/40 active:border-cyan-400 active:scale-95 flex items-center justify-center text-cyan-300 shadow-xl transition-transform touch-none"
          aria-label="Mover para direita"
        >
          <ArrowRight className="w-8 h-8" />
        </button>
      </div>

      {/* Jump / Slide action pad */}
      <div className="flex flex-col gap-2.5 pointer-events-auto">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onJump();
          }}
          className="w-16 h-16 rounded-2xl bg-amber-950/70 active:bg-amber-500/80 border-2 border-amber-500/40 active:border-amber-300 active:scale-95 flex flex-col items-center justify-center text-amber-300 shadow-xl transition-transform touch-none"
          aria-label="Pular com Jetpack"
        >
          <ArrowUp className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Pular</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onSlide();
          }}
          className="w-16 h-16 rounded-2xl bg-indigo-950/70 active:bg-indigo-500/80 border-2 border-indigo-500/40 active:border-indigo-300 active:scale-95 flex flex-col items-center justify-center text-indigo-300 shadow-xl transition-transform touch-none"
          aria-label="Agachar ou Deslizar"
        >
          <ArrowDown className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Agachar</span>
        </button>
      </div>
    </div>
  );
};
