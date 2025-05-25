import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// 源图标库目录
export const SOURCE_DIR = resolve(getDirname(import.meta.url), "./source");
// 图标包目录
export const SOURCE_PACKS_DIR = resolve(getDirname(import.meta.url), "../node_modules/packs");
// 图标目录
export const ICONS_PACKS_DIR = resolve(getDirname(import.meta.url), "../packs");
// type 目录
export const TYPES_DIR = resolve(getDirname(import.meta.url), "../types");

/**
 * 获取目录名
 * @param importMetaUrl 导入元 URL
 * @returns 目录名
 */
export function getDirname(importMetaUrl: string): string {
  return dirname(fileURLToPath(importMetaUrl));
}
