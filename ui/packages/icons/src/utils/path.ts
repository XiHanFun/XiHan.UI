import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// 源图标库目录
export const ASSETS_DIR = resolve(getDirname(import.meta.url), "../../node_modules/icons-assets");
// 图标目录
export const ICONS_DIR = resolve(getDirname(import.meta.url), "../icons");
// 源图标库目录
export const SOURCE_DIR = resolve(getDirname(import.meta.url), "../source");

/**
 * 获取目录名
 * @param importMetaUrl 导入元 URL
 * @returns 目录名
 */
export function getDirname(importMetaUrl: string): string {
  return dirname(fileURLToPath(importMetaUrl));
}

/**
 * 获取图标路径
 * @param relativePath 相对路径
 * @returns 图标路径
 */
export function getIconPath(relativePath: string): string {
  return resolve(ASSETS_DIR, relativePath);
}

/**
 * 获取源图标库路径
 * @param relativePath 相对路径
 * @returns 源图标库路径
 */
export function getSourcePath(relativePath: string): string {
  return resolve(SOURCE_DIR, relativePath);
}
