# react-router-mui-integration

Integration of React Router and Material UI (MUI).

## Setup

To integrate, add the **React Router Preset** to your `react-router.config.ts` and the **Vite Plugin** to your `vite.config.ts`.

### `react-router.config.ts`

```ts
import type { Config } from "@react-router/dev/config";
import mui from "react-router-mui-integration/preset"; // 👈

export default {
  // SPA mode is also available
  // ssr: false,
  presets: [
    mui(/* options */), // 👈
  ],
} satisfies Config;
```

### `vite.config.ts`

```ts
import { reactRouter } from "@react-router/dev/vite";
import mui from "react-router-mui-integration/vite"; // 👈
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    reactRouter(),
    tsconfigPaths(),
    mui(), // 👈
  ],
});
```

## Router Integration

By default, the application includes the [Router Integration](https://mui.com/material-ui/integrations/routing/#global-theme-link) in its theme. This allows you to use the `href` prop for internal links directly:

```tsx
import { Button, Link } from "@mui/material";

// Example Usage

<Link href="/about" color="secondary">
  Go to the About page
</Link>;

<Button variant="contained" href="/">
  Go to the Main page
</Button>;
```

### Disabling Router Integration

To disable the Router Integration, set the `linkBehavior` preset option to `false`:

```ts
presets: [mui({ linkBehavior: false })];
```

---

## Custom Theme with Router Integration

For a custom MUI theme with Router Integration, replace `createTheme` from `@mui/material` with the `createTheme` provided by `react-router-mui-integration/mui`:

```ts
import { green } from "@mui/material/colors";
import { createTheme } from "react-router-mui-integration/mui";

const customTheme = createTheme({
  palette: {
    primary: {
      main: green[500],
    },
  },
});
```

## Options

### React Router Preset

| Option                   | Type      | Description                                                                                        | Default Value                                                                    |
| ------------------------ | --------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `cssBaseline`            | `boolean` | Inserts [`<CSSBaseline />`](https://mui.com/material-ui/react-css-baseline/).                      | `true`                                                                           |
| `linkBehavior`           | `boolean` | Enables [Router Integration](https://mui.com/material-ui/integrations/routing/#global-theme-link). | `true`                                                                           |
| `emotionInsertionPoint`  | `boolean` | Inserts [`<EmotionInsertionPoint />`](src/emotion.tsx) meta tag for SSR.                           | `true`                                                                           |
| `defaultEntryClientFile` | `string`  | Specifies the location of `entry.client.tsx` if not present in the app directory.                  | Absolute path of `@react-router/dev/dist/config/defaults/entry.client.tsx`.      |
| `defaultEntryServerFile` | `string`  | Specifies the location of `entry.server.tsx` if not present in the app directory.                  | Absolute path of `@react-router/dev/dist/config/defaults/entry.server.node.tsx`. |
