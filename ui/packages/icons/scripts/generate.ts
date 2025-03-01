import { resolve } from "path";
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "fs";
import { optimize, type Config } from "svgo";
import { icons } from "../src/source";
import { ASSETS_DIR, ICONS_DIR } from "../src/utils/path";
import { stringFormatUtils } from "@xihan-ui/utils";

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
      console.log("正在生成", iconSet.id, "...");
      for (const content of iconSet.contents) {
        const iconPath = resolve(ASSETS_DIR, iconSet.source.localName, iconSet.source.remoteDir);
        const iconFilePaths = readdirSync(iconPath).filter(file => file.endsWith(".svg"));
        // 转换每个SVG文件
        for (const filePath of iconFilePaths) {
          const name = content.formatter(filePath.replace(".svg", ""));
          // 导出名称为大驼峰命名
          // gi_abstract_017 => GiAbstract017
          const exportName = stringFormatUtils.toPascalCase(name);
          // 声明名称为中划线命名
          const declareName = stringFormatUtils.toKebabCase(name);
          // 文件路径名称为下划线命名
          const iconFilePathName = stringFormatUtils.toSnakeCase(name);

          const svgContent = readFileSync(resolve(iconPath, filePath), "utf-8");

          const result = optimize(svgContent, svgoConfig);
          if ("data" in result) {
            const path = result.data.match(/d="([^"]+)"/)?.[1] || "";
            const iconContent = `
import { createIcon } from "../../utils/creator";

export const ${exportName} = createIcon({
  name: "${declareName}",
  path: "${path}",
});
`;
            const iconDir = resolve(ICONS_DIR, iconSet.id);
            ensureDir(iconDir);
            writeFileSync(resolve(iconDir, `${iconFilePathName}.ts`), iconContent);
          }
        }
      }
    }

    // 生成索引文件
    const indexContent = `${icons
      .map(iconSet => iconSet.contents.map(content => `export * from "./${iconSet.id}/*";`).join("\n"))
      .join("\n")}`;

    writeFileSync(resolve(ICONS_DIR, "index.ts"), indexContent);

    console.log("Icons generated successfully!");
  } catch (error) {
    console.error("Error generating icons:", error);
    process.exit(1);
  }
}

generate();
