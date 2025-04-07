/**
 * 国际化与本地化工具集
 */

export * from "./currency";
export * from "./number";
export * from "./date";
export * from "./rtl";
export * from "./pluralization";

import currency from "./currency";
import number from "./number";
import date from "./date";
import rtl from "./rtl";
import pluralization from "./pluralization";

// 创建命名空间对象
export const i18n = {
  currency,
  date,
  number,
  rtl,
  pluralization,
};

// 默认导出命名空间对象
export default i18n;
