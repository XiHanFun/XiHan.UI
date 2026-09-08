// 焦点明细 | 焦点落到某一天时报出日期与计数，键盘用户与鼠标用户看到同一份明细
import type { ReactNode } from "react";
import { XhHeatmapRoot } from "@xihan-ui/react";
import { useState } from "react";

const activity = [
  { date: "2024-01-02", count: 1 },
  { date: "2024-01-04", count: 3 },
  { date: "2024-01-08", count: 6 },
  { date: "2024-01-11", count: 2 },
  { date: "2024-01-15", count: 9 },
  { date: "2024-01-17", count: 4 },
  { date: "2024-01-22", count: 12 },
  { date: "2024-01-25", count: 7 },
  { date: "2024-01-27", count: 2 },
];

export default function Demo(): ReactNode {
  const [readout, setReadout] = useState("（把焦点移到某一格）");

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      {/* 每格自己就念得出日期与计数；这里再把它显示出来，眼睛也看得见 */}
      <XhHeatmapRoot
        value={activity}
        startDate="2024-01-01"
        endDate="2024-01-28"
        onCellFocus={details => setReadout(`${details.date}：${details.count} 次（第 ${details.level} 档）`)}
      />
      <span>{readout}</span>
    </div>
  );
}
