// 语气、色板与尺寸 | tone 按语气族换色，palette 直接按颜色指定、取基础色板同名色相的满档一端，两者都只换色阶两端、不改分档；size 改变格子边长与行首星期名的留白，一屏能放下的周数随之变化
import type { HeatmapDatum, HeatmapPalette } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { formatHeatmapDate } from "@xihan-ui/headless";
import { XhHeatmapRoot } from "@xihan-ui/react";

const DAY_MS = 86_400_000;

// 换色两行用同一份四周数据各铺一遍，肉眼比的就只有颜色这一件事
const fourWeeks = [
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

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
const palettes: HeatmapPalette[] = ["red", "orange", "amber", "yellow", "lime", "green", "teal", "cyan", "blue", "indigo", "purple", "pink", "gray"];

// 尺寸一行与基础用法同一份年度数据：只换尺寸档，看同一年占多宽
function buildYear(year: number): HeatmapDatum[] {
  const days: HeatmapDatum[] = [];
  let index = 0;
  for (let time = Date.UTC(year, 0, 1); time <= Date.UTC(year, 11, 31); time += DAY_MS) {
    const at = new Date(time);
    const noise = ((Math.imul(++index, 2654435761) >>> 8) % 1000) / 1000;
    const month = at.getUTCMonth();
    const peak = month === 2 || month === 9 ? 16 : month === 7 ? 3 : 8;
    const weekend = at.getUTCDay() === 0 || at.getUTCDay() === 6;
    const ceiling = weekend ? peak / 2 : peak;
    days.push({ date: formatHeatmapDate(time), count: noise < 0.16 ? 0 : Math.round(noise * ceiling) });
  }
  return days;
}

const activity = buildYear(2024);

const caption = { color: "var(--xh-fg-muted)", fontSize: "var(--xh-text-caption-size)" } as const;

export default function Demo(): ReactNode {
  return (
    // 装着一整年网格的这一层是舞台的 flex 项：min-width: 0 让它收进舞台宽度，放不下的那一档才自己横着滚
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-8)", minWidth: 0 }}>
      {/* 语气只换颜色族：档位怎么分由数据与 levels 决定，与它无关 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--xh-space-5)" }}>
        {tones.map(tone => (
          <div key={tone} style={{ display: "grid", gap: "var(--xh-space-1)" }}>
            <span style={caption}>{tone}</span>
            <XhHeatmapRoot
              value={fourWeeks}
              startDate="2024-01-01"
              endDate="2024-01-28"
              tone={tone}
            />
          </div>
        ))}
      </div>

      {/* 只写 palette：色板管的只有满档实心底那一端，档位怎么分与它无关 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--xh-space-5)" }}>
        {palettes.map(palette => (
          <div key={palette} style={{ display: "grid", gap: "var(--xh-space-1)" }}>
            <span style={caption}>{palette}</span>
            <XhHeatmapRoot
              value={fourWeeks}
              startDate="2024-01-01"
              endDate="2024-01-28"
              palette={palette}
            />
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: "var(--xh-space-4)" }}>
        {/* sm 档格子最小：同样一整年 53 列，md 档要 774px，这一档 660px，一屏放得下 */}
        <XhHeatmapRoot
          value={activity}
          startDate="2024-01-01"
          endDate="2024-12-31"
          size="sm"
        />
        {/* lg 档格子 12px：一整年要 880px 上下，多数容器里都会横向滚 */}
        <XhHeatmapRoot
          value={activity}
          startDate="2024-01-01"
          endDate="2024-12-31"
          size="lg"
        />
      </div>
    </div>
  );
}
