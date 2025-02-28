import { resolve } from "path";
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "fs";
import { optimize, type Config } from "svgo";
import { getDirname } from "../src/utils/path";
import { icons } from "../src";

// 修改路径以匹配实际结构
const ASSETS_DIR = resolve(getDirname(import.meta.url), "../assets");
const ICONS_DIR = resolve(getDirname(import.meta.url), "../src/icons");

// SVG优化配置
const svgoConfig: Config = {
  plugins: [
    {
      name: "removeAttrs",
      params: {
        attrs: "(fill|stroke|stroke-width)",
      },
    },
    {
      name: "removeViewBox",
      active: false,
    } as any, // 临时解决类型错误
  ],
  // 添加必要的配置
  multipass: true,
  floatPrecision: 3,
  js2svg: {
    indent: 2,
    pretty: true,
  },
};

// 确保目录存在
function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

// 主函数
async function generate() {
  try {
    ensureDir(ICONS_DIR);

    // 处理每个图标集
    for (const iconSet of icons) {
      for (const content of iconSet.contents) {
        const svgFiles = readdirSync(resolve(ASSETS_DIR, iconSet.path)).filter(file => file.endsWith(".svg"));

        // 转换每个SVG文件
        for (const file of svgFiles) {
          const name = content.formatter(file.replace(".svg", ""));
          const svgPath = resolve(ASSETS_DIR, iconSet.path, file);
          const svgContent = readFileSync(svgPath, "utf-8");

          const result = optimize(svgContent, svgoConfig);
          if ("data" in result) {
            const path = result.data.match(/d="([^"]+)"/)?.[1] || "";
            const iconContent = `
import { createIcon } from "../utils/creator";

export const ${name} = createIcon({
  name: "${name}",
  path: "${path}",
});
`;
            writeFileSync(resolve(ICONS_DIR, `${name}.ts`), iconContent);
          }
        }
      }
    }

    // 生成索引文件
    const indexContent = `
${icons
  .map(iconSet => iconSet.contents.map(content => `export * from "./${content.formatter("*")}";`).join("\n"))
  .join("\n")}
`;
    writeFileSync(resolve(ICONS_DIR, "index.ts"), indexContent);

    console.log("Icons generated successfully!");
  } catch (error) {
    console.error("Error generating icons:", error);
    process.exit(1);
  }
}

generate();
