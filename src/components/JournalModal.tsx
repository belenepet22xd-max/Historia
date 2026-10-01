import React from 'react';
import { X, BookOpen, FileDown, CheckCircle2, History } from 'lucide-react';
import { StoryChapter, GenreType } from '../types';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  genre: GenreType;
  history: StoryChapter[];
  currentChapter: StoryChapter | null;
  onExport: () => void;
}

export const JournalModal: React.FC<JournalModalProps> = ({
  isOpen,
  onClose,
  genre,
  history,
  currentChapter,
  onExport,
}) => {
  if (!isOpen) return null;

  const allChapters = [...history];
  if (currentChapter && !allChapters.find(c => c.id === currentChapter.id)) {
    allChapters.push(currentChapter);
  }

  const totalWords = allChapters.reduce((acc, c) => acc + c.wordCount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-3xl max-h-[85vh] rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl flex flex-col overflow-hidden text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-['Cinzel',serif]">
                Bitácora de la Aventura
              </h3>
              <p className="text-xs text-neutral-400">
                Género: {genre} • {allChapters.length} Capítulos • {totalWords} palabras acumuladas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExport}
              title="Descargar crónica completa"
              className="px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 flex items-center gap-1.5 transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chapters Timeline List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {allChapters.map((chap, idx) => {
            const isCurrent = currentChapter?.id === chap.id;

            return (
              <div 
                key={chap.id || idx}
                className="relative pl-6 pb-6 border-l-2 border-neutral-800 last:border-l-0 last:pb-0"
              >
                {/* Timeline node icon */}
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${
                  isCurrent 
                    ? 'border-amber-400 bg-amber-950' 
                    : 'border-neutral-600 bg-neutral-900'
                }`} />

                <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-amber-400">
                      {chap.title || `Capítulo ${chap.chapterNumber}`}
                    </span>
                    <span className="text-neutral-500 font-mono">
                      {chap.wordCount} palabras
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-serif">
                    {chap.narrative}
                  </p>

                  {chap.chosenOption && (
                    <div className="pt-2 border-t border-neutral-850 flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-neutral-500 font-mono">Decisión tomada: </span>
                        <span className="text-neutral-200 font-medium italic">
                          "{chap.chosenOption}"
                        </span>
                      </div>
                    </div>
                  )}

                  {chap.customAction && (
                    <div className="pt-2 border-t border-neutral-850 flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-neutral-500 font-mono">Acción libre: </span>
                        <span className="text-neutral-200 font-medium italic">
                          "{chap.customAction}"
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
