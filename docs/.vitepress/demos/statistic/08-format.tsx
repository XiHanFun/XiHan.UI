// 格式化 | formatOptions 原样交给 Intl.NumberFormat：货币、百分比与紧凑记数都按当前语言的写法输出
import type { ReactNode } from "react";
import { XhStatisticRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "32px" }}>
      <XhStatisticRoot label="本月营收" value={1284500.5} formatOptions={{ style: "currency", currency: "CNY" }} />
      <XhStatisticRoot label="转化率" value={0.0384} formatOptions={{ style: "percent", minimumFractionDigits: 1 }} />
      <XhStatisticRoot label="累计访问" value={3218000} formatOptions={{ notation: "compact" }} />
    </div>
  );
}
