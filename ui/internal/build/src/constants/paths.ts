import { resolve } from "path";

export const projRoot = resolve(__dirname, "..", "..", "..", "..");

// packages
export const pkgRoot = resolve(projRoot, "packages");
export const utilsRoot = resolve(pkgRoot, "utils");
export const constantsRoot = resolve(pkgRoot, "constants");
export const hooksRoot = resolve(pkgRoot, "hooks");
export const iconsRoot = resolve(pkgRoot, "icons");
export const directivesRoot = resolve(pkgRoot, "directives");
export const localesRoot = resolve(pkgRoot, "locales");
export const themesRoot = resolve(pkgRoot, "themes");
export const componentsRoot = resolve(pkgRoot, "components");
export const xihanuiRoot = resolve(pkgRoot, "xihan-ui");
// internal
export const internalRoot = resolve(projRoot, "internal");
export const buildRoot = resolve(internalRoot, "build");
export const devRoot = resolve(internalRoot, "dev");
// playground
export const playgroundRoot = resolve(projRoot, "playground");
// dist
export const outDir = resolve(projRoot, "dist");

// 包配置
const PACKAGE_JSON = resolve("package.json");
export const utilsPackage = resolve(utilsRoot, PACKAGE_JSON);
export const constantsPackage = resolve(constantsRoot, PACKAGE_JSON);
export const hooksPackage = resolve(hooksRoot, PACKAGE_JSON);
export const iconsPackage = resolve(iconsRoot, PACKAGE_JSON);
export const directivesPackage = resolve(directivesRoot, PACKAGE_JSON);
export const localesPackage = resolve(localesRoot, PACKAGE_JSON);
export const themesPackage = resolve(themesRoot, PACKAGE_JSON);
export const componentsPackage = resolve(componentsRoot, PACKAGE_JSON);
export const xihanuiPackage = resolve(xihanuiRoot, PACKAGE_JSON);

// 入口
const SRC_TS_ENTRY = resolve("src", "index.ts");
const SRC_SCSS_ENTRY = resolve("src", "index.scss");
export const utilsEntry = resolve(utilsRoot, SRC_TS_ENTRY);
export const constantsEntry = resolve(constantsRoot, SRC_TS_ENTRY);
export const hooksEntry = resolve(hooksRoot, SRC_TS_ENTRY);
export const iconsEntry = resolve(iconsRoot, SRC_TS_ENTRY);
export const directivesEntry = resolve(directivesRoot, SRC_TS_ENTRY);
export const localesEntry = resolve(localesRoot, SRC_TS_ENTRY);
export const themesEntry = resolve(themesRoot, SRC_SCSS_ENTRY);
export const componentsEntry = resolve(componentsRoot, SRC_TS_ENTRY);
export const xihanuiEntry = resolve(xihanuiRoot, SRC_TS_ENTRY);
