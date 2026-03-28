import { useEffect, useMemo, useRef, useState } from "react";
import type { GenreId } from "../scripts/genreRules";
import {
  getPulseIntervalForBpm,
  type NoteDuration,
  type TEMPO_OPTIONS,
} from "../scripts/noteDurations";

type MusicCanvasProps = {
  notes: string[];
  chords: string[];
  isPlaying: boolean;
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
  onPlay: () => void;
  onStop: () => void;
  onReset: () => void;
  onChangeGenre: (genre: GenreId) => void;
  onChangeTempo: (bpm: number) => void;
};

const MELODY_NOTE_LANES = [
  "C5",
  "B4",
  "A4",
  "G4",
  "F4",
  "E4",
  "D4",
  "C4",
];

const CHORD_NOTE_LANES = [
  "C4",
  "B3",
  "A3",
  "G3",
  "F3",
  "E3",
  "D3",
  "C3",
];

const STEPS = 320;

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

export default function MusicCanvas({
  notes,
  chords,
  isPlaying,
  currentNote,
  currentChord,
  pulse,
  playbackStartedAtMs,
  melodyDurationSteps,
  genre,
  genres,
  tempo,
  tempos,
  currentDuration,
  durations,
  onPlay,
  onStop,
  onReset,
  onChangeGenre,
  onChangeTempo,
}: MusicCanvasProps) {
  const totalSteps = Math.max(STEPS, notes.length);
  const visibleNotes = notes.slice(-totalSteps);
  const visibleChords = chords.slice(-totalSteps);
  const animationFrameRef = useRef<number | null>(null);
  const playStartTimeRef = useRef<number | null>(null);
  const rollViewportRef = useRef<HTMLDivElement | null>(null);
  const chordRollViewportRef = useRef<HTMLDivElement | null>(null);
  const pulseContainerRef = useRef<HTMLDivElement | null>(null);
  const [playheadX, setPlayheadX] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const CELL_HEIGHT = 44;
  const TRIGGER_X = 0;
  const STEP_WIDTH = 80; // Ancho fijo de cada paso
  const stepWidth = STEP_WIDTH;
  const timelineWidth = STEP_WIDTH * totalSteps;
  const pulseIntervalMs = useMemo(() => getPulseIntervalForBpm(tempo), [tempo]);
  const playheadStep = playheadX / Math.max(1, stepWidth);
  const activePulseIndex = Math.floor(playheadStep) % totalSteps;
  const visualLoopDurationMs = Math.max(
    1,
    (melodyDurationSteps || totalSteps) * pulseIntervalMs,
  );

  useEffect(() => {
    if (!rollViewportRef.current) {
      return;
    }

    const element = rollViewportRef.current;
    const updateSize = () => {
      const nextWidth = element.clientWidth;
      if (nextWidth > 0) {
        setContainerWidth(nextWidth);
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (!isPlaying) {
      const stoppedPulseIndex = pulse > 0 ? (pulse - 1) % totalSteps : 0;
      setPlayheadX(stoppedPulseIndex * stepWidth);
      playStartTimeRef.current = null;
      return;
    }

    playStartTimeRef.current = playbackStartedAtMs ?? performance.now();

    const animate = (now: number) => {
      if (playStartTimeRef.current === null) {
        playStartTimeRef.current = now;
      }

      const elapsedMs = now - playStartTimeRef.current;
      const loopElapsedMs =
        ((elapsedMs % visualLoopDurationMs) + visualLoopDurationMs) %
        visualLoopDurationMs;
      const nextPlayheadX = (loopElapsedMs / pulseIntervalMs) * stepWidth;
      setPlayheadX(nextPlayheadX);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [
    isPlaying,
    playbackStartedAtMs,
    pulseIntervalMs,
    stepWidth,
    totalSteps,
    visualLoopDurationMs,
  ]);

  // Auto-scroll pulse panel
  useEffect(() => {
    if (!pulseContainerRef.current) {
      return;
    }

    const pulseIndex = Math.floor(playheadX / stepWidth);
    const scrollLeft = Math.max(
      0,
      pulseIndex * STEP_WIDTH - containerWidth / 2 + STEP_WIDTH / 2
    );

    pulseContainerRef.current.scrollLeft = scrollLeft;
  }, [playheadX, stepWidth, containerWidth]);

  const noteBlocks: Array<{
    key: string;
    note: string;
    duration: NoteDuration;
    left: number;
    top: number;
    width: number;
  }> = [];

  let timelineCursor = 0;
  for (let idx = 0; idx < visibleNotes.length; idx += 1) {
    const note = visibleNotes[idx];
    if (!note) {
      continue;
    }

    const duration = durations[idx] ?? "4n";
    const durationSteps = durationToSteps(duration);
    const noteLaneIndex = MELODY_NOTE_LANES.indexOf(note);

    if (noteLaneIndex === -1) {
      continue;
    }

    const blockStart = timelineCursor;
    const blockEnd = blockStart + durationSteps;
    timelineCursor = blockEnd;

    if (blockStart >= totalSteps) {
      break;
    }

    const clampedWidthSteps = Math.max(0.25, Math.min(durationSteps, totalSteps - blockStart));
    noteBlocks.push({
      key: `note-${idx}-${note}-${duration}`,
      note,
      duration,
      left: blockStart * stepWidth,
      top: noteLaneIndex * CELL_HEIGHT,
      width: clampedWidthSteps * stepWidth,
    });
  }

  // ========== CHORD BLOCKS ==========
  const chordBlocks: Array<{
    key: string;
    note: string;
    duration: NoteDuration;
    left: number;
    top: number;
    width: number;
  }> = [];

  let chordTimelineCursor = 0;
  for (let idx = 0; idx < visibleChords.length; idx += 1) {
    const chord = visibleChords[idx];
    if (!chord) {
      continue;
    }

    const duration = durations[idx] ?? "4n";
    const durationSteps = durationToSteps(duration);
    const chordLaneIndex = CHORD_NOTE_LANES.indexOf(chord);

    if (chordLaneIndex === -1) {
      continue;
    }

    const blockStart = chordTimelineCursor;
    const blockEnd = blockStart + durationSteps;
    chordTimelineCursor = blockEnd;

    if (blockStart >= totalSteps) {
      break;
    }

    const clampedWidthSteps = Math.max(0.25, Math.min(durationSteps, totalSteps - blockStart));
    chordBlocks.push({
      key: `chord-${idx}-${chord}-${duration}`,
      note: chord,
      duration,
      left: blockStart * stepWidth,
      top: chordLaneIndex * CELL_HEIGHT,
      width: clampedWidthSteps * stepWidth,
    });
  }

  const chordMovingBlocks = useMemo(() => {
    const duplicated = chordBlocks.flatMap((block) => [
      { ...block, key: `${block.key}-a`, rawLeft: block.left - playheadX },
      {
        ...block,
        key: `${block.key}-b`,
        rawLeft: block.left + timelineWidth - playheadX,
      },
    ]);

    return duplicated
      .map((block) => {
        const screenLeft = block.rawLeft;
        const isVisible =
          screenLeft + block.width >= 0 &&
          screenLeft <= containerWidth;
        const isActive =
          isPlaying &&
          screenLeft <= TRIGGER_X &&
          screenLeft + block.width > TRIGGER_X;

        return {
          ...block,
          screenLeft,
          isVisible,
          isActive,
        };
      })
      .filter((block) => block.isVisible);
  }, [isPlaying, chordBlocks, playheadX, timelineWidth, containerWidth]);

  const movingBlocks = useMemo(() => {
    const duplicated = noteBlocks.flatMap((block) => [
      { ...block, key: `${block.key}-a`, rawLeft: block.left - playheadX },
      {
        ...block,
        key: `${block.key}-b`,
        rawLeft: block.left + timelineWidth - playheadX,
      },
    ]);

    return duplicated
      .map((block) => {
        const screenLeft = block.rawLeft;
        const isVisible =
          screenLeft + block.width >= 0 &&
          screenLeft <= containerWidth;
        const isActive =
          isPlaying &&
          screenLeft <= TRIGGER_X &&
          screenLeft + block.width > TRIGGER_X;

        return {
          ...block,
          screenLeft,
          isVisible,
          isActive,
        };
      })
      .filter((block) => block.isVisible);
  }, [isPlaying, noteBlocks, playheadX, timelineWidth, containerWidth]);

  return (
    <section className="music-canvas">
      <div className="music-canvas__container">
        <header className="canvas-header">
          <div className="canvas-header__title-group">
            <h2 className="canvas-header__title">Partitura y Piano Roll</h2>
            <p className="canvas-header__subtitle">Agente Reactivo Simple en ejecucion</p>
          </div>
          <div className="canvas-controls">
            <label className="select-control">
              Genero
              <select
                value={genre}
                onChange={(event) => onChangeGenre(event.target.value as GenreId)}
              >
                {genres.map((genreOption) => (
                  <option key={genreOption.id} value={genreOption.id}>
                    {genreOption.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="select-control">
              Velocidad (BPM)
              <select
                value={tempo}
                onChange={(event) => onChangeTempo(Number(event.target.value))}
              >
                {tempos.map((tempoOption) => (
                  <option key={tempoOption.bpm} value={tempoOption.bpm}>
                    {tempoOption.label} ({tempoOption.bpm} BPM)
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={onPlay}
              disabled={isPlaying}
              className="btn btn-primary"
            >
              Play
            </button>
            <button
              type="button"
              onClick={onStop}
              disabled={!isPlaying}
              className="btn btn-secondary"
            >
              Stop
            </button>
            <button
              type="button"
              onClick={onReset}
              className="btn btn-neutral"
            >
              Reset
            </button>
          </div>
        </header>

        <div className="genre-status">
          Genero activo:{" "}
          <strong>{genres.find((item) => item.id === genre)?.label ?? genre}</strong>
        </div>

        {/* Piano Roll Visualization */}
        <div className="piano-roll">
          <div className="piano-roll__header">Piano Roll</div>
          <div className="piano-roll__container">
            {/* Piano Keys Column */}
            <div className="piano-roll__keys">
              {MELODY_NOTE_LANES.map((note) => (
                <div
                  key={`key-${note}`}
                  className={`piano-roll__key ${
                    note === currentNote && isPlaying ? "piano-roll__key--current" : ""
                  }`}
                >
                  {note}
                </div>
              ))}
            </div>

            {/* Scroll Area */}
            <div ref={rollViewportRef} className="piano-roll__scroll-area">
              <div
                className="piano-roll__grid"
                style={{
                  width: `${timelineWidth}px`,
                  gridTemplateRows: `repeat(${MELODY_NOTE_LANES.length}, 1fr)`,
                  gridTemplateColumns: `repeat(${totalSteps}, ${stepWidth}px)`,
                  height: `${MELODY_NOTE_LANES.length * CELL_HEIGHT}px`,
                  backgroundSize: `${stepWidth}px ${CELL_HEIGHT}px`,
                }}
              >
                <div className="piano-roll__trigger" />
                {/* Note Blocks */}
                {movingBlocks.map((block) => (
                  <div
                    key={block.key}
                    className={`piano-roll__note ${
                      block.isActive ? "piano-roll__note--current" : ""
                    }`}
                    style={{
                      left: "0px",
                      top: "0px",
                      transform: `translate3d(${block.screenLeft}px, ${block.top}px, 0)`,
                      width: `${block.width}px`,
                      height: `${CELL_HEIGHT}px`,
                    }}
                    title={`${block.note} (${block.duration})`}
                  >
                    {block.duration}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status Info */}
          <div className="piano-roll__status">
            <div className="piano-roll__status-item">
              <span className="piano-roll__status-label">Voz 1 (Melodía):</span>
              <span className="piano-roll__status-value">{currentNote}</span>
            </div>
            <div className="piano-roll__status-item">
              <span className="piano-roll__status-label">Voz 2 (Acordes):</span>
              <span className="piano-roll__status-value">{currentChord}</span>
            </div>
            <div className="piano-roll__status-item">
              <span className="piano-roll__status-label">Duracion:</span>
              <span className="piano-roll__status-value">{currentDuration}</span>
            </div>
            <div className="piano-roll__status-item">
              <span className="piano-roll__status-label">Velocidad:</span>
              <span className="piano-roll__status-value">{tempo} BPM</span>
            </div>
            <div className="piano-roll__status-item">
              <span className="piano-roll__status-label">Pulso:</span>
              <span className="piano-roll__status-value">{pulse}</span>
            </div>
          </div>
        </div>

        {/* Piano Roll Visualization - Voz 2 (Acordes) */}
        <div className="piano-roll">
          <div className="piano-roll__header">Piano Roll - Voz 2 (Acordes)</div>
          <div className="piano-roll__container">
            {/* Piano Keys Column */}
            <div className="piano-roll__keys">
              {CHORD_NOTE_LANES.map((note) => (
                <div
                  key={`chord-key-${note}`}
                  className={`piano-roll__key ${
                    note === currentChord && isPlaying ? "piano-roll__key--current" : ""
                  }`}
                >
                  {note}
                </div>
              ))}
            </div>

            {/* Scroll Area */}
            <div ref={chordRollViewportRef} className="piano-roll__scroll-area">
              <div
                className="piano-roll__grid"
                style={{
                  width: `${timelineWidth}px`,
                  gridTemplateRows: `repeat(${CHORD_NOTE_LANES.length}, 1fr)`,
                  gridTemplateColumns: `repeat(${totalSteps}, ${stepWidth}px)`,
                  height: `${CHORD_NOTE_LANES.length * CELL_HEIGHT}px`,
                  backgroundSize: `${stepWidth}px ${CELL_HEIGHT}px`,
                }}
              >
                <div className="piano-roll__trigger" />
                {/* Chord Blocks */}
                {chordMovingBlocks.map((block) => (
                  <div
                    key={block.key}
                    className={`piano-roll__note piano-roll__note--chord ${
                      block.isActive ? "piano-roll__note--current" : ""
                    }`}
                    style={{
                      left: "0px",
                      top: "0px",
                      transform: `translate3d(${block.screenLeft}px, ${block.top}px, 0)`,
                      width: `${block.width}px`,
                      height: `${CELL_HEIGHT}px`,
                    }}
                    title={`${block.note} (${block.duration})`}
                  >
                    {block.duration}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pulse Panel */}
        <div className="pulse-panel">
          <div className="pulse-header">Pulso</div>
          <div ref={pulseContainerRef} className="pulse-container">
            <div style={{ width: `${timelineWidth}px` }} className="pulse-grid">
              {Array.from({ length: totalSteps }).map((_, idx) => {
                const beat = idx + 1;
                const isCurrentBeat = isPlaying && idx === activePulseIndex;
                return (
                  <div
                    key={beat}
                    style={{ width: `${STEP_WIDTH}px` }}
                    className={`pulse-cell ${
                      isCurrentBeat ? "pulse-cell--active" : ""
                    }`}
                  >
                    {beat}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
