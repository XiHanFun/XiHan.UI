var e=`// 连续色阶 | 着色按数值的确切比例，不按档位取整：挤在同一档里的几格也分得出高低
import type { CSSProperties, ReactNode } from "react";
import { XhHeatmapRoot } from "@xihan-ui/react";

const rooms = ["华北", "华东", "华南"];
const hours = ["00", "04", "08", "12", "16", "20"];
// 各机房逐时段的 CPU 利用率（%）：午间几格落在同一档，分档画出来一样深
const utilization = [
  { row: "华北", column: "00", value: 31 },
  { row: "华北", column: "04", value: 28 },
  { row: "华北", column: "08", value: 57 },
  { row: "华北", column: "12", value: 74 },
  { row: "华北", column: "16", value: 69 },
  { row: "华北", column: "20", value: 48 },
  { row: "华东", column: "00", value: 35 },
  { row: "华东", column: "04", value: 30 },
  { row: "华东", column: "08", value: 62 },
  { row: "华东", column: "12", value: 81 },
  { row: "华东", column: "16", value: 77 },
  { row: "华东", column: "20", value: 55 },
  { row: "华南", column: "00", value: 29 },
  { row: "华南", column: "04", value: 26 },
  { row: "华南", column: "08", value: 54 },
  { row: "华南", column: "12", value: 70 },
  { row: "华南", column: "16", value: 72 },
  { row: "华南", column: "20", value: 51 },
];

export default function Demo(): ReactNode {
  return (
    // 档位照常算：读屏与打印仍按档报，只有颜色走连续比例
    <XhHeatmapRoot
      variant="matrix"
      continuous
      rows={rooms}
      columns={hours}
      value={utilization}
      style={{ "--xh-heatmap-column-w": "36px", "--xh-heatmap-row-h": "28px" } as CSSProperties}
    />
  );
}
`;export{e as default};