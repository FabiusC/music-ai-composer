import { useState } from "react";
import MusicCanvas from "./components/MusicCanvas";
import Sidebar, { type AgentKind } from "./components/Sidebar";
import { useSimpleAgent } from "./hooks/useSimpleAgent";

export default function App() {
  const [selectedAgent, setSelectedAgent] = useState<AgentKind>("simple-reactive");
  const {
    notes,
    chords,
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
    isPlaying,
    play,
    stop,
    reset,
    setGenre,
    setTempo,
  } = useSimpleAgent();

  return (
    <main className="app-container">
      <Sidebar selectedAgent={selectedAgent} onSelectAgent={setSelectedAgent} />

      <MusicCanvas
        notes={notes}
        chords={chords}
        currentNote={currentNote}
        currentChord={currentChord}
        pulse={pulse}
        playbackStartedAtMs={playbackStartedAtMs}
        melodyDurationSteps={melodyDurationSteps}
        genre={genre}
        genres={genres}
        tempo={tempo}
        tempos={tempos}
        currentDuration={currentDuration}
        durations={durations}
        isPlaying={isPlaying}
        onPlay={play}
        onStop={stop}
        onReset={reset}
        onChangeGenre={setGenre}
        onChangeTempo={setTempo}
      />
    </main>
  );
}
