import { reactRouter } from "@react-router/dev/vite";
import mui from "react-router-mui-integration/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths(), mui()],
});
