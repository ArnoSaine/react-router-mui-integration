import { CacheProvider } from "@emotion/react";
import createEmotionServer, {
  type EmotionCriticalToChunks,
} from "@emotion/server/create-instance";
import { PassThrough, Transform } from "node:stream";
import * as ReactDOMServer from "react-dom/server";
import { createEmotionCache } from "../emotion.tsx";

export * from "react-dom/server";

function modifyMetaTagStream(
  extractCriticalToChunks: (html: string) => EmotionCriticalToChunks
) {
  let buffer = "";
  let stylesInjected = false; // Ensure styles are injected only once
  const metaTagRegex =
    /<meta(\s)*name="emotion-insertion-point"(\s)*content="emotion-insertion-point"(\s)*\/>/;

  return new Transform({
    transform(chunk, encoding, callback) {
      buffer += chunk.toString(); // Collect chunks

      if (!stylesInjected) {
        // Look for a complete `<meta>` tag in the buffer
        const match = metaTagRegex.exec(buffer);
        if (match) {
          // Extract Emotion styles from the accumulated buffer
          const { styles } = extractCriticalToChunks(buffer);

          // Generate the replacement meta tag with Emotion styles
          const replacement = `<meta name="emotion-insertion-point" content="emotion-insertion-point"/>${styles
            .map(
              ({ key, ids, css }) =>
                `<style data-emotion="${key} ${ids.join(" ")}">${css}</style>`
            )
            .join("")}`;

          // Replace the meta tag and mark styles as injected
          buffer = buffer.replace(metaTagRegex, replacement);

          stylesInjected = true;
        }
      }

      // Emit processed content
      this.push(buffer);
      buffer = ""; // Clear buffer after processing
      callback();
    },
    flush(callback) {
      // Emit any remaining data in the buffer
      if (buffer) {
        this.push(buffer);
      }
      callback();
    },
  });
}

export function renderToPipeableStream(
  children: React.ReactNode,
  options: ReactDOMServer.RenderToPipeableStreamOptions
) {
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  const { pipe, abort } = ReactDOMServer.renderToPipeableStream(
    <CacheProvider value={cache}>{children}</CacheProvider>,
    options
  );

  // Create a transformation stream with Emotion styles extraction
  const body = new PassThrough();
  const transformStream = modifyMetaTagStream(extractCriticalToChunks);
  const transformedBody = body.pipe(transformStream);

  return {
    pipe: (stream: PassThrough) => {
      // Pipe the original stream output to `body`
      pipe(body);

      // Pipe the transformed body to the provided stream
      transformedBody.pipe(stream);
    },
    abort,
  };
}
