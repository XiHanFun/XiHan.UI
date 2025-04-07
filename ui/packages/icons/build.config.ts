import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [{ input: "src/index" }],
  declaration: true,
  clean: true,
  failOnWarn: false,
  rollup: {
    emitCJS: true,
    inlineDependencies: true, // 内联依赖
    preserveDynamicImports: true, // 保留动态导入
  },
});
