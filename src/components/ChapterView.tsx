import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  CornerDownRight, 
  BookOpen, 
  Loader2,
  ChevronRight,
  Flame,
  Search,
  ShieldAlert,
  Compass
} from 'lucide-react';
import { StoryChapter, GenreType } from '../types';
import { GENRES } from '../data/genres';
import { narrator } from '../services/tts';

interface ChapterViewProps {
  chapter: StoryChapter;
  genre: GenreType;
  isLoading: boolean;
  onSelectOption: (optionText: string) => void;
  onCustomAction: (actionText: string) => void;
  onRewind?: () => void;
  canRewind?: boolean;
  fontSize: 'sm' | 'md' | 'lg';
  fontFamily: 'serif' | 'sans' | 'mono';
}

export const ChapterView: React.FC<ChapterViewProps> = ({
  chapter,
  genre,
  isLoading,
  onSelectOption,
  onCustomAction,
  onRewind,
  canRewind,
  fontSize,
  fontFamily,
}) => {
  const [customActionText, setCustomActionText] = useState('');
  const [isNarrating, setIsNarrating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedOptIndex, setSelectedOptIndex] = useState<number | null>(null);

  // Hook up TTS status
  useEffect(() => {
    narrator.setListener((speaking) => {
      setIsNarrating(speaking);
    });
    return () => {
      narrator.stop();
    };
  }, []);

  // Keyboard shortcut listener (1, 2, 3)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return;
      // Do not trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === '1' && chapter.options[0]) {
        handleOptionClick(chapter.options[0], 0);
      } else if (e.key === '2' && chapter.options[1]) {
        handleOptionClick(chapter.options[1], 1);
      } else if (e.key === '3' && chapter.options[2]) {
        handleOptionClick(chapter.options[2], 2);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chapter, isLoading]);

  const handleOptionClick = (option: string, idx: number) => {
    if (isLoading) return;
    narrator.stop();
    setSelectedOptIndex(idx);
    onSelectOption(option);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customActionText.trim() || isLoading) return;
    narrator.stop();
    onCustomAction(customActionText.trim());
    setCustomActionText('');
  };

  const toggleNarration = () => {
    if (isNarrating) {
      narrator.stop();
    } else {
      narrator.speak(chapter.narrative);
    }
  };

  const copyChapterText = () => {
    const fullText = `${chapter.narrative}\n\n---\n**¿Qué deseas hacer a continuación?**\n` +
      chapter.options.map(opt => `[${opt.startsWith('Opción') ? opt : `Opción: ${opt}`}]`).join('\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFontClass = () => {
    switch (fontFamily) {
      case 'mono':
        return 'font-mono';
      case 'sans':
        return 'font-sans';
      case 'serif':
      default:
        return 'font-serif';
    }
  };

  const getTextSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-sm sm:text-base leading-relaxed';
      case 'lg':
        return 'text-lg sm:text-xl leading-loose';
      case 'md':
      default:
        return 'text-base sm:text-lg leading-relaxed';
    }
  };

  const genreConfig = GENRES[genre];

  const getGenreAccentColor = () => {
    switch (genre) {
      case 'Policial':
        return 'border-sky-500/30 text-sky-400 bg-sky-950/30';
      case 'Ciencia Ficción':
        return 'border-purple-500/30 text-purple-400 bg-purple-950/30';
      case 'Fantasía':
        return 'border-emerald-500/30 text-emerald-400 bg-emerald-950/30';
      case 'Misterio':
      default:
        return 'border-amber-500/30 text-amber-400 bg-amber-950/30';
    }
  };

  const getOptionBorderGlow = (idx: number) => {
    switch (genre) {
      case 'Policial':
        return 'hover:border-sky-500/80 hover:bg-sky-950/40 hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]';
      case 'Ciencia Ficción':
        return 'hover:border-purple-500/80 hover:bg-purple-950/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]';
      case 'Fantasía':
        return 'hover:border-emerald-500/80 hover:bg-emerald-950/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]';
      case 'Misterio':
      default:
        return 'hover:border-amber-500/80 hover:bg-amber-950/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-10 px-4 space-y-8 animate-fade-in">
      {/* Chapter Card Container */}
      <article className="relative rounded-2xl border border-neutral-800 bg-neutral-900/90 shadow-2xl backdrop-blur-md overflow-hidden">
        {/* Subtle accent border line at the top */}
        <div 
          className="h-1 w-full" 
          style={{ backgroundColor: genreConfig?.themeColor.primary || '#d97706' }} 
        />

        {/* Chapter Header Bar */}
        <div className="px-6 py-4 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 bg-neutral-950/40">
          <div className="flex items-center gap-2.5">
            <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${getGenreAccentColor()}`}>
              {chapter.title || `Capítulo ${chapter.chapterNumber}`}
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              {chapter.wordCount} palabras
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Read-Aloud */}
            <button
              onClick={toggleNarration}
              title={isNarrating ? 'Detener narración por voz' : 'Escuchar escena con voz en español'}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                isNarrating
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-neutral-800/80 text-neutral-300 border-neutral-700/70 hover:bg-neutral-750 hover:text-white'
              }`}
            >
              {isNarrating ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isNarrating ? 'Detener voz' : 'Escuchar'}</span>
            </button>

            {/* Copy button */}
            <button
              onClick={copyChapterText}
              title="Copiar texto del turno completo"
              className="p-1.5 rounded-lg text-xs border border-neutral-700/70 bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Rewind previous decision if available */}
            {canRewind && onRewind && (
              <button
                onClick={onRewind}
                title="Deshacer última decisión y elegir otra opción"
                disabled={isLoading}
                className="px-2.5 py-1.5 rounded-lg text-xs border border-neutral-700/70 bg-neutral-800/80 text-neutral-400 hover:text-amber-300 hover:border-amber-500/40 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reintentar</span>
              </button>
            )}
          </div>
        </div>

        {/* Narrative Text Content (150 - 250 palabras) */}
        <div className="p-6 sm:p-10 space-y-6">
          <div className={`${getFontClass()} ${getTextSizeClass()} text-neutral-200 tracking-wide select-text`}>
            {/* Format narrative with gentle paragraph break if any */}
            {chapter.narrative.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4 leading-relaxed first-letter:text-2xl first-letter:font-bold first-letter:text-amber-400 first-letter:mr-0.5">
                {paragraph.trim()}
              </p>
            ))}
          </div>

          {/* Turn Delimiter as strictly defined in format: "---" */}
          <div className="pt-4 pb-2 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-neutral-700" />
            <div className="text-xs font-mono text-neutral-500 uppercase tracking-widest px-2 py-0.5 rounded border border-neutral-800 bg-neutral-950">
              Encrucijada del Destino
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-neutral-700 to-neutral-700" />
          </div>

          {/* Interaction Header strictly requested: "**¿Qué deseas hacer a continuación?**" */}
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-neutral-100 flex items-center gap-2 font-['Cinzel',serif]">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>¿Qué deseas hacer a continuación?</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Selecciona una opción ficticia o presiona la tecla numérica correspondiente [1, 2, 3].
            </p>
          </div>

          {/* The 3 Interactive Options in strict fictive button format */}
          <div className="space-y-3 pt-2">
            {chapter.options.map((optionText, idx) => {
              const optionNumber = idx + 1;
              const isCurrentSelected = isLoading && selectedOptIndex === idx;
              
              // Ensure button text begins cleanly with [Opción X: ...]
              let cleanOption = optionText.trim();
              if (!cleanOption.startsWith('Opción') && !cleanOption.startsWith('[Opción')) {
                cleanOption = `Opción ${optionNumber}: ${cleanOption}`;
              }
              // Strip outer brackets if already in string so we format uniformly
              cleanOption = cleanOption.replace(/^\[|\]$/g, '').trim();

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(cleanOption, idx)}
                  disabled={isLoading}
                  className={`w-full text-left p-4 sm:p-5 rounded-xl border border-neutral-800 bg-neutral-950/80 transition-all duration-200 group relative flex items-start gap-3.5 ${getOptionBorderGlow(
                    idx
                  )} ${
                    isCurrentSelected
                      ? 'border-amber-500 bg-amber-950/30 ring-2 ring-amber-500/40'
                      : ''
                  } ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-[0.99]'}`}
                >
                  {/* Fictive Button Tag & Keyboard Badge */}
                  <div className="shrink-0 flex items-center gap-1.5 pt-0.5">
                    <span className="w-6 h-6 rounded-md bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-mono font-bold text-amber-400 group-hover:bg-amber-500/20 group-hover:border-amber-500/50 transition-colors">
                      {optionNumber}
                    </span>
                  </div>

                  {/* Option Text */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono font-semibold text-neutral-400 mb-1 group-hover:text-amber-300 transition-colors">
                      [Opción {optionNumber}]
                    </div>
                    <p className="text-sm sm:text-base font-medium text-neutral-200 group-hover:text-white leading-snug">
                      {cleanOption.replace(/^Opción\s*\d+:?\s*/i, '')}
                    </p>
                  </div>

                  {/* Indicator / Spinner */}
                  <div className="shrink-0 pt-1 text-neutral-500 group-hover:text-neutral-300 transition-colors">
                    {isCurrentSelected ? (
                      <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Loading Indicator when advancing chapter */}
          {isLoading && (
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-center gap-3 text-sm text-amber-200 animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
              <span>El motor de ficción está tejiendo las consecuencias de tu decisión...</span>
            </div>
          )}

          {/* Custom Action Input (Bonus capability: unexpected actions) */}
          <div className="pt-4 border-t border-neutral-800/80">
            <form onSubmit={handleCustomSubmit} className="space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <CornerDownRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span>¿Prefieres intentar algo inesperado?</span>
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">
                  Acción libre
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe tu propia acción o respuesta a esta situación..."
                  value={customActionText}
                  onChange={(e) => setCustomActionText(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all"
                />
                <button
                  type="submit"
                  disabled={isLoading || !customActionText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs sm:text-sm flex items-center gap-1.5 border border-neutral-700 transition-all shrink-0 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Ejecutar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </article>
    </div>
  );
};
