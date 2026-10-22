import React, { useState } from 'react';
import { X, Server, CheckCircle2, Copy, Check, ExternalLink, Zap, ShieldCheck } from 'lucide-react';

interface HostingGuideModalProps {
  onClose: () => void;
}

export const HostingGuideModal: React.FC<HostingGuideModalProps> = ({ onClose }) => {
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0a0f1d] border-2 border-emerald-500/40 rounded-3xl p-5 md:p-6 shadow-2xl text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl md:text-2xl tracking-tight uppercase text-white">
                Como Hospedar 100% Grátis
              </h2>
              <p className="text-xs text-emerald-300 font-semibold">
                Sem custos recorrentes, sem servidor e sem necessidade de cartão de crédito!
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
        <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-4 text-xs md:text-sm">
          {/* Highlight Box */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-1">Sim! O jogo roda 100% no navegador (Client-side)</strong>
              <p className="text-slate-300 text-xs leading-relaxed">
                O <strong>Rocketman Surfer</strong> foi projetado com Three.js e Web Audio sintetizado em código puro. Ele não depende de nenhum servidor de banco de dados ou backend pago. Todo o áudio, gráficos 3D e rankings funcionam localmente no seu dispositivo.
              </p>
            </div>
          </div>

          {/* Option 1: Vercel / Netlify */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Opção 1: Vercel (Recomendada - Mais Fácil e Rápida)
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                Grátis Vitalício
              </span>
            </div>
            <p className="text-slate-400 text-xs">
              Basta conectar seu repositório do GitHub no <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-sky-400 underline inline-flex items-center gap-0.5">vercel.com <ExternalLink className="w-2.5 h-2.5" /></a>. Ele faz a compilação automática a cada atualização com HTTPS e CDN ultra-rápida.
            </p>
          </div>

          {/* Option 2: Netlify Drag & Drop */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Opção 2: Netlify Drop (Arrastar Pasta - Sem Código)
              </span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
                15 Segundos
              </span>
            </div>
            <p className="text-slate-400 text-xs">
              1. No terminal do seu projeto, execute o comando de compilação:
            </p>
            <div className="flex items-center justify-between bg-black/60 rounded-xl px-3 py-2 border border-slate-700 font-mono text-xs">
              <code>npm run build</code>
              <button
                onClick={() => copyToClipboard('npm run build', 'build')}
                className="text-slate-400 hover:text-white"
              >
                {copiedStep === 'build' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-slate-400 text-xs">
              2. Acesse <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-sky-400 underline inline-flex items-center gap-0.5">app.netlify.com/drop <ExternalLink className="w-2.5 h-2.5" /></a> e arraste a pasta <code className="text-amber-300 font-mono">dist</code> gerada. O jogo já fica online com link público imediatamente!
            </p>
          </div>

          {/* Option 3: GitHub Pages */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-300 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400" /> Opção 3: GitHub Pages
              </span>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-mono">
                100% Integrado
              </span>
            </div>
            <p className="text-slate-400 text-xs">
              Vá nas configurações do seu repositório no GitHub &gt; <strong>Pages</strong> e selecione a branch com a compilação gerada. Gratuito para sempre sem nenhum limite prático para uso pessoal!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
          <span>Você pode jogar em qualquer TV, celular ou PC direto pelo navegador!</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold uppercase transition shadow-lg shadow-emerald-600/30"
          >
            Entendi!
          </button>
        </div>
      </div>
    </div>
  );
};
