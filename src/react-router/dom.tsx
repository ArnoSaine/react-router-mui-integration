import { CacheProvider } from "@emotion/react";
import { useCallback, useState } from "react";
import * as ReactRouterDom from "react-router/dom";
import { createEmotionCache, ResetCacheContext } from "../emotion.tsx";

export * from "react-router/dom";

export function HydratedRouter() {
  const [cache, setCache] = useState(createEmotionCache);

  const resetCache = useCallback(() => setCache(createEmotionCache()), []);

  return (
    <ResetCacheContext.Provider value={resetCache}>
      <CacheProvider value={cache}>
        <ReactRouterDom.HydratedRouter />
      </CacheProvider>
    </ResetCacheContext.Provider>
  );
}
