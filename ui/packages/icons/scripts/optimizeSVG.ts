import { optimize } from "svgo";

export const optimizeSVG = (svg: string) => {
  try {
    return optimize(svg, {
      plugins: [
        // 使用预设配置，保留重要属性
        {
          name: "preset-default",
          params: {
            overrides: {
              // 不移除 viewBox，对图标缩放很重要
              removeViewBox: false,
              // 移除注释
              removeComments: {
                preservePatterns: false,
              },
            },
          },
        },
        // 额外的优化插件
        {
          name: "cleanupIds",
          params: {
            preserve: ["icon", "logo", "brand"],
          },
        },
        // 移除特定属性
        {
          name: "removeAttrs",
          params: {
            elemSeparator: "^",
            attrs: ["data.*", "version", "svg^aria-label", "svg^class", "xmlns:xlink"],
          },
        },
      ],
      // 启用多轮优化
      multipass: true,
      // 设置浮点精度
      floatPrecision: 3,
      // 添加错误处理配置
      js2svg: {
        // 保持格式化，便于调试
        pretty: false,
        // 缩进设置
        indent: 0,
      },
    });
  } catch (error) {
    console.warn(`SVG 优化失败，返回原始内容:`, error instanceof Error ? error.message : error);
    // 如果优化失败，返回原始 SVG
    return {
      data: svg,
      info: {
        width: undefined,
        height: undefined,
      },
    };
  }
};
