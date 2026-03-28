export const NOTE_POOL = [
  "C1",
  "D1",
  "E1",
  "F1",
  "G1",
  "A1",
  "B1",
  "C2",
  "D2",
  "E2",
  "F2",
  "G2",
  "A2",
  "B2",
  "C3",
  "D3",
  "E3",
  "F3",
  "G3",
  "A3",
  "B3",
  "C4",
  "D4",
  "E4",
  "F4",
  "G4",
  "A4",
  "B4",
  "C5",
  "D5",
  "E5",
  "F5",
  "G5",
  "A5",
  "B5",
] as const;

export type NoteName = (typeof NOTE_POOL)[number];

export type GenreId = "pop" | "ambiente" | "cuna";

export type TransitionRule = {
  next: NoteName;
  interval: string;
  weight: number;
  cadence?: boolean;
};

export type GenreDefinition = {
  id: GenreId;
  label: string;
  description: string;
  cadenceEvery: number;
  notePool: NoteName[];
  chordNotePool: NoteName[];
  melodyTable: Partial<Record<NoteName, TransitionRule[]>>;
  chordTable: Partial<Record<NoteName, TransitionRule[]>>;
};

const NOTE_POOL_LIST: NoteName[] = [
  "C5",
  "B4",
  "A4",
  "G4",
  "F4",
  "E4",
  "D4",
  "C4",
];

const CHORD_POOL_LIST: NoteName[] = [
  "C4",
  "B3",
  "A3",
  "G3",
  "F3",
  "E3",
  "D3",
  "C3",
];

// ============ TABLA DE TRANSICIONES PARA VOZ 1 (MELODÍA) ============

const POP_MELODY_TABLE: Partial<Record<NoteName, TransitionRule[]>> = {
  C4: [
    { next: "E4", interval: "+M3", weight: 4 },
    { next: "G4", interval: "+P5", weight: 3 },
    { next: "A4", interval: "+M6", weight: 2 },
    { next: "C3", interval: "-P8", weight: 1 },
    { next: "C5", interval: "+P8", weight: 2 },
    { next: "C4", interval: "P1", weight: 2, cadence: true },
  ],
  D4: [
    { next: "F4", interval: "+m3", weight: 3 },
    { next: "A4", interval: "+P5", weight: 3 },
    { next: "C5", interval: "+m7", weight: 2 },
    { next: "D4", interval: "P1", weight: 2, cadence: true },
  ],
  E4: [
    { next: "G4", interval: "+m3", weight: 4 },
    { next: "A4", interval: "+P4", weight: 3 },
    { next: "C5", interval: "+m6", weight: 2 },
    { next: "E4", interval: "P1", weight: 2, cadence: true },
  ],
  F4: [
    { next: "A4", interval: "+M3", weight: 3 },
    { next: "C5", interval: "+P5", weight: 3 },
    { next: "G4", interval: "+M2", weight: 2 },
    { next: "F4", interval: "P1", weight: 2, cadence: true },
  ],
  G4: [
    { next: "A4", interval: "+M2", weight: 4 },
    { next: "E4", interval: "-m3", weight: 3 },
    { next: "C5", interval: "+P4", weight: 2 },
    { next: "G4", interval: "P1", weight: 2, cadence: true },
  ],
  A4: [
    { next: "C5", interval: "+m3", weight: 4 },
    { next: "E4", interval: "-P4", weight: 3 },
    { next: "G4", interval: "-M2", weight: 2 },
    { next: "A4", interval: "P1", weight: 2, cadence: true },
  ],
  B4: [
    { next: "C5", interval: "+m2", weight: 4 },
    { next: "G4", interval: "-M3", weight: 3 },
    { next: "E4", interval: "-P4", weight: 2 },
    { next: "B4", interval: "P1", weight: 2, cadence: true },
  ],
  C5: [
    { next: "A4", interval: "-m3", weight: 4 },
    { next: "G4", interval: "-P4", weight: 3 },
    { next: "E4", interval: "-m6", weight: 2 },
    { next: "G5", interval: "+P5", weight: 2 },
    { next: "C3", interval: "-P15", weight: 1 },
    { next: "C5", interval: "P1", weight: 2, cadence: true },
  ],
};

// ============ TABLA DE TRANSICIONES PARA VOZ 2 (ACORDES) ============

const POP_CHORD_TABLE: Partial<Record<NoteName, TransitionRule[]>> = {
  C3: [
    { next: "F3", interval: "+P4", weight: 3 },
    { next: "G3", interval: "+P5", weight: 3 },
    { next: "C3", interval: "P1", weight: 2, cadence: true },
  ],
  D3: [
    { next: "G3", interval: "+P4", weight: 3 },
    { next: "A3", interval: "+P5", weight: 3 },
    { next: "D3", interval: "P1", weight: 2, cadence: true },
  ],
  E3: [
    { next: "A3", interval: "+P4", weight: 3 },
    { next: "B3", interval: "+P5", weight: 3 },
    { next: "E3", interval: "P1", weight: 2, cadence: true },
  ],
  F3: [
    { next: "B3", interval: "+tritone", weight: 2 },
    { next: "C4", interval: "+P4", weight: 3 },
    { next: "F3", interval: "P1", weight: 2, cadence: true },
  ],
  G3: [
    { next: "C4", interval: "+P4", weight: 3 },
    { next: "D4", interval: "+P5", weight: 3 },
    { next: "G3", interval: "P1", weight: 2, cadence: true },
  ],
  A3: [
    { next: "D4", interval: "+P4", weight: 3 },
    { next: "E4", interval: "+P5", weight: 3 },
    { next: "A3", interval: "P1", weight: 2, cadence: true },
  ],
  B3: [
    { next: "E4", interval: "+P4", weight: 3 },
    { next: "F4", interval: "+P5", weight: 3 },
    { next: "B3", interval: "P1", weight: 2, cadence: true },
  ],
  C4: [
    { next: "F4", interval: "+P4", weight: 3 },
    { next: "G4", interval: "+P5", weight: 3 },
    { next: "C3", interval: "-P8", weight: 1 },
    { next: "C4", interval: "P1", weight: 2, cadence: true },
  ],
};

const AMBIENTE_MELODY_TABLE: Partial<Record<NoteName, TransitionRule[]>> = {
  C3: [
    { next: "C3", interval: "P1", weight: 5, cadence: true },
    { next: "D3", interval: "+M2", weight: 2 },
    { next: "E3", interval: "+M3", weight: 1 },
  ],
  C4: [
    { next: "C4", interval: "P1", weight: 5, cadence: true },
    { next: "D4", interval: "+M2", weight: 2 },
    { next: "G4", interval: "+P5", weight: 1 },
    { next: "C3", interval: "-P8", weight: 1 },
    { next: "C5", interval: "+P8", weight: 1 },
  ],
  D3: [
    { next: "D3", interval: "P1", weight: 5, cadence: true },
    { next: "E3", interval: "+M2", weight: 2 },
    { next: "A3", interval: "+P5", weight: 1 },
  ],
  D4: [
    { next: "D4", interval: "P1", weight: 5, cadence: true },
    { next: "E4", interval: "+M2", weight: 1 },
    { next: "A4", interval: "+P5", weight: 1 },
    { next: "C4", interval: "-M2", weight: 1 },
  ],
  E3: [
    { next: "E3", interval: "P1", weight: 5, cadence: true },
    { next: "F3", interval: "+m2", weight: 2 },
    { next: "B3", interval: "+P5", weight: 1 },
  ],
  E4: [
    { next: "E4", interval: "P1", weight: 5, cadence: true },
    { next: "F4", interval: "+m2", weight: 1 },
    { next: "B4", interval: "+P5", weight: 1 },
    { next: "C5", interval: "+m6", weight: 1 },
  ],
  F3: [
    { next: "F3", interval: "P1", weight: 5, cadence: true },
    { next: "G3", interval: "+M2", weight: 2 },
    { next: "C4", interval: "+P5", weight: 1 },
  ],
  F4: [
    { next: "F4", interval: "P1", weight: 5, cadence: true },
    { next: "G4", interval: "+M2", weight: 1 },
    { next: "C5", interval: "+P5", weight: 1 },
    { next: "E4", interval: "-m2", weight: 1 },
  ],
  G3: [
    { next: "G3", interval: "P1", weight: 5, cadence: true },
    { next: "A3", interval: "+M2", weight: 2 },
    { next: "D4", interval: "+P5", weight: 1 },
  ],
  G4: [
    { next: "G4", interval: "P1", weight: 5, cadence: true },
    { next: "A4", interval: "+M2", weight: 1 },
    { next: "D4", interval: "-P4", weight: 1 },
    { next: "C5", interval: "+P4", weight: 1 },
  ],
  A3: [
    { next: "A3", interval: "P1", weight: 5, cadence: true },
    { next: "G3", interval: "-M2", weight: 2 },
    { next: "C4", interval: "+m3", weight: 1 },
  ],
  A4: [
    { next: "A4", interval: "P1", weight: 5, cadence: true },
    { next: "G4", interval: "-M2", weight: 1 },
    { next: "C5", interval: "+m3", weight: 1 },
    { next: "F4", interval: "-M3", weight: 1 },
  ],
  B3: [
    { next: "B3", interval: "P1", weight: 5, cadence: true },
    { next: "C4", interval: "+m2", weight: 2 },
    { next: "G3", interval: "-M3", weight: 1 },
  ],
  B4: [
    { next: "B4", interval: "P1", weight: 5, cadence: true },
    { next: "C5", interval: "+m2", weight: 1 },
    { next: "G4", interval: "-M3", weight: 1 },
    { next: "E4", interval: "-P4", weight: 1 },
  ],
  C5: [
    { next: "C5", interval: "P1", weight: 5, cadence: true },
    { next: "B4", interval: "-m2", weight: 1 },
    { next: "G4", interval: "-P4", weight: 1 },
    { next: "C3", interval: "-P15", weight: 1 },
    { next: "C4", interval: "-P8", weight: 1 },
  ],
};

const AMBIENTE_CHORD_TABLE: Partial<Record<NoteName, TransitionRule[]>> = {
  C3: [
    { next: "C3", interval: "P1", weight: 6, cadence: true },
    { next: "F3", interval: "+P4", weight: 1 },
    { next: "G3", interval: "+P5", weight: 1 },
  ],
  D3: [
    { next: "D3", interval: "P1", weight: 6, cadence: true },
    { next: "G3", interval: "+P4", weight: 1 },
    { next: "A3", interval: "+P5", weight: 1 },
  ],
  E3: [
    { next: "E3", interval: "P1", weight: 6, cadence: true },
    { next: "A3", interval: "+P4", weight: 1 },
    { next: "B3", interval: "+P5", weight: 1 },
  ],
  F3: [
    { next: "F3", interval: "P1", weight: 6, cadence: true },
    { next: "B3", interval: "+tritone", weight: 1 },
    { next: "C4", interval: "+P4", weight: 1 },
  ],
  G3: [
    { next: "G3", interval: "P1", weight: 6, cadence: true },
    { next: "C4", interval: "+P4", weight: 1 },
    { next: "D4", interval: "+P5", weight: 1 },
  ],
  A3: [
    { next: "A3", interval: "P1", weight: 6, cadence: true },
    { next: "D4", interval: "+P4", weight: 1 },
    { next: "E4", interval: "+P5", weight: 1 },
  ],
  B3: [
    { next: "B3", interval: "P1", weight: 6, cadence: true },
    { next: "E4", interval: "+P4", weight: 1 },
    { next: "F4", interval: "+P5", weight: 1 },
  ],
  C4: [
    { next: "C4", interval: "P1", weight: 6, cadence: true },
    { next: "F4", interval: "+P4", weight: 1 },
    { next: "G4", interval: "+P5", weight: 1 },
  ],
};

const CUNA_MELODY_TABLE: Partial<Record<NoteName, TransitionRule[]>> = {
  C3: [
    { next: "C3", interval: "P1", weight: 4, cadence: true },
    { next: "E3", interval: "+M3", weight: 2 },
    { next: "G3", interval: "+P5", weight: 2 },
  ],
  C4: [
    { next: "C4", interval: "P1", weight: 4, cadence: true },
    { next: "D4", interval: "+M2", weight: 2 },
    { next: "E4", interval: "+M3", weight: 1 },
    { next: "G4", interval: "+P5", weight: 1 },
  ],
  D3: [
    { next: "D3", interval: "P1", weight: 4, cadence: true },
    { next: "E3", interval: "+M2", weight: 2 },
    { next: "F3", interval: "+m3", weight: 2 },
  ],
  D4: [
    { next: "D4", interval: "P1", weight: 4, cadence: true },
    { next: "E4", interval: "+M2", weight: 2 },
    { next: "F4", interval: "+m3", weight: 1 },
    { next: "A4", interval: "+P5", weight: 1 },
  ],
  E3: [
    { next: "E3", interval: "P1", weight: 4, cadence: true },
    { next: "F3", interval: "+m2", weight: 2 },
    { next: "G3", interval: "+m3", weight: 2 },
  ],
  E4: [
    { next: "E4", interval: "P1", weight: 4, cadence: true },
    { next: "F4", interval: "+m2", weight: 2 },
    { next: "G4", interval: "+m3", weight: 1 },
    { next: "C5", interval: "+m6", weight: 1 },
  ],
  F3: [
    { next: "F3", interval: "P1", weight: 4, cadence: true },
    { next: "G3", interval: "+M2", weight: 2 },
    { next: "A3", interval: "+M3", weight: 1 },
  ],
  F4: [
    { next: "F4", interval: "P1", weight: 4, cadence: true },
    { next: "G4", interval: "+M2", weight: 2 },
    { next: "A4", interval: "+M3", weight: 1 },
    { next: "C5", interval: "+P4", weight: 1 },
  ],
  G3: [
    { next: "G3", interval: "P1", weight: 4, cadence: true },
    { next: "A3", interval: "+M2", weight: 1 },
    { next: "C4", interval: "+M3", weight: 1 },
    { next: "E3", interval: "-m3", weight: 1 },
  ],
  G4: [
    { next: "G4", interval: "P1", weight: 4, cadence: true },
    { next: "A4", interval: "+M2", weight: 1 },
    { next: "C5", interval: "+M3", weight: 1 },
    { next: "E4", interval: "-m3", weight: 1 },
  ],
  A3: [
    { next: "A3", interval: "P1", weight: 4, cadence: true },
    { next: "B3", interval: "+M2", weight: 2 },
    { next: "C4", interval: "+m3", weight: 1 },
  ],
  A4: [
    { next: "A4", interval: "P1", weight: 4, cadence: true },
    { next: "B4", interval: "+M2", weight: 2 },
    { next: "C5", interval: "+m3", weight: 1 },
  ],
  B3: [
    { next: "B3", interval: "P1", weight: 4, cadence: true },
    { next: "C4", interval: "+m2", weight: 2 },
    { next: "G3", interval: "-M3", weight: 1 },
  ],
  B4: [
    { next: "B4", interval: "P1", weight: 4, cadence: true },
    { next: "C5", interval: "+m2", weight: 2 },
    { next: "G4", interval: "-M3", weight: 1 },
  ],
  C5: [
    { next: "C5", interval: "P1", weight: 4, cadence: true },
    { next: "B4", interval: "-m2", weight: 1 },
    { next: "A4", interval: "-m3", weight: 1 },
    { next: "G4", interval: "-P4", weight: 1 },
    { next: "C4", interval: "-P8", weight: 1 },
  ],
};

const CUNA_CHORD_TABLE: Partial<Record<NoteName, TransitionRule[]>> = {
  C3: [
    { next: "C3", interval: "P1", weight: 5, cadence: true },
    { next: "F3", interval: "+P4", weight: 2 },
    { next: "G3", interval: "+P5", weight: 2 },
  ],
  D3: [
    { next: "D3", interval: "P1", weight: 5, cadence: true },
    { next: "G3", interval: "+P4", weight: 2 },
  ],
  E3: [
    { next: "E3", interval: "P1", weight: 5, cadence: true },
    { next: "A3", interval: "+P4", weight: 2 },
  ],
  F3: [
    { next: "F3", interval: "P1", weight: 5, cadence: true },
    { next: "B3", interval: "+tritone", weight: 1 },
    { next: "C4", interval: "+P4", weight: 2 },
  ],
  G3: [
    { next: "G3", interval: "P1", weight: 5, cadence: true },
    { next: "C4", interval: "+P4", weight: 2 },
  ],
  A3: [
    { next: "A3", interval: "P1", weight: 5, cadence: true },
    { next: "D4", interval: "+P4", weight: 2 },
  ],
  B3: [
    { next: "B3", interval: "P1", weight: 5, cadence: true },
    { next: "E4", interval: "+P4", weight: 2 },
  ],
  C4: [
    { next: "C4", interval: "P1", weight: 5, cadence: true },
    { next: "F4", interval: "+P4", weight: 2 },
    { next: "G4", interval: "+P5", weight: 1 },
  ],
};

export const GENRE_RULES: Record<GenreId, GenreDefinition> = {
  pop: {
    id: "pop",
    label: "Pop",
    description: "Saltos consonantes y repeticion melodica.",
    cadenceEvery: 4,
    notePool: NOTE_POOL_LIST,
    chordNotePool: CHORD_POOL_LIST,
    melodyTable: POP_MELODY_TABLE,
    chordTable: POP_CHORD_TABLE,
  },
  ambiente: {
    id: "ambiente",
    label: "Ambiente",
    description: "Notas largas, repeticion y flujo estable.",
    cadenceEvery: 6,
    notePool: NOTE_POOL_LIST,
    chordNotePool: CHORD_POOL_LIST,
    melodyTable: AMBIENTE_MELODY_TABLE,
    chordTable: AMBIENTE_CHORD_TABLE,
  },
  cuna: {
    id: "cuna",
    label: "Cuna",
    description: "Melodia simple y suave, acordes tranquilos.",
    cadenceEvery: 4,
    notePool: NOTE_POOL_LIST,
    chordNotePool: CHORD_POOL_LIST,
    melodyTable: CUNA_MELODY_TABLE,
    chordTable: CUNA_CHORD_TABLE,
  },
};

export const GENRE_OPTIONS = Object.values(GENRE_RULES).map((genre) => ({
  id: genre.id,
  label: genre.label,
  description: genre.description,
}));

export function getGenreDefinition(genreId: GenreId): GenreDefinition {
  return GENRE_RULES[genreId];
}
