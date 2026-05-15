'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

// Voice priority: best first
function pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const en = voices.filter((v) => v.lang.startsWith('en'));
  if (!en.length) return null;

  const checks: ((v: SpeechSynthesisVoice) => boolean)[] = [
    // macOS Enhanced / Premium (highest quality local)
    (v) => v.lang === 'en-US' && /(enhanced|premium)/i.test(v.name),
    // Google neural voices in Chrome (cloud, very natural)
    (v) => /google/i.test(v.name) && v.lang === 'en-US',
    (v) => /google/i.test(v.name) && v.lang.startsWith('en'),
    // Known high-quality Apple voices
    (v) => /^(Samantha|Alex|Karen|Moira|Veena|Siri)/.test(v.name),
    // Any cloud/non-local en-US
    (v) => v.lang === 'en-US' && !v.localService,
    // Any en-US
    (v) => v.lang === 'en-US',
    // Any English
    (v) => v.lang.startsWith('en'),
  ];

  for (const check of checks) {
    const found = en.find(check);
    if (found) return found;
  }
  return en[0];
}

let cachedVoice: SpeechSynthesisVoice | null | undefined = undefined; // undefined = not yet resolved

function resolveVoice(): Promise<SpeechSynthesisVoice | null> {
  return new Promise((resolve) => {
    if (cachedVoice !== undefined) {
      resolve(cachedVoice);
      return;
    }
    const attempt = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length) {
        cachedVoice = pickBestVoice(voices);
        resolve(cachedVoice);
      }
    };
    attempt();
    if (cachedVoice === undefined) {
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        attempt();
        resolve(cachedVoice ?? null);
      }, { once: true });
      // Fallback timeout in case event never fires
      setTimeout(() => {
        if (cachedVoice === undefined) {
          cachedVoice = null;
          resolve(null);
        }
      }, 2000);
    }
  });
}

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Pre-warm voice resolution on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      resolveVoice();
    }
  }, []);

  const speak = useCallback(async (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const voice = await resolveVoice();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.88;
    utterance.pitch = 1;
    utterance.volume = 1;
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, []);

  return { speak, stop, speaking };
}
