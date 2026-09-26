// 数据标签与合计 | labels="inside" 把每一段的数写在柱内，totals 在整叠外侧写合计；段太矮放不下时不写
import type { ReactNode } from "react";
import { XhCartesianChartRoot } from "@xihan-ui/react";

const quarters = [
  { quarter: "一季度", online: 42, store: 28, partner: 15 },
  { quarter: "二季度", online: 51, store: 26, partner: 18 },
  { quarter: "三季度", online: 48, store: 31, partner: 9 },
  { quarter: "四季度", online: 63, store: 34, partner: 21 },
];

const series = [
  { mark: "bar", x: "quarter", y: "online", name: "线上", stack: "sales", labels: "inside" },
  { mark: "bar", x: "quarter", y: "store", name: "门店", stack: "sales", labels: "inside" },
  { mark: "bar", x: "quarter", y: "partner", name: "渠道", stack: "sales", labels: "inside" },
] as const;

export default function Demo(): ReactNode {
  return (
    <XhCartesianChartRoot
      data={quarters}
      series={series}
      totals
      caption="各季度销售额（万元）"
    />
  );
}
