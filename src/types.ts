export interface Change {
  value: string;
  count?: number;
  added?: boolean;
  removed?: boolean;
}

export type DiffMode = 'words' | 'chars' | 'lines';
export type ViewLayout = 'split' | 'inline';

export interface SampleText {
  id: string;
  title: string;
  category: string;
  textA: string;
  textB: string;
  description: string;
}

export interface DiffStats {
  additions: number;
  deletions: number;
  unchanged: number;
  similarityPercentage: number;
  totalWordsA: number;
  totalWordsB: number;
}

export interface ImprovementSuggestion {
  original_fragment: string;
  suggested_fragment: string;
  explanation: string;
}

export interface ImprovementResult {
  suggestions: ImprovementSuggestion[];
  general_advice: string;
}
