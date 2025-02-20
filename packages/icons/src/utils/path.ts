import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

export function getDirname(importMetaUrl: string): string {
  return dirname(fileURLToPath(importMetaUrl));
}

export function getIconPath(importMetaUrl: string, relativePath: string): string {
  return resolve(getDirname(importMetaUrl), relativePath);
}
