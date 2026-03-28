import type { IAgent } from "../types/agent";
import {
  getGenreDefinition,
  type GenreId,
  type NoteName,
  type TransitionRule,
} from "../scripts/genreRules";
import type { NoteDuration } from "../scripts/noteDurations";
import type {
  InternalModelState,
  Recommendation,
  SongPerception,
  UserActionType,
} from "../types/modelBasedAgent";

const GENRES: GenreId[] = [
  "pop",
  "ambiente",
  "cuna",
  "classical",
  "jazz",
  "folk",
];
const DEFAULT_ARTIST = "Artista desconocido";

const INITIAL_STATE = (): InternalModelState => ({
  genreWeights: {
    pop: 0.5,
    ambiente: 0.4,
    cuna: 0.4,
    classical: 0.3,
    jazz: 0.35,
    folk: 0.3,
  },
  artistWeights: {},
  frequentArtists: [],
  lastAction: null,
  lastGenre: null,
  lastPerception: null,
  updatedAtMs: Date.now(),
});

export class ModelBasedAgent implements IAgent {
  private pulse = 0;
  private preferredGenre: GenreId = "pop";
  private state: InternalModelState = INITIAL_STATE();

  private readonly genreDecayPerHour = 0.05;
  private readonly artistDecayPerHour = 0.08;
  private readonly durationPool: Record<
    GenreId,
    { durations: NoteDuration[]; weights: number[] }
  > = {
    pop: {
      durations: ["4n", "8n", "16n"],
      weights: [5, 3, 2],
    },
    ambiente: {
      durations: ["1n", "2n", "4n", "8n"],
      weights: [4, 4, 2, 1],
    },
    cuna: {
      durations: ["2n", "4n", "8n"],
      weights: [3, 4, 2],
    },
    classical: {
      durations: ["2n", "4n", "8n"],
      weights: [3, 5, 2],
    },
    jazz: {
      durations: ["4n", "8n", "16n"],
      weights: [4, 3, 3],
    },
    folk: {
      durations: ["4n", "2n", "8n"],
      weights: [4, 3, 3],
    },
  };

  setGenre(genre: GenreId): void {
    this.preferredGenre = genre;
  }

  setPulse(pulse: number): void {
    this.pulse = pulse;
  }

  reset(): void {
    this.pulse = 0;
  }

  resetModel(): void {
    this.state = INITIAL_STATE();
    this.preferredGenre = "pop";
    this.pulse = 0;
  }

  observe(
    perception: SongPerception,
    action: UserActionType = "listen",
    nowMs = Date.now(),
  ): void {
    this.applyTemporalDecay(nowMs);

    const normalizedRatio = this.clamp(perception.listenedRatio, 0, 1);
    const baseReinforcement = (normalizedRatio - 0.5) * 0.2;
    const actionBonus = this.getActionGenreBonus(action);
    const delta = baseReinforcement + actionBonus;

    const nextGenreWeight = this.clamp(
      this.state.genreWeights[perception.genre] + delta,
      0,
      1,
    );
    this.state.genreWeights[perception.genre] = nextGenreWeight;

    const artist = perception.artist.trim() || DEFAULT_ARTIST;
    const previousArtistWeight = this.state.artistWeights[artist] ?? 0;
    const artistDelta = baseReinforcement + this.getActionArtistBonus(action);
    this.state.artistWeights[artist] = this.clamp(
      previousArtistWeight + artistDelta,
      0,
      1,
    );

    this.state.frequentArtists = Object.entries(this.state.artistWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([artistName]) => artistName);

    this.state.lastAction = action;
    this.state.lastGenre = perception.genre;
    this.state.lastPerception = {
      ...perception,
      artist,
      listenedRatio: normalizedRatio,
      timestampMs: nowMs,
    };
    this.state.updatedAtMs = nowMs;
  }

  getRecommendation(): Recommendation {
    const topGenre = this.getTopGenre();
    const secondGenre = this.getSecondGenre(topGenre);
    const topArtist = this.state.frequentArtists[0] ?? "Artistas similares";

    if (
      this.state.lastAction === "skip" &&
      this.state.genreWeights[topGenre] > 0.7
    ) {
      return {
        title: `Explora ${this.getGenreLabel(topGenre)} Alternativo`,
        type: "playlist",
        reason:
          "Detecte saturacion en el genero dominante y propongo una variante para refrescar la escucha.",
        targetGenres: [topGenre],
        seedArtists: [topArtist],
      };
    }

    if (
      this.state.lastGenre &&
      this.state.lastGenre !== topGenre &&
      this.state.genreWeights[topGenre] > 0.6
    ) {
      return {
        title: `Fusion ${this.getGenreLabel(topGenre)} + ${this.getGenreLabel(
          this.state.lastGenre,
        )}`,
        type: "mix",
        reason:
          "Tu historial favorece un genero principal, pero la ultima escucha sugiere explorar colaboraciones cruzadas.",
        targetGenres: [topGenre, this.state.lastGenre],
        seedArtists: [topArtist],
      };
    }

    if (this.state.genreWeights[topGenre] >= 0.72) {
      return {
        title: `${this.getGenreLabel(topGenre)} esenciales`,
        type: "playlist",
        reason:
          "El estado interno indica una preferencia fuerte y estable por este genero.",
        targetGenres: [topGenre],
        seedArtists: [topArtist],
      };
    }

    return {
      title: `Descubrimiento guiado: ${this.getGenreLabel(topGenre)} y ${this.getGenreLabel(
        secondGenre,
      )}`,
      type: "mix",
      reason:
        "Tus pesos estan equilibrados; recomiendo un mix para afinar el perfil de preferencias.",
      targetGenres: [topGenre, secondGenre],
      seedArtists: this.state.frequentArtists.slice(0, 2),
    };
  }

  getModelState(): InternalModelState {
    return {
      genreWeights: {
        pop: this.state.genreWeights.pop,
        ambiente: this.state.genreWeights.ambiente,
        cuna: this.state.genreWeights.cuna,
        classical: this.state.genreWeights.classical,
        jazz: this.state.genreWeights.jazz,
        folk: this.state.genreWeights.folk,
      },
      artistWeights: { ...this.state.artistWeights },
      frequentArtists: [...this.state.frequentArtists],
      lastAction: this.state.lastAction,
      lastGenre: this.state.lastGenre,
      lastPerception: this.state.lastPerception
        ? { ...this.state.lastPerception }
        : null,
      updatedAtMs: this.state.updatedAtMs,
    };
  }

  getNextNote(currentNote: string): string {
    const activeGenre = this.resolveActiveGenre();
    const genre = getGenreDefinition(activeGenre);
    const fallback = genre.notePool;
    const rules: TransitionRule[] =
      genre.melodyTable[currentNote as NoteName] ??
      fallback.map((note) => ({
        next: note,
        interval: "fallback",
        weight: 1,
      }));

    if (this.pulse > 0 && this.pulse % genre.cadenceEvery === 0) {
      const cadenceRule = rules.find((rule) => rule.cadence);
      if (cadenceRule) {
        return this.clampToNotePool(cadenceRule.next, fallback);
      }
    }

    const weightedRules = this.applyContextualWeights(rules, activeGenre);
    return this.pickWeightedNote(weightedRules, fallback);
  }

  getNextChord(currentChord: string): string {
    const activeGenre = this.resolveActiveGenre();
    const genre = getGenreDefinition(activeGenre);
    const fallback = genre.chordNotePool;
    const rules: TransitionRule[] =
      genre.chordTable[currentChord as NoteName] ??
      fallback.map((note) => ({
        next: note,
        interval: "fallback",
        weight: 1,
      }));

    if (this.pulse > 0 && this.pulse % genre.cadenceEvery === 0) {
      const cadenceRule = rules.find((rule) => rule.cadence);
      if (cadenceRule) {
        return this.clampToNotePool(cadenceRule.next, fallback);
      }
    }

    return this.pickWeightedNote(rules, fallback);
  }

  getNextNoteDuration(): NoteDuration {
    const activeGenre = this.resolveActiveGenre();
    const durationConfig = this.durationPool[activeGenre];
    const adjustedWeights = [...durationConfig.weights];

    if (this.state.lastAction === "skip") {
      adjustedWeights[0] = Math.max(1, adjustedWeights[0] - 2);
      adjustedWeights[adjustedWeights.length - 1] += 1;
    }

    const totalWeight = adjustedWeights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < durationConfig.durations.length; i += 1) {
      random -= adjustedWeights[i];
      if (random <= 0) {
        return durationConfig.durations[i];
      }
    }

    return durationConfig.durations[durationConfig.durations.length - 1];
  }

  private applyTemporalDecay(nowMs: number): void {
    const elapsedHours = Math.max(
      0,
      (nowMs - this.state.updatedAtMs) / 3600000,
    );
    if (elapsedHours === 0) {
      return;
    }

    const genreDecayFactor = Math.max(
      0,
      1 - this.genreDecayPerHour * elapsedHours,
    );
    const artistDecayFactor = Math.max(
      0,
      1 - this.artistDecayPerHour * elapsedHours,
    );

    for (const genre of GENRES) {
      this.state.genreWeights[genre] = this.clamp(
        this.state.genreWeights[genre] * genreDecayFactor,
        0,
        1,
      );
    }

    for (const artist of Object.keys(this.state.artistWeights)) {
      const nextValue = this.state.artistWeights[artist] * artistDecayFactor;
      if (nextValue <= 0.01) {
        delete this.state.artistWeights[artist];
      } else {
        this.state.artistWeights[artist] = this.clamp(nextValue, 0, 1);
      }
    }

    this.state.updatedAtMs = nowMs;
  }

  private resolveActiveGenre(): GenreId {
    const topGenre = this.getTopGenre();
    const topWeight = this.state.genreWeights[topGenre];

    if (topWeight >= 0.62) {
      return topGenre;
    }

    return this.preferredGenre;
  }

  private applyContextualWeights(
    rules: TransitionRule[],
    activeGenre: GenreId,
  ): TransitionRule[] {
    const confidence = this.state.genreWeights[activeGenre] ?? 0.5;
    const cadenceBoost = this.state.lastAction === "like" ? 1.2 : 1;

    return rules.map((rule) => ({
      ...rule,
      weight: rule.cadence
        ? Math.max(1, rule.weight * (1 + confidence * 0.35) * cadenceBoost)
        : Math.max(1, rule.weight * (1 + confidence * 0.2)),
    }));
  }

  private pickWeightedNote(
    rules: TransitionRule[],
    fallback: NoteName[],
  ): NoteName {
    const totalWeight = rules.reduce((sum, rule) => sum + rule.weight, 0);
    let random = Math.random() * totalWeight;

    for (const rule of rules) {
      random -= rule.weight;
      if (random <= 0) {
        return this.clampToNotePool(rule.next, fallback);
      }
    }

    return this.clampToNotePool(rules[rules.length - 1].next, fallback);
  }

  private getActionGenreBonus(action: UserActionType): number {
    switch (action) {
      case "like":
        return 0.15;
      case "save":
        return 0.18;
      case "skip":
        return -0.22;
      case "listen":
      default:
        return 0.04;
    }
  }

  private getActionArtistBonus(action: UserActionType): number {
    switch (action) {
      case "like":
        return 0.12;
      case "save":
        return 0.14;
      case "skip":
        return -0.12;
      case "listen":
      default:
        return 0.02;
    }
  }

  private getTopGenre(): GenreId {
    return GENRES.reduce(
      (best, genre) =>
        this.state.genreWeights[genre] > this.state.genreWeights[best]
          ? genre
          : best,
      GENRES[0],
    );
  }

  private getSecondGenre(topGenre: GenreId): GenreId {
    const rest = GENRES.filter((genre) => genre !== topGenre);
    if (rest.length === 0) {
      return topGenre;
    }

    return rest.reduce(
      (best, genre) =>
        this.state.genreWeights[genre] > this.state.genreWeights[best]
          ? genre
          : best,
      rest[0],
    );
  }

  private getGenreLabel(genre: GenreId): string {
    const labels: Record<GenreId, string> = {
      pop: "Pop",
      ambiente: "Ambiente",
      cuna: "Cuna",
      classical: "Clásica",
      jazz: "Jazz",
      folk: "Folk",
    };

    return labels[genre];
  }

  private clampToNotePool(note: NoteName, notePool: NoteName[]): NoteName {
    if (notePool.includes(note)) {
      return note;
    }

    const pitchClass = note[0] as "A" | "B" | "C" | "D" | "E" | "F" | "G";
    const closestByPitchClass = notePool.find(
      (candidate) => candidate[0] === pitchClass,
    );
    return closestByPitchClass ?? notePool[0];
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
}
