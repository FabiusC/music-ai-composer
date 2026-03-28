export type NoteDuration = "1n" | "2n" | "4n" | "8n" | "16n" | "32n";

export type TempoOption = {
  label: string;
  bpm: number;
  pulseIntervalMs: number;
};

export const NOTE_DURATIONS: Record<
  NoteDuration,
  { label: string; description: string }
> = {
  "1n": { label: "Redonda", description: "4 tiempos" },
  "2n": { label: "Blanca", description: "2 tiempos" },
  "4n": { label: "Negra", description: "1 tiempo" },
  "8n": { label: "Corchea", description: "1/2 tiempo" },
  "16n": { label: "Fusa", description: "1/4 tiempo" },
  "32n": { label: "Semifusa", description: "1/8 tiempo" },
};

export const TEMPO_OPTIONS: TempoOption[] = [
  { label: "Muy lento (40 BPM)", bpm: 40, pulseIntervalMs: 1500 },
  { label: "Lento (60 BPM)", bpm: 60, pulseIntervalMs: 1000 },
  { label: "Moderado (80 BPM)", bpm: 80, pulseIntervalMs: 750 },
  { label: "Allegro (100 BPM)", bpm: 100, pulseIntervalMs: 600 },
  { label: "Rápido (120 BPM)", bpm: 120, pulseIntervalMs: 500 },
  { label: "Muy rápido (140 BPM)", bpm: 140, pulseIntervalMs: 428 },
];

const DEFAULT_TEMPO_INDEX = 2;
export const DEFAULT_TEMPO = TEMPO_OPTIONS[DEFAULT_TEMPO_INDEX];

export function getTempoByBpm(bpm: number): TempoOption | null {
  return TEMPO_OPTIONS.find((t) => t.bpm === bpm) ?? null;
}

export function getPulseIntervalForBpm(bpm: number): number {
  const tempo = getTempoByBpm(bpm);
  return tempo?.pulseIntervalMs ?? DEFAULT_TEMPO.pulseIntervalMs;
}
