// Áudio experimental: usa apenas uma voz japonesa disponível no navegador.
export function kanaText(card) {
  const text = typeof card?.front === "string" ? card.front.trim() : "";
  return /^[\u3041-\u3096\u30a1-\u30fa\u30fc]+$/u.test(text) ? text : "";
}
export function japaneseVoices(voices = []) {
  return voices.filter((v) => /^ja(?:[-_]|$)/i.test(v.lang));
}
export function createSpeaker({ synth, Utterance, notify = () => {} } = {}) {
  let generation = 0;
  let utterance;
  const supported = !!(synth && Utterance);
  function cancel() {
    generation++;
    if (supported) synth.cancel();
    utterance = null;
  }
  function status() {
    if (!supported) return "Este navegador não oferece síntese de voz.";
    const voice = japaneseVoices(synth.getVoices())[0];
    return voice ? `Voz japonesa: ${voice.name}.` : "Nenhuma voz japonesa disponível. Verifique as vozes do navegador ou instale uma voz japonesa no dispositivo.";
  }
  async function speak(text, { quiet = false } = {}) {
    if (!kanaText({ front: text })) return false;
    cancel();
    const request = generation;
    const report = (message) => { if (!quiet) notify(message); };
    if (!supported) { report(status()); return false; }
    let voice = japaneseVoices(synth.getVoices())[0];
    if (!voice) {
      await new Promise((resolve) => {
        const done = () => { clearTimeout(timer); synth.removeEventListener("voiceschanged", done); resolve(); };
        const timer = setTimeout(done, 1200);
        synth.addEventListener("voiceschanged", done);
      });
      if (request !== generation) return false;
      voice = japaneseVoices(synth.getVoices())[0];
    }
    if (!voice) { report(status()); return false; }
    try {
      utterance = new Utterance(text);
      utterance.lang = "ja-JP";
      utterance.voice = voice;
      utterance.rate = 0.85;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onerror = (e) => {
        if (request === generation && !["canceled", "interrupted"].includes(e.error))
          report("Não foi possível reproduzir a pronúncia. Tente novamente pelo botão Ouvir.");
      };
      synth.speak(utterance);
      return true;
    } catch {
      report("Não foi possível reproduzir a pronúncia neste navegador.");
      return false;
    }
  }
  return { speak, cancel, status };
}
