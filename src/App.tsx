import React, { useState, useEffect } from 'react';
import { GenreType, StoryChapter, AdventureState } from './types';
import { GENRES } from './data/genres';
import { Header } from './components/Header';
import { GenreSelector } from './components/GenreSelector';
import { ChapterView } from './components/ChapterView';
import { JournalModal } from './components/JournalModal';
import { RawFormatModal } from './components/RawFormatModal';
import { soundscape } from './services/soundtrack';
import { narrator } from './services/tts';
import { AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'cronicas_destino_save_v1';

export default function App() {
  const [genre, setGenre] = useState<GenreType | null>(null);
  const [protagonistName, setProtagonistName] = useState<string>('');
  const [currentChapter, setCurrentChapter] = useState<StoryChapter | null>(null);
  const [history, setHistory] = useState<StoryChapter[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals & Display settings
  const [isJournalOpen, setIsJournalOpen] = useState<boolean>(false);
  const [isRawViewOpen, setIsRawViewOpen] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');

  // Load saved session on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.genre && parsed.currentChapter) {
          setGenre(parsed.genre);
          setProtagonistName(parsed.protagonistName || '');
          setCurrentChapter(parsed.currentChapter);
          setHistory(parsed.history || []);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved session:', e);
    }
  }, []);

  // Save session when state updates
  useEffect(() => {
    if (genre && currentChapter) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            genre,
            protagonistName,
            currentChapter,
            history,
          })
        );
      } catch (e) {
        console.warn('Failed to persist session:', e);
      }
    }
  }, [genre, protagonistName, currentChapter, history]);

  // Request new turn from backend
  const fetchChapterTurn = async (
    targetGenre: GenreType,
    previousChoice?: string,
    customAction?: string,
    historyList: StoryChapter[] = history
  ) => {
    setIsLoading(true);
    setErrorMessage(null);

    const nextChapterNumber = historyList.length + 1;

    try {
      const response = await fetch('/api/story/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          genre: targetGenre,
          protagonistName,
          chapterNumber: nextChapterNumber,
          currentChoice: previousChoice,
          customAction,
          history: historyList.map(h => ({
            chapter: h.chapterNumber,
            title: h.title,
            narrative: h.narrative,
            chosenOption: h.chosenOption,
            customAction: h.customAction,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor (${response.status})`);
      }

      const data = await response.json();

      const newChapter: StoryChapter = {
        id: `ch-${Date.now()}`,
        chapterNumber: data.chapterNumber || nextChapterNumber,
        title: data.title || `Capítulo ${nextChapterNumber}`,
        narrative: data.narrative,
        wordCount: data.wordCount || data.narrative.split(/\s+/).filter(Boolean).length,
        options: data.options || [],
        rawOutput: data.rawOutput,
        timestamp: Date.now(),
      };

      // If this is a continuation, save previous chapter's choice
      if (currentChapter) {
        const finishedPrevChapter: StoryChapter = {
          ...currentChapter,
          chosenOption: previousChoice,
          customAction: customAction,
        };
        setHistory(prev => [...prev, finishedPrevChapter]);
      }

      setCurrentChapter(newChapter);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Turn generation failed:', err);
      setErrorMessage(
        err.message || 'No fue posible conectar con el motor narrativo. Por favor intenta de nuevo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Start new game with selected genre
  const handleSelectGenre = (selectedGenre: GenreType, name?: string) => {
    narrator.stop();
    setGenre(selectedGenre);
    if (name) setProtagonistName(name);
    setHistory([]);
    setCurrentChapter(null);

    // Play genre soundscape
    soundscape.playGenreAtmosphere(selectedGenre);

    // Fetch initial chapter
    fetchChapterTurn(selectedGenre, undefined, undefined, []);
  };

  // Select an option
  const handleSelectOption = (optionText: string) => {
    if (!genre || isLoading) return;
    fetchChapterTurn(genre, optionText, undefined, history);
  };

  // Submit custom action
  const handleCustomAction = (actionText: string) => {
    if (!genre || isLoading) return;
    fetchChapterTurn(genre, undefined, actionText, history);
  };

  // Rewind previous chapter
  const handleRewind = () => {
    if (history.length === 0 || isLoading) return;
    narrator.stop();
    const lastChapter = history[history.length - 1];
    setHistory(prev => prev.slice(0, prev.length - 1));
    setCurrentChapter(lastChapter);
  };

  // Reset adventure
  const handleReset = () => {
    if (window.confirm('¿Deseas reiniciar la aventura y elegir un nuevo género? El progreso actual se guardará en la bitácora.')) {
      narrator.stop();
      soundscape.stop();
      setGenre(null);
      setCurrentChapter(null);
      setHistory([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        // ignore
      }
    }
  };

  // Export full story as markdown
  const handleExport = () => {
    const allChapters = [...history];
    if (currentChapter && !allChapters.find(c => c.id === currentChapter.id)) {
      allChapters.push(currentChapter);
    }

    let markdown = `# Crónicas del Destino: Aventura de ${genre || 'Ficción Interactiva'}\n\n`;
    if (protagonistName) {
      markdown += `**Protagonista:** ${protagonistName}\n\n`;
    }
    markdown += `*Fecha de la crónica: ${new Date().toLocaleDateString('es-ES')}*\n\n---\n\n`;

    allChapters.forEach((ch) => {
      markdown += `## ${ch.title || `Capítulo ${ch.chapterNumber}`}\n\n`;
      markdown += `${ch.narrative}\n\n`;
      if (ch.chosenOption) {
        markdown += `> **Decisión tomada:** ${ch.chosenOption}\n\n`;
      } else if (ch.customAction) {
        markdown += `> **Acción libre ejecutada:** ${ch.customAction}\n\n`;
      }
      markdown += `---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cronicas-${(genre || 'aventura').toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header */}
      <Header
        currentGenre={genre}
        chapterNumber={currentChapter?.chapterNumber}
        wordCount={currentChapter?.wordCount}
        onOpenJournal={() => setIsJournalOpen(true)}
        onOpenRawView={() => setIsRawViewOpen(true)}
        onExport={handleExport}
        onReset={handleReset}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        fontFamily={fontFamily}
        onChangeFontFamily={setFontFamily}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-start">
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto mt-4 px-4 w-full">
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-sm flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-xs px-2.5 py-1 rounded bg-red-900/50 hover:bg-red-850 text-red-100 border border-red-700/60 shrink-0"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* View Routing */}
        {!genre || !currentChapter ? (
          <GenreSelector onSelectGenre={handleSelectGenre} isLoading={isLoading} />
        ) : (
          <ChapterView
            chapter={currentChapter}
            genre={genre}
            isLoading={isLoading}
            onSelectOption={handleSelectOption}
            onCustomAction={handleCustomAction}
            onRewind={handleRewind}
            canRewind={history.length > 0}
            fontSize={fontSize}
            fontFamily={fontFamily}
          />
        )}
      </main>

      {/* Modals */}
      {genre && (
        <>
          <JournalModal
            isOpen={isJournalOpen}
            onClose={() => setIsJournalOpen(false)}
            genre={genre}
            history={history}
            currentChapter={currentChapter}
            onExport={handleExport}
          />
          <RawFormatModal
            isOpen={isRawViewOpen}
            onClose={() => setIsRawViewOpen(false)}
            chapter={currentChapter}
          />
        </>
      )}

      {/* Subtle Footer */}
      <footer className="w-full border-t border-neutral-900 py-4 px-4 text-center text-xs text-neutral-500 font-mono">
        <p>Motor de Ficción Interactiva • Misterio • Policial • Ciencia Ficción • Fantasía</p>
      </footer>
    </div>
  );
}
