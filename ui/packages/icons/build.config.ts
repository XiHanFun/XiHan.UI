import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [{ input: "src/index" }],
  declaration: true,
  clean: true,
  failOnWarn: false,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
});
