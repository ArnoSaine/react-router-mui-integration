import { type Plugin } from "vite";
import { readPackageJson } from "./utils/module.ts";

export default function mui(): Plugin {
  return {
    name: "mui",
    config: async () => ({
      resolve: {
        alias: {
          ...((await readPackageJson("@mui/system")).version < "6.1.0"
            ? { "@mui/icons-material": "@mui/icons-material/esm" }
            : undefined),
          ...((await readPackageJson("@mui/system")).version < "6"
            ? { "@mui/system": "@mui/system/esm" }
            : undefined),
        },
      },
      ssr: {
        // For MUI Components (Error: Element type is invalid)
        noExternal: ["@mui/*"],
      },
    }),
  };
}
