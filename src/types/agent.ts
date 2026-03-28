import type { NoteDuration } from "../scripts/noteDurations";

export interface IAgent {
  getNextNote(currentNote: string): string;
  getNextNoteDuration(): NoteDuration;
}
