import createCache from "@emotion/cache";
import { createContext } from "react";

export function createEmotionCache() {
  return createCache({ key: "css" });
}

export const ResetCacheContext = createContext<(() => void) | null>(null);

export function EmotionInsertionPoint() {
  return (
    <meta name="emotion-insertion-point" content="emotion-insertion-point" />
  );
}
