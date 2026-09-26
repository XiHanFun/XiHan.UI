const n=`// 基础用法 | 一行数据一个扇区：nameField 取扇区名字段，valueField 取数值字段；缺省画成环形，中心显示合计
import type { ReactNode } from "react";
import { XhPieChartRoot } from "@xihan-ui/react";

// 缺省按数值从大到小、自 12 点顺时针排列，外侧标签带引导线
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
      caption="访问来源"
    />
  );
}
`;export{n as default};
