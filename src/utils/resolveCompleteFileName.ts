import fs from "node:fs/promises";
import path from "node:path";

export default async function resolveCompleteFileName(
  directory: string,
  baseName: string,
  extensions = [".tsx", ".ts", ".jsx", ".js"]
) {
  for (const ext of extensions) {
    const fullPath = path.join(directory, `${baseName}${ext}`);
    try {
      await fs.access(fullPath); // Check if the file exists and is accessible
      return fullPath; // Return the first matching file
    } catch {
      // Ignore errors and continue checking the next extension
    }
  }
}
