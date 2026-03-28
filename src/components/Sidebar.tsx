import type { ComponentType } from "react";
import { BrainCircuit, Goal, Sparkles, Wrench, Zap } from "lucide-react";

export type AgentKind =
  | "simple-reactive"
  | "model-based"
  | "goal-based"
  | "utility-based"
  | "learning";

type AgentMenuItem = {
  id: AgentKind;
  title: string;
  subtitle: string;
  enabled: boolean;
  icon: ComponentType<{ className?: string }>;
};

type SidebarProps = {
  selectedAgent: AgentKind;
  onSelectAgent: (agent: AgentKind) => void;
};

const AGENTS: AgentMenuItem[] = [
  {
    id: "simple-reactive",
    title: "Agente Reactivo Simple",
    subtitle: "Percepcion -> Reglas -> Accion",
    enabled: true,
    icon: Zap,
  },
  {
    id: "model-based",
    title: "Basado en Modelos",
    subtitle: "Estado interno del entorno",
    enabled: false,
    icon: BrainCircuit,
  },
  {
    id: "goal-based",
    title: "Basado en Objetivos",
    subtitle: "Planificacion de frases musicales",
    enabled: false,
    icon: Goal,
  },
  {
    id: "utility-based",
    title: "Basado en Utilidad",
    subtitle: "Evaluacion de satisfaccion armonica",
    enabled: false,
    icon: Wrench,
  },
  {
    id: "learning",
    title: "Agente de Aprendizaje",
    subtitle: "Ajuste por retroalimentacion",
    enabled: false,
    icon: Sparkles,
  },
];

export default function Sidebar({ selectedAgent, onSelectAgent }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <h1 className="sidebar__title">Composicion IA</h1>
        <p className="sidebar__subtitle">Arquitectura de agentes modulares</p>
      </div>

      <div className="sidebar__info-box">
        Solo el Agente Reactivo Simple esta habilitado en esta fase.
      </div>

      <nav className="sidebar__nav">
        {AGENTS.map((agent) => {
          const Icon = agent.icon;
          const isSelected = selectedAgent === agent.id;

          return (
            <button
              key={agent.id}
              type="button"
              disabled={!agent.enabled}
              className={`sidebar__nav-item ${
                agent.enabled
                  ? ""
                  : "sidebar__nav-item--disabled"
              } ${isSelected ? "sidebar__nav-item--selected" : ""}`}
              onClick={() => onSelectAgent(agent.id)}
            >
              <div className="sidebar__nav-item-content">
                <div className="sidebar__nav-item-left">
                  <Icon className="sidebar__nav-item-icon" />
                  <div className="sidebar__nav-item-text">
                    <p className="sidebar__nav-item-title">{agent.title}</p>
                    <p className="sidebar__nav-item-subtitle">{agent.subtitle}</p>
                  </div>
                </div>
                <div className="sidebar__nav-item-right">
                  {!agent.enabled && (
                    <span className="sidebar__nav-item-badge">
                      Proximamente
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
