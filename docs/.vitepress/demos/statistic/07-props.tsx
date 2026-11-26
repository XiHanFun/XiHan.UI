// props 写法 | 不写结构时按标准结构铺：标签、数值与涨跌几项写出一块统计数，单位放进 suffix 插槽；数值按当前语言分组
import type { ReactNode } from "react";
import { XhStatisticRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return <XhStatisticRoot label="本月新增用户" value={12480} suffix="人" trend="up" trendText="同比 12.4%" />;
}
