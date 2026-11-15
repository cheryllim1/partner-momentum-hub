import { useEffect, useState } from "react";

const PREFIX = "pah-demo:";

/** State that survives page reloads (browser storage). Read after hydration to avoid SSR mismatch. */
export function usePersisted<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try { const s = localStorage.getItem(PREFIX + key); if (s) setV(JSON.parse(s) as T); } catch { /* ignore */ }
    setLoaded(true);
  }, [key]);
  useEffect(() => {
    if (loaded) {
      try { localStorage.setItem(PREFIX + key, JSON.stringify(v)); } catch { /* storage unavailable */ }
    }
  }, [key, v, loaded]);
  return [v, setV] as const;
}

export function resetDemo() {
  Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => localStorage.removeItem(k));
  window.location.reload();
}
