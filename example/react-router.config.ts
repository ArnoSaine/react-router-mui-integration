import type { Config } from "@react-router/dev/config";
import mui from "react-router-mui-integration/preset";

export default {
  // ssr: false,
  presets: [mui()],
} satisfies Config;
