// 配色方案 | 祖先写上 data-xh-chart-palette 整套换掉分类色槽：主题单色随品牌色由深到浅，柔和品牌、莫兰迪柔彩各是一套；写在 html 上即全站生效
import type { ReactNode } from "react";
import { XhCartesianChartRoot, XhRadioGroupRoot } from "@xihan-ui/react";
import { useState } from "react";

const quarters = [
  { quarter: "一季度", north: 42, east: 51, south: 38, west: 26 },
  { quarter: "二季度", north: 48, east: 56, south: 41, west: 30 },
  { quarter: "三季度", north: 45, east: 62, south: 47, west: 33 },
  { quarter: "四季度", north: 57, east: 68, south: 52, west: 37 },
];

const series = [
  { mark: "bar", x: "quarter", y: "north", name: "华北" },
  { mark: "bar", x: "quarter", y: "east", name: "华东" },
  { mark: "bar", x: "quarter", y: "south", name: "华南" },
  { mark: "bar", x: "quarter", y: "west", name: "西部" },
] as const;

const schemes = [
  { value: "categorical", label: "多彩分类" },
  { value: "monochrome", label: "主题单色" },
  { value: "brand", label: "柔和品牌" },
  { value: "muted", label: "莫兰迪柔彩" },
];

export default function Demo(): ReactNode {
  const [scheme, setScheme] = useState<string | null>("monochrome");
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-3)", justifyItems: "start", width: "100%" }}>
      <XhRadioGroupRoot
        variant="segmented"
        value={scheme}
        onValueChange={details => setScheme(details.value)}
        collection={schemes}
        aria-label="配色方案"
      />
      <div data-xh-chart-palette={scheme ?? undefined} style={{ width: "100%" }}>
        <XhCartesianChartRoot data={quarters} series={series} caption="各区域季度销售额（万元）" />
      </div>
    </div>
  );
}
