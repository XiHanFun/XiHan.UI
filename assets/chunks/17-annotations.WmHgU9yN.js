var e=`// 参考线、参考带与极值点 | annotations 在数据之外画出目标、正常区间与最高的那一天，读者不用自己去比
import type { ReactNode } from "react";
import { XhCartesianChartRoot } from "@xihan-ui/react";

const latency = [
  { day: "周一", p95: 182 },
  { day: "周二", p95: 176 },
  { day: "周三", p95: 241 },
  { day: "周四", p95: 198 },
  { day: "周五", p95: 169 },
  { day: "周六", p95: 152 },
  { day: "周日", p95: 158 },
];

const series = [{ mark: "line", x: "day", y: "p95", name: "P95 延迟" }] as const;

// 参考线与参考带的值计入数值轴：目标 250 比数据都高，也画得出来
const annotations = [
  { kind: "band", axis: "y", from: 150, to: 200, label: "常态" },
  { kind: "line", axis: "y", value: 250, label: "目标 250ms" },
  { kind: "point", series: "p95", at: "max" },
] as const;

export default function Demo(): ReactNode {
  return (
    <XhCartesianChartRoot
      data={latency}
      series={series}
      annotations={annotations}
      yAxis={{ title: "毫秒" }}
      caption="接口 P95 延迟"
    />
  );
}
`;export{e as default};