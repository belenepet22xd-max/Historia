import React, { useState } from 'react';
import { 
  BookOpen, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  FileDown, 
  Compass, 
  Search, 
  ShieldAlert, 
  Flame, 
  Eye, 
  Sliders, 
  Type
} from 'lucide-react';
import { GenreType } from '../types';
import { GENRES } from '../data/genres';
import { soundscape } from '../services/soundtrack';

interface HeaderProps {
  currentGenre: GenreType | null;
  chapterNumber?: number;
  wordCount?: number;
  onOpenJournal: () => void;
  onOpenRawView: () => void;
  onExport: () => void;
  onReset: () => void;
  fontSize: 'sm' | 'md' | 'lg';
  onChangeFontSize: (size: 'sm' | 'md' | 'lg') => void;
  fontFamily: 'serif' | 'sans' | 'mono';
  onChangeFontFamily: (family: 'serif' | 'sans' | 'mono') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentGenre,
  chapterNumber,
  wordCount,
  onOpenJournal,
  onOpenRawView,
  onExport,
  onReset,
  fontSize,
  onChangeFontSize,
  fontFamily,
  onChangeFontFamily,
}) => {
  const [isMuted, setIsMuted] = useState(soundscape.isMuted());
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(soundscape.getVolume());

  const handleToggleSound = () => {
    if (currentGenre) {
      const active = soundscape.toggle(currentGenre);
      setIsMuted(!active);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundscape.setVolume(val);
  };

  const getGenreIcon = () => {
    switch (currentGenre) {
      case 'Policial':
        return <ShieldAlert className="w-4 h-4 text-sky-400" />;
      case 'Ciencia Ficción':
        return <Compass className="w-4 h-4 text-purple-400" />;
      case 'Fantasía':
        return <Flame className="w-4 h-4 text-emerald-400" />;
      case 'Misterio':
      default:
        return <Search className="w-4 h-4 text-amber-400" />;
    }
  };

  const genreConfig = currentGenre ? GENRES[currentGenre] : null;

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-neutral-950/85 border-b border-neutral-800/80 px-4 py-2.5 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-neutral-800 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <BookOpen className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-neutral-100 truncate font-['Cinzel',serif]">
                Crónicas del Destino
              </h1>
              <span className="hidden md:inline-flex text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-neutral-800/80 text-neutral-400 border border-neutral-700/60 font-mono">
                Motor Narrativo
              </span>
            </div>
            {currentGenre ? (
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 truncate">
                <span className="flex items-center gap-1 font-medium text-neutral-300">
                  {getGenreIcon()}
                  <span>{currentGenre}</span>
                </span>
                {chapterNumber && (
                  <>
                    <span className="text-neutral-600">•</span>
                    <span className="text-amber-400/90 font-medium">Cap. {chapterNumber}</span>
                  </>
                )}
                {wordCount !== undefined && (
                  <span className="hidden sm:inline-block text-[11px] text-neutral-500">
                    ({wordCount} palabras)
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 truncate">
                Misterio • Policial • Ciencia Ficción • Fantasía
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Ambient Soundscapes */}
          {currentGenre && (
            <div className="relative">
              <button
                onClick={handleToggleSound}
                title={isMuted ? 'Activar atmósfera sonora procedural' : 'Silenciar atmósfera sonora'}
                className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 text-xs ${
                  !isMuted 
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]' 
                    : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                {!isMuted ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden lg:inline text-[11px]">
                  {!isMuted ? 'Atmósfera' : 'Sonido'}
                </span>
              </button>
            </div>
          )}

          {/* Reading Display Settings */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              title="Configuración de lectura"
              className="p-2 rounded-lg border bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-neutral-900 border border-neutral-700/80 p-3 shadow-2xl z-50 text-xs space-y-3 backdrop-blur-xl">
                <div>
                  <label className="text-neutral-400 block mb-1 font-medium">Volumen de atmósfera</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="border-t border-neutral-800 pt-2">
                  <label className="text-neutral-400 block mb-1 font-medium">Tamaño de letra</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['sm', 'md', 'lg'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => onChangeFontSize(s)}
                        className={`py-1 rounded text-center font-medium capitalize ${
                          fontSize === s
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                        }`}
                      >
                        {s === 'sm' ? 'Pequeña' : s === 'md' ? 'Media' : 'Grande'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-neutral-800 pt-2">
                  <label className="text-neutral-400 block mb-1 font-medium">Tipografía</label>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => onChangeFontFamily('serif')}
                      className={`py-1 rounded text-center font-serif ${
                        fontFamily === 'serif'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                      }`}
                    >
                      Clásica
                    </button>
                    <button
                      onClick={() => onChangeFontFamily('sans')}
                      className={`py-1 rounded text-center font-sans ${
                        fontFamily === 'sans'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                      }`}
                    >
                      Moderna
                    </button>
                    <button
                      onClick={() => onChangeFontFamily('mono')}
                      className={`py-1 rounded text-center font-mono ${
                        fontFamily === 'mono'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                      }`}
                    >
                      Terminal
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Raw Output View */}
          {chapterNumber && (
            <button
              onClick={onOpenRawView}
              title="Ver formato estricto del turno (Narrativa + Opciones)"
              className="p-2 rounded-lg border bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden xl:inline text-xs">Formato Puro</span>
            </button>
          )}

          {/* Journal / Story Timeline */}
          {chapterNumber && (
            <button
              onClick={onOpenJournal}
              title="Abrir bitácora de la aventura"
              className="px-2.5 py-1.5 rounded-lg border bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Bitácora</span>
            </button>
          )}

          {/* Export Story */}
          {chapterNumber && (
            <button
              onClick={onExport}
              title="Descargar crónica completa de la historia"
              className="p-2 rounded-lg border bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              <FileDown className="w-4 h-4" />
            </button>
          )}

          {/* Change Genre / Reset */}
          {currentGenre && (
            <button
              onClick={onReset}
              title="Cambiar de género / Nueva aventura"
              className="p-2 rounded-lg border border-neutral-800 text-neutral-400 hover:text-red-400 hover:bg-red-950/30 hover:border-red-800/50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
