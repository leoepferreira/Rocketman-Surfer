import React from 'react';
import { X, Smartphone, Download, CheckCircle, ExternalLink, HelpCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0a0f1d] border-2 border-emerald-500/40 rounded-3xl p-5 md:p-6 shadow-2xl text-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg md:text-xl tracking-tight uppercase">
                Instalar no Celular
              </h2>
              <p className="text-xs text-slate-400">
                PWA • Tela Cheia sem Barra do Navegador
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs md:text-sm">
          {isInstalled ? (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-white block font-bold">Aplicativo Já Instalado!</strong>
                <span className="text-slate-300 text-xs">
                  Você já está executando o Rocketman Surfer no modo aplicativo em tela cheia.
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Direct 1-Click Install Button if supported */}
              {isInstallable && (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition transform active:scale-95"
                >
                  <Download className="w-4 h-4" /> Instalar Aplicativo Agora
                </button>
              )}

              {/* Step by step for Android Chrome */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="font-bold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-400" /> Como Instalar no Android (Chrome):
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 leading-relaxed">
                  <li>Toque nos <strong className="text-white">3 pontinhos (⋮)</strong> no canto superior do Chrome.</li>
                  <li>Selecione <strong className="text-amber-300">"Instalar aplicativo"</strong> ou <strong className="text-amber-300">"Adicionar à tela inicial"</strong>.</li>
                  <li>Pronto! Um ícone com o astronauta será criado no seu celular.</li>
                </ol>
                <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-emerald-300 font-semibold">
                  ✨ Ao abrir pelo ícone, a barra do Chrome desaparece e o jogo roda em 100% tela cheia, sem cortar a parte de baixo!
                </div>
              </div>

              {/* iOS Safari */}
              {isIOS && (
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="font-bold text-sky-300 text-xs uppercase tracking-wider">
                    Como Instalar no iPhone / iPad (Safari):
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 leading-relaxed">
                    <li>Toque no botão <strong className="text-white">Compartilhar</strong> (quadrado com seta).</li>
                    <li>Role para baixo e toque em <strong className="text-sky-300">"Adicionar à Tela de Início"</strong>.</li>
                  </ol>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-4 mt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs uppercase transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
