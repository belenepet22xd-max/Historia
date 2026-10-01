import React, { useState } from 'react';
import { 
  Search, 
  ShieldAlert, 
  Compass, 
  Flame, 
  Sparkles, 
  ChevronRight, 
  Feather,
  Scroll
} from 'lucide-react';
import { GenreType } from '../types';
import { GENRES } from '../data/genres';

interface GenreSelectorProps {
  onSelectGenre: (genre: GenreType, protagonistName?: string) => void;
  isLoading: boolean;
}

export const GenreSelector: React.FC<GenreSelectorProps> = ({
  onSelectGenre,
  isLoading,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<GenreType | null>(null);
  const [protagonistName, setProtagonistName] = useState('');
  const [customPremise, setCustomPremise] = useState('');

  const getIcon = (id: GenreType) => {
    switch (id) {
      case 'Policial':
        return <ShieldAlert className="w-7 h-7 text-sky-400" />;
      case 'Ciencia Ficción':
        return <Compass className="w-7 h-7 text-purple-400" />;
      case 'Fantasía':
        return <Flame className="w-7 h-7 text-emerald-400" />;
      case 'Misterio':
      default:
        return <Search className="w-7 h-7 text-amber-400" />;
    }
  };

  const getBorderHover = (id: GenreType) => {
    switch (id) {
      case 'Policial':
        return 'hover:border-sky-500/70 hover:shadow-[0_0_30px_rgba(56,189,248,0.2)] focus:border-sky-500';
      case 'Ciencia Ficción':
        return 'hover:border-purple-500/70 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] focus:border-purple-500';
      case 'Fantasía':
        return 'hover:border-emerald-500/70 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] focus:border-emerald-500';
      case 'Misterio':
      default:
        return 'hover:border-amber-500/70 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] focus:border-amber-500';
    }
  };

  const getActiveRing = (id: GenreType) => {
    switch (id) {
      case 'Policial':
        return 'border-sky-500 shadow-[0_0_25px_rgba(56,189,248,0.3)] bg-sky-950/20';
      case 'Ciencia Ficción':
        return 'border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.3)] bg-purple-950/20';
      case 'Fantasía':
        return 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.3)] bg-emerald-950/20';
      case 'Misterio':
      default:
        return 'border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.3)] bg-amber-950/20';
    }
  };

  const genreList: GenreType[] = ['Misterio', 'Policial', 'Ciencia Ficción', 'Fantasía'];

  const handleStart = (genre: GenreType) => {
    onSelectGenre(genre, protagonistName.trim() || undefined);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 sm:py-12 px-4 space-y-10 animate-fade-in">
      {/* Turn 1 Initial Message Banner (Rule 1: Saludo breve y presentación de 4 géneros) */}
      <div className="relative rounded-2xl border border-amber-500/30 bg-gradient-to-b from-neutral-900/90 to-neutral-950 p-6 sm:p-8 shadow-2xl backdrop-blur-md overflow-hidden">
        {/* Decorative corner ornament */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none" />
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono tracking-wider">
            <Feather className="w-3.5 h-3.5" />
            <span>MOTOR DE FICCIÓN INTERACTIVA • INICIO DE PARTIDA</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-100 font-['Cinzel',serif] tracking-tight leading-tight">
            ¡Saludos, viajero del relato!
          </h2>

          <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            Bienvenido al <strong className="text-amber-400 font-semibold">Motor de Ficción Interactiva</strong>. Soy el narrador de tu odisea: aquí, cada una de tus decisiones moldeará de forma tangible el rumbo de la trama, desatando consecuencias imprevistas, dilemas morales y giros de guión.
          </p>

          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 text-sm text-neutral-300 space-y-2">
            <p className="font-semibold text-neutral-200">
              Para comenzar, por favor elige uno de los cuatro géneros disponibles:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-medium pt-1">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Search className="w-3.5 h-3.5" /> 1. Misterio
              </span>
              <span className="flex items-center gap-1.5 text-sky-300">
                <ShieldAlert className="w-3.5 h-3.5" /> 2. Policial
              </span>
              <span className="flex items-center gap-1.5 text-purple-300">
                <Compass className="w-3.5 h-3.5" /> 3. Ciencia Ficción
              </span>
              <span className="flex items-center gap-1.5 text-emerald-300">
                <Flame className="w-3.5 h-3.5" /> 4. Fantasía
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Optional Protagonist Customization */}
      <div className="max-w-xl mx-auto rounded-xl bg-neutral-900/60 border border-neutral-800/80 p-4 space-y-3">
        <label className="block text-xs font-medium text-neutral-300">
          Nombre de tu protagonista o investigador <span className="text-neutral-500">(opcional)</span>
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Ejemplo: Inspector Morales, Elena Rostova, Lord Vane..."
            value={protagonistName}
            onChange={(e) => setProtagonistName(e.target.value)}
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/70 transition-colors"
          />
        </div>
      </div>

      {/* 4 Genre Selection Cards */}
      <div className="space-y-4">
        <h3 className="text-center text-xs font-mono uppercase tracking-widest text-neutral-400">
          Haz clic en un género para forjar tu aventura
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {genreList.map((genreKey) => {
            const genre = GENRES[genreKey];
            const isSelected = selectedGenre === genreKey;

            return (
              <div
                key={genreKey}
                onClick={() => setSelectedGenre(genreKey)}
                className={`group relative rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between cursor-pointer bg-gradient-to-b from-neutral-900/80 to-neutral-950 ${getBorderHover(
                  genreKey
                )} ${
                  isSelected
                    ? getActiveRing(genreKey)
                    : 'border-neutral-800/90 hover:border-neutral-700'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Header with Icon */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                        {getIcon(genreKey)}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-neutral-100 font-['Cinzel',serif] tracking-wide">
                          {genre.title}
                        </h4>
                        <p className="text-xs text-neutral-400 font-medium line-clamp-1">
                          {genre.tagline}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {genre.description}
                  </p>

                  {/* Setting sample */}
                  <div className="rounded-lg bg-neutral-950/80 border border-neutral-850 p-2.5 text-xs text-neutral-400">
                    <span className="text-neutral-500 font-mono block text-[10px] uppercase tracking-wider mb-0.5">
                      Escenario inicial:
                    </span>
                    <span className="text-neutral-300 italic">
                      "{genre.sampleSetting}"
                    </span>
                  </div>

                  {/* Keywords tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {genre.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-950 text-neutral-400 border border-neutral-800/80"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Direct Action Button */}
                <div className="pt-6 mt-4 border-t border-neutral-800/70">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStart(genreKey);
                    }}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all bg-neutral-800 text-neutral-100 hover:bg-neutral-700 active:scale-[0.98] border border-neutral-700/80 shadow-md group-hover:border-neutral-500"
                  >
                    <span>Comenzar en {genre.title}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
