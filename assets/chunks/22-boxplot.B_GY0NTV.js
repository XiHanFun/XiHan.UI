var e=`// 箱线与小提琴 | mark: 'boxplot' 按 x 分组统计原始值，画出中位数、四分位与离群点；style="violin" 画分布的轮廓
import type { ReactNode } from "react";
import { XhCartesianChartRoot, XhSwitch } from "@xihan-ui/react";
import { useState } from "react";

// 三个机房各 60 次请求的耗时，由序号算出，每次打开都长一样
function noise(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
const rooms = ["北京", "上海", "广州"];
const samples = rooms.flatMap((room, r) =>
  Array.from({ length: 60 }, (_, i) => ({
    room,
    ms: Math.round(90 + r * 25 + (noise(r * 60 + i) + noise(r * 60 + i + 500)) * (40 + r * 20) + (i % 23 === 0 ? 180 : 0)),
  })),
);

export default function Demo(): ReactNode {
  const [violin, setViolin] = useState(false);
  const series = [{ mark: "boxplot", x: "room", y: "ms", name: "耗时", style: violin ? "violin" : "box" }] as const;

  return (
    <div style={{ display: "grid", gap: "var(--xh-space-4)", width: "100%" }}>
      <label style={{ display: "flex", alignItems: "center", gap: "var(--xh-space-2)" }}>
        <XhSwitch checked={violin} onCheckedChange={details => setViolin(details.checked)} />
        小提琴
      </label>
      <XhCartesianChartRoot data={samples} series={series} yAxis={{ title: "毫秒" }} caption="各机房请求耗时" />
    </div>
  );
}
`;export{e as default};