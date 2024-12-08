import type { Preset } from "@react-router/dev/config";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { WithMUIOptions } from "./mui/withMUI.tsx";
import memoize from "./utils/fs/memoize.ts";
import { resolvePackageJson } from "./utils/module.ts";
import parseExports from "./utils/parseExports.ts";
import resolveCompleteFileName from "./utils/resolveCompleteFileName.ts";

export interface Options extends WithMUIOptions {
  defaultEntryClientFile?: string;
  defaultEntryServerFile?: string;
}

const configDefaultsDirName = path.join(
  path.dirname(resolvePackageJson("@react-router/dev")),
  "dist/config/defaults"
);

export default function mui({
  cssBaseline,
  linkBehavior,
  emotionInsertionPoint,
  defaultEntryClientFile = path.join(configDefaultsDirName, "entry.client.tsx"),
  defaultEntryServerFile = path.join(
    configDefaultsDirName,
    "entry.server.node.tsx"
  ),
}: Options = {}): Preset {
  const withMUIOptions = JSON.stringify({
    cssBaseline: cssBaseline!,
    linkBehavior: linkBehavior!,
    emotionInsertionPoint: emotionInsertionPoint!,
  } satisfies Required<WithMUIOptions>);

  return {
    name: "mui",
    async reactRouterConfig({ reactRouterUserConfig }) {
      const cacheDirURL = new URL("./.cache", import.meta.url);

      const appDirectory =
        reactRouterUserConfig.appDirectory ?? process.cwd() + "/app";

      const appDirectoryDigest = createHash("sha512")
        .update(appDirectory)
        .digest("base64url")
        .slice(0, 10);

      const app = {
        root: (await resolveCompleteFileName(appDirectory, "root"))!,
        routes: (await resolveCompleteFileName(appDirectory, "routes"))!,
        entryClient: await resolveCompleteFileName(
          appDirectory,
          "entry.client"
        ),
        entryServer: await resolveCompleteFileName(
          appDirectory,
          "entry.server"
        ),
      };

      const proxyDirectory = `${cacheDirURL.pathname}/${appDirectoryDigest}`;
      const proxy = {
        root: `${proxyDirectory}/root.tsx`,
        routes: `${proxyDirectory}/routes.ts`,
        entryClient: `${proxyDirectory}/entry.client.tsx`,
        entryServer: `${proxyDirectory}/entry.server.tsx`,
      };

      const rootExports = await parseExports(app.root);
      const componentExports = ["default", "ErrorBoundary", "HydrateFallback"];
      const hasLayout = rootExports.includes("Layout");

      await memoize(
        async () => {
          await fs.mkdir(proxyDirectory, { recursive: true });

          await fs.writeFile(
            proxy.root,
            `import { withMUI } from "react-router-mui-integration/mui";
import * as root from "${appDirectory}/root";

export {
  ${rootExports.filter(
    hasLayout
      ? (identifier) => identifier !== "Layout"
      : (identifier) => !componentExports.includes(identifier)
  ).join(`,
`)}
} from "${appDirectory}/root";

${
  hasLayout
    ? `export const Layout = withMUI(root.Layout, "Layout", ${withMUIOptions});`
    : rootExports
        .filter((identifier) => componentExports.includes(identifier))
        .map(
          (identifier) =>
            `export ${
              identifier === "default" ? "default" : `const ${identifier} =`
            } withMUI(root.${identifier}, "${
              identifier === "default" ? "App" : identifier
            }", ${withMUIOptions});`
        ).join(`

`)
}
`
          );

          await fs.writeFile(
            proxy.routes,
            `import mapRoutes from "react-router-mui-integration/mapRoutes";
import routes from "${appDirectory}/routes";

export default mapRoutes(routes, (route) => ({
  ...route,
  file: \`${appDirectory}/\${route.file}\`,
}));
`
          );

          // Proxy client and server entries

          const entryClient = await fs.readFile(
            app.entryClient ?? defaultEntryClientFile,
            "utf-8"
          );
          const entryServer = await fs.readFile(
            app.entryServer ?? defaultEntryServerFile,
            "utf-8"
          );

          await fs.writeFile(
            proxy.entryClient,
            entryClient.replaceAll(
              "react-router/dom",
              "react-router-mui-integration/react-router/dom"
            )
          );
          await fs.writeFile(
            proxy.entryServer,
            entryServer.replaceAll(
              "react-dom/server",
              "react-router-mui-integration/react-dom/server"
            )
          );
        },
        {
          name: "Create React Router proxy for MUI",
          outputs: Object.values(proxy),
          inputs: Object.values(app).filter(Boolean) as string[],
          dependencies: [withMUIOptions, ...rootExports],
        }
      );

      return {
        ...reactRouterUserConfig,
        appDirectory: proxyDirectory,
      };
    },
  };
}
