import { defineBuildConfig } from "unbuild";
import { resolve } from "path";
import { execSync } from "child_process";
export default defineBuildConfig({
  entries: [{ input: "src/index" }],
  declaration: true,
  clean: true,
  failOnWarn: false,
  hooks: {
    "build:done": ctx => {
      const srcFile = resolve(__dirname, "src/index.scss");
      const outFile = resolve(ctx.options.outDir, "styles", "index.css");
      execSync(`npx sass ${srcFile}:${outFile} --style=compressed`, { stdio: "inherit" });
      console.log("SCSS 编译完成!");
    },
  },
});
