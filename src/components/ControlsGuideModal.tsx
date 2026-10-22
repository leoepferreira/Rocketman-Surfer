import React from 'react';
import { X, Keyboard, Gamepad2, Smartphone, Tv } from 'lucide-react';

interface ControlsGuideModalProps {
  onClose: () => void;
}

export const ControlsGuideModal: React.FC<ControlsGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0a0f1d] border-2 border-sky-500/40 rounded-3xl p-5 md:p-6 shadow-2xl text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl md:text-2xl tracking-tight uppercase">
                Guia de Controles Multiplataforma
              </h2>
              <p className="text-xs text-slate-400">
                Suporte nativo a PC, Controles Remotos de TV, Gamepads e Telas Touch
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-4">
          {/* PC / Teclado */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-sky-300 text-sm mb-3">
              <Keyboard className="w-4 h-4 text-sky-400" /> Computador / Teclado
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-slate-800">
                <span className="text-slate-300">Mover para os lados:</span>
                <span className="font-mono text-cyan-300 font-bold">← → ou A / D</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-slate-800">
                <span className="text-slate-300">Pulo com Jetpack:</span>
                <span className="font-mono text-amber-300 font-bold">↑, W ou Espaço</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-slate-800">
                <span className="text-slate-300">Agachar / Deslizar:</span>
                <span className="font-mono text-indigo-300 font-bold">↓ ou S</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-slate-800">
                <span className="text-slate-300">Pausar / Retomar:</span>
                <span className="font-mono text-slate-300 font-bold">P ou Esc</span>
              </div>
            </div>
          </div>

          {/* TV & Joystick / Gamepad */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-sm mb-3">
              <Tv className="w-4 h-4 text-amber-400" /> Smart TV, Android TV e Controles USB / Bluetooth
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-slate-800">
                <span className="text-slate-300">Direção:</span>
                <span className="font-mono text-amber-300 font-bold">D-Pad / Analógico Esquerdo</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-slate-800">
                <span className="text-slate-300">Pulo (Jetpack):</span>
                <span className="font-mono text-amber-300 font-bold">Botão A / Cima / Enter</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-slate-800">
                <span className="text-slate-300">Agachar:</span>
                <span className="font-mono text-amber-300 font-bold">Botão B / Baixo / Voltar</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-slate-800">
                <span className="text-slate-300">Controle Remoto TV:</span>
                <span className="font-mono text-amber-300 font-bold">Setas + Botão OK</span>
              </div>
            </div>
          </div>

          {/* Mobile / Tablet */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm mb-3">
              <Smartphone className="w-4 h-4 text-emerald-400" /> Celular e Tablet (Touch)
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <p>
                • <strong>Gestos na Tela (Swipe):</strong> Deslize o dedo para qualquer direção (Esquerda/Direita para trocar de trilha, Cima para pular com o jetpack, Baixo para agachar e deslizar).
              </p>
              <p>
                • <strong>Botões Virtuais:</strong> Você também pode usar os botões touch nos cantos da tela para precisão máxima.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold uppercase transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
