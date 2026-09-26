// 实心饼 | variant="pie" 去掉中心的空洞；扇区装得下时把占比写在扇区里
import type { ReactNode } from "react";
import { XhPieChartRoot } from "@xihan-ui/react";

// labels="inside" 把占比写在扇区里，装不下的扇区不写
const rows = [
  { channel: "搜索", visits: 4200 },
  { channel: "直接访问", visits: 2600 },
  { channel: "社交", visits: 1800 },
  { channel: "邮件", visits: 900 },
  { channel: "广告", visits: 500 },
];

export default function Demo(): ReactNode {
  return (
    <XhPieChartRoot
      data={rows}
      nameField="channel"
      valueField="visits"
      variant="pie"
      labels="inside"
      caption="访问来源"
    />
  );
}
