// 纹理 | 祖先写上 data-xh-chart-patterns，柱改用纹理、折线换线型，图例画成同一副；强制色与打印下总是这样
import type { ReactNode } from "react";
import { XhCartesianChartRoot, XhSwitch } from "@xihan-ui/react";
import { useState } from "react";

const quarters = [
  { quarter: "一季度", online: 42, store: 28, target: 75 },
  { quarter: "二季度", online: 51, store: 26, target: 80 },
  { quarter: "三季度", online: 48, store: 31, target: 85 },
  { quarter: "四季度", online: 63, store: 34, target: 90 },
];

const series = [
  { mark: "bar", x: "quarter", y: "online", name: "线上", stack: "sales" },
  { mark: "bar", x: "quarter", y: "store", name: "门店", stack: "sales" },
  { mark: "line", x: "quarter", y: "target", name: "目标" },
] as const;

export default function Demo(): ReactNode {
  const [patterns, setPatterns] = useState(true);

  return (
    <div style={{ display: "grid", gap: "var(--xh-space-4)", width: "100%" }}>
      <label style={{ display: "flex", alignItems: "center", gap: "var(--xh-space-2)" }}>
        <XhSwitch checked={patterns} onCheckedChange={details => setPatterns(details.checked)} />
        纹理
      </label>
      <div data-xh-chart-patterns={patterns ? "" : undefined}>
        <XhCartesianChartRoot data={quarters} series={series} caption="各渠道季度销售额与目标（万元）" />
      </div>
    </div>
  );
}
