export type Game = {
  score?: string;
  name: string;
  platforms?: string;
  genres?: string;
  releaseDate?: string;
  releaseYear: number;
  reviewRank: number;
  developers?: string[];
  publishers?: string[];
  franchise?: string;
  screenshotUrl?: string;
  brightenImage?: boolean;
  isDummyGame?: boolean;
  searchTerms?: string[]; // Additional search terms/aliases for the dropdown
  redactName?: boolean; // If true, show "(redacted!)" instead of asterisk-filled name
  overrideMask?: string; // Custom mask to display instead of automatic asterisk masking
  hltb?: {
    main?: number | null;
    extra?: number | null;
    completionist?: number | null;
  };
};
