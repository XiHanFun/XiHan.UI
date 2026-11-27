// 基础用法 | 只写根组件就按标准结构铺出标题、起止两组日期段与日历浮层
import type { ReactNode } from "react";
import { XhDateRangePickerRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return <XhDateRangePickerRoot label="行程日期" locale="zh-CN" name="trip-start" endName="trip-end" />;
}
