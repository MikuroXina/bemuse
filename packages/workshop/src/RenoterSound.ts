import { once } from "lodash";

export class SoundPlayer {
  context = new AudioContext();
  static getInstance = once(() => new SoundPlayer());
  private current = () => {};
  play(promise: Promise<AudioBuffer>) {
    this.current();
    let onKill: (() => void) | undefined = () => {};
    promise.then(async (audioBuffer) => {
      if (!onKill) return;
      const source = this.context.createBufferSource();
      const gain = this.context.createGain();
      source.buffer = audioBuffer;
      source.connect(gain);
      gain.connect(this.context.destination);
      gain.gain.value = 0.5;
      source.start();
      onKill = () => {
        // Fade out
        source.stop(this.context.currentTime + 1);
        gain.gain.setValueAtTime(gain.gain.value, this.context.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.context.currentTime + 1);
      };
    });
    this.current = () => {
      if (onKill) {
        onKill();
        onKill = undefined;
      }
    };
  }
}
