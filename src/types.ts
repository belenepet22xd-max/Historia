export type GenreType = 'Misterio' | 'Policial' | 'Ciencia Ficción' | 'Fantasía';

export interface GenreInfo {
  id: GenreType;
  title: string;
  tagline: string;
  description: string;
  iconName: string;
  themeColor: {
    primary: string;
    border: string;
    bg: string;
    glow: string;
    badge: string;
    accent: string;
  };
  sampleSetting: string;
  keywords: string[];
}

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  title: string;
  narrative: string;
  wordCount: number;
  options: string[];
  chosenOption?: string;
  customAction?: string;
  timestamp: number;
  rawOutput?: string;
}

export interface AdventureState {
  genre: GenreType | null;
  protagonistName?: string;
  currentChapter: StoryChapter | null;
  history: StoryChapter[];
  clues: string[];
  inventory: string[];
  statusMessage?: string;
  isLoading: boolean;
  error?: string | null;
}
