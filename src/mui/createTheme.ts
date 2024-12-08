import * as mui from "@mui/material";
import { deepmerge } from "@mui/utils";
import { theme } from "./theme.tsx";

export const createTheme = (...themes: Parameters<typeof mui.createTheme>) =>
  themes.length
    ? mui.createTheme(
        deepmerge(theme, themes[0]),
        ...(themes as mui.ThemeOptions[]).slice(1)
      )
    : mui.createTheme(theme);
