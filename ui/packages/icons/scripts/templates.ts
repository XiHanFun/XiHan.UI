/**
 * 自动生成模板
 * @returns 自动生成模板内容
 */
export const autoGenerateTemplate = "// 此文件由脚本自动生成，请勿手动修改\n";

/**
 * package.json 模板
 * @returns package.json 模板内容
 */
export const indexPackageJsonTemplate =
  JSON.stringify(
    {
      main: "./index.mjs",
      module: "./index.mjs",
      types: "./index.d.ts",
      sideEffects: false,
    },
    null,
    2,
  ) + "\n";

/**
 * index.d.ts 导入模板
 * @returns index.d.ts 导入模板内容
 */
export const indexDefImportTemplate = `${autoGenerateTemplate}
import type { IconDefinition, IconSetInfo } from "../../types";\n`;

/**
 * index.d.ts 模板
 * @param exportName 图标名称
 * @returns index.d.ts 模板内容
 */
export const indexDtsTemplate = (exportName: string): string => {
  return `export declare const ${exportName}: IconDefinition;\n`;
};

/**
 * index.d.ts 图标集元信息
 * @param exportName 图标集名称
 * @returns 图标集元信息内容
 */
export const indexSetInfoDtsTemplate = (exportName: string): string => {
  return `export declare const ${exportName}Info: IconSetInfo;\n`;
};

/**
 * index.mjs 导入模板
 * @returns index.mjs 导入模板内容
 */
export const indexMjsImportTemplate = `${autoGenerateTemplate}\n`;

/**
 * index.mjs 模板
 * @param exportName 图标名称
 * @returns index.mjs 模板内容
 */
export const indexMjsTemplate = (exportName: string, data: any): string => {
  return `export const ${exportName} = ${JSON.stringify(data)};\n`;
};

/**
 * index.mjs 图标集元信息
 * @param exportName 图标集名称
 * @param iconSetInfo 图标集信息
 * @returns index.mjs 图标集元信息内容
 */
export const indexSetInfoMjsTemplate = (exportName: string, iconSetInfo: object): string => {
  return `export const ${exportName}Info = ${JSON.stringify(iconSetInfo, null, 2)};\n`;
};

/**
 * 图标集索引文件
 * @param iconSetId 图标集 ID
 * @param iconSetName 图标集名称
 * @returns 图标集索引文件内容
 */
export const indexTemplate = (iconSetId: string, iconSetName: string): string => {
  return `${autoGenerateTemplate}
/**
 * ${iconSetName} 图标集
 */
export * from "./${iconSetId}";
`;
};

/**
 * 主索引文件
 * @param iconSets 图标集列表
 * @returns 主索引文件内容
 */
export const mainIndexTemplate = (iconSets: Array<{ id: string; name: string }>): string => {
  const exports = iconSets.map(icon => `export * from "./${icon.id}";`).join("\n");

  return `${autoGenerateTemplate}
/**
 * XiHan UI Icons
 * 所有图标的统一导出
 */
${exports}
`;
};
