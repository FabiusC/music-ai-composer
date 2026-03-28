import type { InternalModelState } from "../types/modelBasedAgent";

const STORAGE_KEY = "music-composer-model-state";

export function saveModelState(state: InternalModelState): void {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.warn("Error saving model state to localStorage:", error);
  }
}

export function loadModelState(): InternalModelState | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return null;
    }

    const parsed = JSON.parse(serialized) as InternalModelState;
    return parsed;
  } catch (error) {
    console.warn("Error loading model state from localStorage:", error);
    return null;
  }
}

export function clearModelState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Error clearing model state from localStorage:", error);
  }
}

export function createInitialModelState(): InternalModelState {
  return {
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
  };
}
