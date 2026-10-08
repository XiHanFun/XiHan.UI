var e=`// 同步平移缩放 | 两张图接到同一份受控的 view：在任一张上缩放、平移，另一张跟着到同一处，对照着看两个时段
import type { GraphView } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { XhGraphChartRoot } from "@xihan-ui/react";
import { useState } from "react";

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

// 两个时段的链路：上周核心 B 还挂在核心 A 下面
const lastWeek = [
  { source: "wan", target: "fw" },
  { source: "fw", target: "core-a" },
  { source: "core-a", target: "core-b" },
  { source: "core-a", target: "acc-1" },
  { source: "core-a", target: "acc-2" },
  { source: "core-b", target: "acc-3" },
  { source: "core-a", target: "acc-4" },
];

const thisWeek = [
  { source: "wan", target: "fw" },
  { source: "fw", target: "core-a" },
  { source: "fw", target: "core-b" },
  { source: "core-a", target: "acc-1" },
  { source: "core-a", target: "acc-2" },
  { source: "core-b", target: "acc-3" },
  { source: "core-b", target: "acc-4" },
];

export default function Demo(): ReactNode {
  // 一份视图两张图共用：写回之后两张图一起动
  const [view, setView] = useState<GraphView>({ k: 1, x: 0, y: 0 });
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-6)", width: "100%" }}>
      <XhGraphChartRoot
        view={view}
        onViewChange={details => setView(details.view)}
        nodes={devices}
        links={lastWeek}
        layout="preset"
        zoom={true}
        caption="上周的链路"
      />
      <XhGraphChartRoot
        view={view}
        onViewChange={details => setView(details.view)}
        nodes={devices}
        links={thisWeek}
        layout="preset"
        zoom={true}
        caption="本周的链路"
      />
    </div>
  );
}
`;export{e as default};