import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FileText } from 'lucide-react';
import { StoryChapter } from '../types';

interface RawFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: StoryChapter | null;
}

export const RawFormatModal: React.FC<RawFormatModalProps> = ({
  isOpen,
  onClose,
  chapter,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !chapter) return null;

  // Format strictly as requested
  const optionsBlock = chapter.options
    .map((opt, i) => {
      let clean = opt.trim();
      if (!clean.startsWith('Opción') && !clean.startsWith('[Opción')) {
        clean = `Opción ${i + 1}: ${clean}`;
      }
      clean = clean.replace(/^\[|\]$/g, '').trim();
      return `[${clean}]`;
    })
    .join('\n');

  const formattedOutput = chapter.rawOutput || `${chapter.narrative}\n\n---\n**¿Qué deseas hacer a continuación?**\n${optionsBlock}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl max-h-[85vh] rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl flex flex-col overflow-hidden text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold font-mono">
                Salida Estricta del Turno
              </h3>
              <p className="text-xs text-neutral-400">
                Formato Canónico: Narrativa (150-250 palabras) + Delimitador + 3 Opciones Ficticias
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar texto'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Text Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-950 font-mono text-xs sm:text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap select-all border-b border-neutral-800">
          {formattedOutput}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-neutral-950/40 text-[11px] font-mono text-neutral-500 flex items-center justify-between">
          <span>Palabras contadas en narrativa: {chapter.wordCount}</span>
          <span>Rango exigido: 150 - 250 palabras</span>
        </div>
      </div>
    </div>
  );
};
