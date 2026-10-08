var e=`// 预设坐标 | layout="preset" 按节点上写的 x / y 摆放，整体等比缩放进绘图区：机房拓扑这类位置本身有含义的图用它
import type { ReactNode } from "react";
import { XhGraphChartRoot } from "@xihan-ui/react";

// 坐标取自机柜图：单位随意，纵轴向下
const devices = [
  { id: "wan", name: "公网", group: "出口", x: 300, y: 0 },
  { id: "fw", name: "防火墙", group: "出口", x: 300, y: 70 },
  { id: "core-a", name: "核心 A", group: "核心", x: 180, y: 150 },
  { id: "core-b", name: "核心 B", group: "核心", x: 420, y: 150 },
  { id: "acc-1", name: "接入 1", group: "接入", x: 60, y: 250 },
  { id: "acc-2", name: "接入 2", group: "接入", x: 240, y: 250 },
  { id: "acc-3", name: "接入 3", group: "接入", x: 360, y: 250 },
  { id: "acc-4", name: "接入 4", group: "接入", x: 540, y: 250 },
];

const cables = [
  { source: "wan", target: "fw" },
  { source: "fw", target: "core-a" },
  { source: "fw", target: "core-b" },
  { source: "core-a", target: "core-b" },
  { source: "core-a", target: "acc-1" },
  { source: "core-a", target: "acc-2" },
  { source: "core-b", target: "acc-3" },
  { source: "core-b", target: "acc-4" },
];

export default function Demo(): ReactNode {
  return (
    <XhGraphChartRoot
      nodes={devices}
      links={cables}
      layout="preset"
      caption="机房网络拓扑"
    />
  );
}
`;export{e as default};