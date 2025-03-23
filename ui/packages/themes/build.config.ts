import { defineBuildConfig } from "unbuild";
import scss from "rollup-plugin-scss";

export default defineBuildConfig({
  entries: ["src/index"],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
  hooks: {
    "rollup:options"(ctx, options) {
      options.plugins = [
        ...(options.plugins || []),
        scss({
          fileName: "index.css",
          outputStyle: "compressed",
          sourceMap: true,
          watch: ctx.options.stub ? "**/*.scss" : undefined,
        }),
      ];
    },
  },
});
