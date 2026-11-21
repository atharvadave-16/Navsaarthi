const TAGS = { en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN', gu: 'gu-IN' }

/** Reads text aloud. Returns false if the browser has no speech support. */
export function speak(text, lang = 'en') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = TAGS[lang] || 'en-IN'
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang === u.lang)
  if (voice) u.voice = voice
  window.speechSynthesis.speak(u)
  return true
}

export const hasVoice = (lang) =>
  typeof window !== 'undefined' && 'speechSynthesis' in window &&
  window.speechSynthesis.getVoices().some((v) => v.lang.startsWith((TAGS[lang] || 'en-IN').slice(0, 2)))
