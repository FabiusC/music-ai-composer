import type { GenreId } from "../scripts/genreRules";

export type UserActionType = "listen" | "like" | "skip" | "save";

export type SongPerception = {
  songId?: string;
  genre: GenreId;
  artist: string;
  tempo: number;
  listenedRatio: number;
  timestampMs?: number;
};

export type InternalModelState = {
  genreWeights: Record<GenreId, number>;
  artistWeights: Record<string, number>;
  frequentArtists: string[];
  lastAction: UserActionType | null;
  lastGenre: GenreId | null;
  lastPerception: SongPerception | null;
  updatedAtMs: number;
};

export type RecommendationType = "playlist" | "mix";

export type Recommendation = {
  title: string;
  type: RecommendationType;
  reason: string;
  targetGenres: GenreId[];
  seedArtists: string[];
};
