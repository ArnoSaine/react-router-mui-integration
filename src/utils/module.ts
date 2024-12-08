import fs from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export const readPackageJson = async (name: string) =>
  JSON.parse(await fs.readFile(resolvePackageJson(name), "utf-8"));

export const resolvePackageJson = (name: string) =>
  require.resolve(`${name}/package.json`);
