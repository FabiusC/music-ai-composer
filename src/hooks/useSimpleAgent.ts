import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SimpleReactiveAgent } from "../agents/SimpleReactiveAgent";
import { GENRE_OPTIONS, type GenreId } from "../scripts/genreRules";
import { PolySynthEngine } from "../services/audioEngine";
import {
  TEMPO_OPTIONS,
  DEFAULT_TEMPO,
  type NoteDuration,
} from "../scripts/noteDurations";

type UseSimpleAgentReturn = {
  notes: string[];
  chords: string[];
  currentNote: string;
  currentChord: string;
  pulse: number;
  playbackStartedAtMs: number | null;
  melodyDurationSteps: number;
  genre: GenreId;
  genres: { id: GenreId; label: string; description: string }[];
  tempo: number;
  tempos: typeof TEMPO_OPTIONS;
  currentDuration: NoteDuration;
  durations: NoteDuration[];
  isPlaying: boolean;
  play: () => Promise<void>;
  stop: () => void;
  reset: () => void;
  setGenre: (genre: GenreId) => void;
  setTempo: (bpm: number) => void;
};

const MAX_NOTES_ON_ROLL = 320;
const DEFAULT_NOTE = "C4";
const NOTE_DURATION = "4n";
const EMPTY_NOTE = "";

const createEmptyNotes = () =>
  Array.from({ length: MAX_NOTES_ON_ROLL }, () => EMPTY_NOTE);
const createDefaultDurations = () =>
  Array.from(
    { length: MAX_NOTES_ON_ROLL },
    () => NOTE_DURATION as NoteDuration,
  );

const durationToSteps = (duration: NoteDuration): number => {
  switch (duration) {
    case "1n":
      return 4;
    case "2n":
      return 2;
    case "4n":
      return 1;
    case "8n":
      return 0.5;
    case "16n":
      return 0.25;
    case "32n":
      return 0.125;
    default:
      return 1;
  }
};

export function useSimpleAgent(): UseSimpleAgentReturn {
  const [notes, setNotes] = useState<string[]>(createEmptyNotes);
  const [chords, setChords] = useState<string[]>(createEmptyNotes);
  const [currentNote, setCurrentNote] = useState(DEFAULT_NOTE);
  const [currentChord, setCurrentChord] = useState("C3");
  const [currentDuration, setCurrentDuration] = useState<NoteDuration>(
    NOTE_DURATION as NoteDuration,
  );
  const [durations, setDurations] = useState<NoteDuration[]>(
    createDefaultDurations,
  );
  const [pulse, setPulse] = useState(0);
  const [playbackStartedAtMs, setPlaybackStartedAtMs] = useState<number | null>(
    null,
  );
  const [genre, setGenreState] = useState<GenreId>("pop");
  const [tempo, setTempoState] = useState(DEFAULT_TEMPO.bpm);
  const [isPlaying, setIsPlaying] = useState(false);

  const agent = useMemo(() => new SimpleReactiveAgent(), []);
  const synth = useMemo(() => new PolySynthEngine(), []);

  const timerRef = useRef<number | null>(null);
  const loopRef = useRef<number | null>(null);
  const pulseRef = useRef(0);
  const currentNoteRef = useRef(DEFAULT_NOTE);
  const currentChordRef = useRef("C3");

  const buildMelody = useCallback(() => {
    const generatedNotes = createEmptyNotes();
    const generatedChords = createEmptyNotes();
    const generatedDurations = createDefaultDurations();
    let noteCursor = DEFAULT_NOTE;
    let chordCursor = "C3";

    agent.reset();
    agent.setGenre(genre);

    for (let index = 0; index < MAX_NOTES_ON_ROLL; index += 1) {
      const sequencePulse = index + 1;
      agent.setPulse(sequencePulse);
      const nextNote = agent.getNextNote(noteCursor);
      const nextChord = agent.getNextChord(chordCursor);
      const nextDuration = agent.getNextNoteDuration();
      generatedNotes[index] = nextNote;
      generatedChords[index] = nextChord;
      generatedDurations[index] = nextDuration;
      noteCursor = nextNote;
      chordCursor = nextChord;
    }

    currentNoteRef.current = generatedNotes[0] || DEFAULT_NOTE;
    currentChordRef.current = generatedChords[0] || "C3";
    setCurrentNote(currentNoteRef.current);
    setCurrentChord(currentChordRef.current);
    setCurrentDuration(
      generatedDurations[0] || (NOTE_DURATION as NoteDuration),
    );
    setNotes(generatedNotes);
    setChords(generatedChords);
    setDurations(generatedDurations);
  }, [agent, genre]);

  const scheduleCycle = useCallback(
    (pulseIntervalMs: number, baseTimeSeconds: number) => {
      let timelineSteps = 0;

      for (let index = 0; index < MAX_NOTES_ON_ROLL; index += 1) {
        const note = notes[index];
        const chord = chords[index];
        if (!note && !chord) {
          continue;
        }

        const duration = durations[index] || (NOTE_DURATION as NoteDuration);
        const durationSteps = durationToSteps(duration);
        const startSeconds = (timelineSteps * pulseIntervalMs) / 1000;
        const durationSeconds = Math.max(
          0.05,
          (durationSteps * pulseIntervalMs) / 1000,
        );

        if (note) {
          synth.trigger(note, durationSeconds, baseTimeSeconds + startSeconds);
        }
        if (chord) {
          synth.trigger(chord, durationSeconds, baseTimeSeconds + startSeconds);
        }

        if (note || chord) {
          timelineSteps += durationSteps;
        }
      }
    },
    [chords, durations, notes, synth],
  );

  const reset = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (loopRef.current !== null) {
      window.clearInterval(loopRef.current);
      loopRef.current = null;
    }

    synth.hardStop();
    pulseRef.current = 0;
    currentNoteRef.current = DEFAULT_NOTE;
    currentChordRef.current = "C3";
    setPulse(0);
    setPlaybackStartedAtMs(null);
    setCurrentNote(DEFAULT_NOTE);
    setCurrentChord("C3");
    setCurrentDuration(NOTE_DURATION as NoteDuration);
    setIsPlaying(false);
    buildMelody();
  }, [buildMelody, synth]);

  const play = useCallback(async () => {
    if (isPlaying) {
      return;
    }

    await synth.startAudioContext();
    pulseRef.current = 0;
    setPulse(0);
    const startedAt = performance.now();
    setPlaybackStartedAtMs(startedAt);
    setIsPlaying(true);

    const tempoOption =
      TEMPO_OPTIONS.find((t) => t.bpm === tempo) || DEFAULT_TEMPO;

    const melodyDurationSteps = notes.reduce((total, note, index) => {
      if (!note) {
        return total;
      }
      const duration = durations[index] || (NOTE_DURATION as NoteDuration);
      return total + durationToSteps(duration);
    }, 0);
    const loopDurationMs = Math.max(
      1,
      melodyDurationSteps * tempoOption.pulseIntervalMs,
    );
    let baseTime = synth.now();
    scheduleCycle(tempoOption.pulseIntervalMs, baseTime);

    loopRef.current = window.setInterval(() => {
      baseTime = synth.now();
      scheduleCycle(tempoOption.pulseIntervalMs, baseTime);
    }, loopDurationMs);

    timerRef.current = window.setInterval(() => {
      pulseRef.current += 1;
      const currentPulse = pulseRef.current;
      const stepIndex = (currentPulse - 1) % MAX_NOTES_ON_ROLL;
      setPulse(currentPulse);

      const nextNote = notes[stepIndex] || DEFAULT_NOTE;
      const nextChord = chords[stepIndex] || "C3";
      const nextDuration =
        durations[stepIndex] || (NOTE_DURATION as NoteDuration);
      currentNoteRef.current = nextNote;
      currentChordRef.current = nextChord;
      setCurrentNote(nextNote);
      setCurrentChord(nextChord);
      setCurrentDuration(nextDuration);
    }, tempoOption.pulseIntervalMs);
  }, [buildMelody, durations, isPlaying, notes, scheduleCycle, synth, tempo]);

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (loopRef.current !== null) {
      window.clearInterval(loopRef.current);
      loopRef.current = null;
    }
    synth.hardStop();
    setPlaybackStartedAtMs(null);
    setIsPlaying(false);
  }, [synth]);

  const setGenre = useCallback(
    (nextGenre: GenreId) => {
      setGenreState(nextGenre);
      agent.setGenre(nextGenre);
      reset();
    },
    [agent, reset],
  );

  const setTempo = useCallback((bpm: number) => {
    setTempoState(bpm);
  }, []);

  useEffect(() => {
    buildMelody();
  }, [buildMelody]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const melodyDurationSteps = useMemo(
    () =>
      notes.reduce((total, note, index) => {
        if (!note) {
          return total;
        }

        const duration = durations[index] || (NOTE_DURATION as NoteDuration);
        return total + durationToSteps(duration);
      }, 0),
    [durations, notes],
  );

  return {
    notes,
    chords,
    currentNote,
    currentChord,
    pulse,
    playbackStartedAtMs,
    melodyDurationSteps,
    genre,
    genres: GENRE_OPTIONS,
    tempo,
    tempos: TEMPO_OPTIONS,
    currentDuration,
    durations,
    isPlaying,
    play,
    stop,
    reset,
    setGenre,
    setTempo,
  };
}
