import * as Tone from "tone";

export class PolySynthEngine {
  private synth = this.createSynth();

  private createSynth(): Tone.PolySynth {
    return new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.02, decay: 0.2, sustain: 0.45, release: 0.8 },
    }).toDestination();
  }

  async startAudioContext(): Promise<void> {
    await Tone.start();
  }

  now(): number {
    return Tone.now();
  }

  trigger(
    note: string,
    duration: Tone.Unit.Time = "8n",
    time?: Tone.Unit.Time,
  ): void {
    this.synth.triggerAttackRelease(note, duration, time);
  }

  stopAll(): void {
    this.synth.releaseAll();
  }

  hardStop(): void {
    this.synth.releaseAll();
    this.synth.dispose();
    this.synth = this.createSynth();
  }
}
