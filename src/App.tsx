import { useEffect, useMemo, useState } from "react";
import MusicCanvas from "./components/MusicCanvas";
import Sidebar, { type AgentKind } from "./components/Sidebar";
import { useSimpleAgent } from "./hooks/useSimpleAgent";
import { useModelBasedAgent } from "./hooks/useModelBasedAgent";

export default function App() {
  const [selectedAgent, setSelectedAgent] = useState<AgentKind>("simple-reactive");
  const simpleAgent = useSimpleAgent();
  const modelAgent = useModelBasedAgent();

  useEffect(() => {
    if (selectedAgent === "model-based") {
      simpleAgent.stop();
      return;
    }

    modelAgent.stop();
  }, [modelAgent, selectedAgent, simpleAgent]);

  const activeAgent = useMemo(
    () =>
      selectedAgent === "model-based"
        ? modelAgent
        : simpleAgent,
    [modelAgent, selectedAgent, simpleAgent],
  );

  const agentLabel =
    selectedAgent === "model-based"
      ? "Agente Basado en Modelos"
      : "Agente Reactivo Simple";

  return (
    <main className="app-container">
      <Sidebar selectedAgent={selectedAgent} onSelectAgent={setSelectedAgent} />

      <MusicCanvas
        notes={activeAgent.notes}
        chords={activeAgent.chords}
        currentNote={activeAgent.currentNote}
        currentChord={activeAgent.currentChord}
        pulse={activeAgent.pulse}
        playbackStartedAtMs={activeAgent.playbackStartedAtMs}
        melodyDurationSteps={activeAgent.melodyDurationSteps}
        genre={activeAgent.genre}
        genres={activeAgent.genres}
        tempo={activeAgent.tempo}
        tempos={activeAgent.tempos}
        currentDuration={activeAgent.currentDuration}
        durations={activeAgent.durations}
        isPlaying={activeAgent.isPlaying}
        agentLabel={agentLabel}
        recommendationTitle={
          selectedAgent === "model-based"
            ? modelAgent.recommendation.title
            : undefined
        }
        recommendationReason={
          selectedAgent === "model-based"
            ? modelAgent.recommendation.reason
            : undefined
        }
        onLike={
          selectedAgent === "model-based"
            ? () => modelAgent.sendFeedback("like")
            : undefined
        }
        onSkip={
          selectedAgent === "model-based"
            ? () => modelAgent.sendFeedback("skip")
            : undefined
        }
        onSave={
          selectedAgent === "model-based"
            ? () => modelAgent.sendFeedback("save")
            : undefined
        }
        onClearMemory={
          selectedAgent === "model-based"
            ? () => modelAgent.clearStoredMemory()
            : undefined
        }
        onPlay={activeAgent.play}
        onStop={activeAgent.stop}
        onReset={activeAgent.reset}
        onChangeGenre={activeAgent.setGenre}
        onChangeTempo={activeAgent.setTempo}
      />
    </main>
  );
}
