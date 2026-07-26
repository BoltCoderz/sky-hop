// Sky Hop ships with fully synthesized audio (oscillators + simple envelopes)
// instead of shipping binary mp3/ogg files. This keeps the whole game inside
// pure JS/HTML/CSS as requested, while still giving every listed sound
// effect and a looping music bed. Swap `playTone`/`playMusic` internals for
// `scene.sound.add('key').play()` later if real audio assets are supplied.
export default class AudioManager {
  constructor(save) {
    this.save = save;
    this.ctx = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.musicNodes = [];
    this.musicTimer = null;
    this.currentMusic = null;
  }

  _ensureCtx() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    this.musicGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.musicGain.connect(this.ctx.destination);
    this.sfxGain.connect(this.ctx.destination);
    this._applyVolumes();
  }

  /** Must be called from a user gesture (tap/click) to unlock audio on mobile. */
  unlock() {
    this._ensureCtx();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  _applyVolumes() {
    if (!this.ctx) return;
    const s = this.save.data.settings;
    this.musicGain.gain.value = s.musicOn ? 0.35 : 0;
    this.sfxGain.gain.value = s.sfxOn ? 0.6 : 0;
  }

  setMusicOn(on) { this.save.data.settings.musicOn = on; this.save.persist(); this._applyVolumes(); }
  setSfxOn(on) { this.save.data.settings.sfxOn = on; this.save.persist(); this._applyVolumes(); }

  /** One-shot tone/blip with a quick envelope. type: sine/square/triangle/sawtooth */
  _blip(freq, dur, type = 'sine', gainPeak = 0.5, glide = 0) {
    this._ensureCtx();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (glide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + glide), t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(gainPeak, t0 + Math.min(0.02, dur * 0.2));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(this.sfxGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  _chord(freqs, dur, type = 'sine', gainPeak = 0.35) {
    freqs.forEach(f => this._blip(f, dur, type, gainPeak));
  }

  play(name) {
    switch (name) {
      case 'jump': this._blip(420, 0.12, 'square', 0.35, 260); break;
      case 'land': this._blip(180, 0.09, 'sine', 0.3, -60); break;
      case 'coin': this._blip(880, 0.09, 'square', 0.3, 260); break;
      case 'gem': this._chord([1046, 1318], 0.18, 'triangle', 0.28); break;
      case 'powerup': this._chord([523, 659, 784], 0.25, 'sawtooth', 0.22); break;
      case 'enemyHit': this._blip(120, 0.25, 'sawtooth', 0.4, -80); break;
      case 'buttonClick': this._blip(600, 0.05, 'square', 0.25); break;
      case 'unlock': this._chord([523, 659, 784, 1046], 0.35, 'triangle', 0.3); break;
      case 'combo': this._blip(700, 0.12, 'triangle', 0.3, 340); break;
      case 'explosion': this._blip(90, 0.4, 'sawtooth', 0.45, -70); break;
      case 'rocket': this._blip(200, 0.5, 'sawtooth', 0.3, 320); break;
      case 'shield': this._blip(520, 0.2, 'sine', 0.3, 120); break;
      case 'countdown': this._blip(440, 0.15, 'square', 0.3); break;
      case 'highscore': this._chord([784, 988, 1175, 1568], 0.5, 'triangle', 0.32); break;
      case 'perfect': this._blip(988, 0.15, 'triangle', 0.32, 200); break;
      case 'spring': this._blip(300, 0.15, 'sine', 0.35, 400); break;
      case 'break': this._blip(150, 0.2, 'sawtooth', 0.3, -100); break;
      default: this._blip(440, 0.1, 'sine', 0.25);
    }
  }

  /** Generative ambient loop; `mood` picks a scale/tempo so menu vs gameplay
   *  vs game-over each feel distinct without needing separate audio files. */
  playMusic(mood = 'menu') {
    this._ensureCtx();
    if (this.currentMusic === mood) return;
    this.stopMusic();
    this.currentMusic = mood;

    const scales = {
      menu:     { notes: [523, 587, 659, 784, 880], tempo: 520, type: 'triangle' },
      gameplay: { notes: [440, 523, 587, 659, 784], tempo: 340, type: 'square' },
      gameover: { notes: [392, 349, 330, 294], tempo: 620, type: 'sine' },
      victory:  { notes: [523, 659, 784, 1046, 1318], tempo: 260, type: 'triangle' },
    };
    const cfg = scales[mood] || scales.menu;
    let i = 0;
    const step = () => {
      if (this.currentMusic !== mood) return;
      const freq = cfg.notes[i % cfg.notes.length] * (Math.random() < 0.15 ? 0.5 : 1);
      this._musicNote(freq, cfg.tempo / 1000, cfg.type);
      i++;
      this.musicTimer = setTimeout(step, cfg.tempo);
    };
    step();
  }

  _musicNote(freq, dur, type) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(0.18, t0 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(this.musicGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  stopMusic() {
    this.currentMusic = null;
    if (this.musicTimer) clearTimeout(this.musicTimer);
    this.musicTimer = null;
  }
}
