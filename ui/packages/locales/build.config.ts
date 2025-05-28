import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/index", "src/i18n/index"],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true, // 内联依赖
    preserveDynamicImports: true, // 保留动态导入
  },
});
