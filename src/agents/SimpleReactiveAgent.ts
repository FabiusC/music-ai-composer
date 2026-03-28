import type { IAgent } from "../types/agent";
import {
  getGenreDefinition,
  type GenreId,
  type NoteName,
  type TransitionRule,
} from "../scripts/genreRules";
import type { NoteDuration } from "../scripts/noteDurations";

export class SimpleReactiveAgent implements IAgent {
  private pulse = 0;
  private genre: GenreId = "pop";

  private readonly octaveSpreadChance = 0.35;
  private readonly durationPool: Record<
    GenreId,
    { durations: NoteDuration[]; weights: number[] }
  > = {
    pop: {
      durations: ["4n", "8n", "16n"],
      weights: [6, 3, 1],
    },
    ambiente: {
      durations: ["1n", "2n", "4n", "8n"],
      weights: [2, 4, 3, 1],
    },
    cuna: {
      durations: ["4n", "2n", "8n"],
      weights: [5, 2, 3],
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
    this.genre = genre;
  }

  setPulse(pulse: number): void {
    this.pulse = pulse;
  }

  reset(): void {
    this.pulse = 0;
  }

  getNextNote(currentNote: string): string {
    const genre = getGenreDefinition(this.genre);
    const fallback = genre.notePool;
    const rules: TransitionRule[] =
      genre.melodyTable[currentNote as NoteName] ??
      fallback.map((note) => ({
        next: note,
        interval: "fallback",
        weight: 1,
      }));

    // En pulso fuerte, se priorizan resoluciones de cadencia segun el genero.
    if (this.pulse > 0 && this.pulse % genre.cadenceEvery === 0) {
      const cadenceRule = rules.find((rule) => rule.cadence);
      if (cadenceRule) {
        return this.clampToNotePool(cadenceRule.next, fallback);
      }
    }

    const totalWeight = rules.reduce((sum, rule) => sum + rule.weight, 0);
    let random = Math.random() * totalWeight;

    for (const rule of rules) {
      random -= rule.weight;
      if (random <= 0) {
        const spread = this.applyOctaveSpread(rule.next, fallback);
        return this.clampToNotePool(spread, fallback);
      }
    }

    const spread = this.applyOctaveSpread(
      rules[rules.length - 1].next,
      fallback,
    );
    return this.clampToNotePool(spread, fallback);
  }

  getNextChord(currentChord: string): string {
    const genre = getGenreDefinition(this.genre);
    const fallback = genre.chordNotePool;
    const rules: TransitionRule[] =
      genre.chordTable[currentChord as NoteName] ??
      fallback.map((note) => ({
        next: note,
        interval: "fallback",
        weight: 1,
      }));

    // Priorizan resoluciones en pulsos fuerte
    if (this.pulse > 0 && this.pulse % genre.cadenceEvery === 0) {
      const cadenceRule = rules.find((rule) => rule.cadence);
      if (cadenceRule) {
        return this.clampToNotePool(cadenceRule.next, fallback);
      }
    }

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

  private applyOctaveSpread(note: NoteName, notePool: NoteName[]): NoteName {
    if (Math.random() > this.octaveSpreadChance) {
      return note;
    }

    const pitchClass = note[0] as "A" | "B" | "C" | "D" | "E" | "F" | "G";
    const octaveCandidates = [
      `${pitchClass}3`,
      `${pitchClass}4`,
      `${pitchClass}5`,
    ] as NoteName[];

    const candidates = octaveCandidates.filter((candidate) =>
      notePool.includes(candidate),
    );
    if (candidates.length === 0) {
      return note;
    }

    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }

  getNextNoteDuration(): NoteDuration {
    const durationConfig = this.durationPool[this.genre];
    const totalWeight = durationConfig.weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < durationConfig.durations.length; i++) {
      random -= durationConfig.weights[i];
      if (random <= 0) {
        return durationConfig.durations[i];
      }
    }

    return durationConfig.durations[durationConfig.durations.length - 1];
  }
}
