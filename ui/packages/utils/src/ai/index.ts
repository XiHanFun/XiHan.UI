/**
 * AI与机器学习工具集
 */

export * from "./classification";
export * from "./sentiment";
export * from "./embedding";
export * from "./vision";
export * from "./llm";

import classification from "./classification";
import sentiment from "./sentiment";
import embedding from "./embedding";
import vision from "./vision";
import llm from "./llm";

// 创建命名空间对象
export const ai = {
  classification,
  sentiment,
  embedding,
  vision,
  llm,
};

// 默认导出命名空间对象
export default ai;
