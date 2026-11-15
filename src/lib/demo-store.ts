import { useEffect, useRef, useState } from "react";

const PREFIX = "pah-demo:";

/** State that survives page reloads (browser storage). Read after hydration to avoid SSR mismatch. */
export function usePersisted<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(initial);
  const loaded = useRef(false);
  useEffect(() => {
    try { const s = localStorage.getItem(PREFIX + key); if (s) setV(JSON.parse(s) as T); } catch { /* ignore */ }
    loaded.current = true;
  }, [key]);
  useEffect(() => {
    if (loaded.current) localStorage.setItem(PREFIX + key, JSON.stringify(v));
  }, [key, v]);
  return [v, setV] as const;
}

export function resetDemo() {
  Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => localStorage.removeItem(k));
  window.location.reload();
}
