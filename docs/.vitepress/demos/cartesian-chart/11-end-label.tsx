// 线尾标签 | endLabel 把系列名与末值写在线尾，末端挨着时上下推开；折线不多时读者不用对照图例
import type { ReactNode } from "react";
import { XhCartesianChartRoot } from "@xihan-ui/react";

const months = [
  { month: "一月", web: 820, ios: 540, android: 610 },
  { month: "二月", web: 760, ios: 580, android: 650 },
  { month: "三月", web: 910, ios: 640, android: 720 },
  { month: "四月", web: 880, ios: 700, android: 760 },
  { month: "五月", web: 950, ios: 760, android: 840 },
  { month: "六月", web: 1010, ios: 830, android: 900 },
];

const series = [
  { mark: "line", x: "month", y: "web", name: "网页", endLabel: true },
  { mark: "line", x: "month", y: "ios", name: "iOS", endLabel: true },
  { mark: "line", x: "month", y: "android", name: "Android", endLabel: true },
] as const;

export default function Demo(): ReactNode {
  return <XhCartesianChartRoot data={months} series={series} caption="各端月活跃用户（千人）" />;
}
