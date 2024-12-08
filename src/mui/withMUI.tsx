import { withEmotionCache } from "@emotion/react";
import {
  CssBaseline,
  ThemeProvider,
  unstable_useEnhancedEffect as useEnhancedEffect,
} from "@mui/material";
import {
  Children,
  cloneElement,
  type ComponentType,
  isValidElement,
  useContext,
} from "react";
import _warnOnce from "warn-once";
import { EmotionInsertionPoint, ResetCacheContext } from "../emotion.tsx";
import { createTheme } from "./createTheme.ts";

export interface WithMUIOptions {
  cssBaseline?: boolean;
  linkBehavior?: boolean;
  emotionInsertionPoint?: boolean;
}

const warnOnce = _warnOnce as any;

const theme = createTheme();

export function withMUI<Props extends object>(
  Component: ComponentType<Props>,
  name: "Layout" | "App" | "ErrorBoundary" | "HydrateFallback",
  {
    cssBaseline = true,
    linkBehavior = true,
    emotionInsertionPoint = true,
  }: WithMUIOptions = {}
) {
  return withEmotionCache((props: Props, emotionCache) => {
    const resetCache = useContext(ResetCacheContext);

    // Only executed on client
    useEnhancedEffect(() => {
      // re-link sheet container
      emotionCache.sheet.container = document.head;
      // re-inject tags
      const tags = emotionCache.sheet.tags;
      emotionCache.sheet.flush();
      tags.forEach((tag) => {
        (emotionCache.sheet as any)._insertTag(tag);
      });

      warnOnce(
        !resetCache,
        "`<ResetCacheContext>` not found. This may indicate that `entry.client.tsx` was not correctly proxied for MUI."
      );

      // reset cache to reapply global styles
      resetCache?.();
    }, []);

    //const children = <Component {...props} />;
    let children = (Component as any)(props);

    warnOnceIncorrectHeadElement(
      children,
      name,
      cssBaseline,
      emotionInsertionPoint
    );

    children = cloneElement(children, {
      children: Children.map(children.props.children, (child) =>
        child.type === "head"
          ? cloneElement(child, {
              children: (
                <>
                  {cssBaseline && <CssBaseline />}
                  {child.props.children}
                  {emotionInsertionPoint && <EmotionInsertionPoint />}
                </>
              ),
            })
          : child
      ),
    });

    return linkBehavior ? (
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    ) : (
      children
    );
  });
}

function warnOnceIncorrectHeadElement(
  children: any,
  name: string,
  cssBaseline: boolean,
  emotionInsertionPoint: boolean
) {
  if (!cssBaseline && !emotionInsertionPoint) {
    return;
  }
  const components: string[] = [];
  const options: string[] = [];
  if (cssBaseline) {
    components.push("`<CssBaseline />`");
    options.push("`cssBaseline: false`");
  }
  if (emotionInsertionPoint) {
    components.push("`<EmotionInsertionPoint />`");
    options.push("`emotionInsertionPoint: false`");
  }

  const formatter = new Intl.ListFormat("en", {
    style: "long",
    type: "conjunction",
  });

  warnOnce(
    !Children.toArray(children.props.children).some(
      (child) => isValidElement(child) && child.type === "head"
    ),
    `\`<head>\` tag not found in the returned elements of the ${name} component. ${formatter.format(
      components
    )} could not be inserted. To fix this, either:

1. Return \`<html><head>...</head><body>...</body></html>\` directly from Layout, or
2. Add ${formatter.format(components)} manually.

To suppress this warning, set the preset options:
${formatter.format(options as string[])}.

 `
  );
}
