import {
  type ExportDeclaration,
  type ExportDefaultDeclaration,
  type ExportNamedDeclaration,
  parse,
} from "@swc/core";
import fs from "node:fs/promises";

export default async function parseExports(file: string) {
  const { body } = await parse(await fs.readFile(file, "utf-8"), {
    syntax: "typescript",
    tsx: true,
  });

  return (
    body.filter(({ type }) =>
      [
        "ExportDeclaration",
        "ExportDefaultDeclaration",
        "ExportNamedDeclaration",
      ].includes(type)
    ) as (
      | ExportDeclaration
      | ExportDefaultDeclaration
      | ExportNamedDeclaration
    )[]
  ).flatMap((item) => {
    if (item.type === "ExportDefaultDeclaration") {
      return "default";
    }

    if (item.type === "ExportNamedDeclaration") {
      return item.specifiers.map((specifier) => {
        if (specifier.type === "ExportSpecifier") {
          const identifier = specifier.exported ?? specifier.orig;
          return identifier.value;
        }

        if (specifier.type === "ExportDefaultSpecifier") {
          return "default";
        }

        console.error(specifier);
        throw Error("Unknown export namespace specifier");
      });
    }

    if (item.declaration.type === "FunctionDeclaration") {
      return item.declaration.identifier.value;
    }

    if (item.declaration.type === "VariableDeclaration") {
      return item.declaration.declarations
        .map(({ id }) => id)
        .filter((id) => id.type === "Identifier")
        .map((id) => id.value);
    }

    console.error(item);
    throw Error("Unknown export declaration");
  });
}
