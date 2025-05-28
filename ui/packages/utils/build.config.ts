import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    "src/index",
    "src/browser/index",
    "src/core/index",
    "src/data/index",
    "src/device/index",
    "src/dom/index",
    "src/file/index",
    "src/performance/index",
    "src/security/index",
    "src/testing/index",
    "src/vue/index",
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true, // 内联依赖
    preserveDynamicImports: true, // 保留动态导入
  },
});
