const t=`// 数据统计 | 总天数、空白天数与占比、最大值、平均值都从网格模型直接读，不必自己再遍历一遍数据
import type { HeatmapDatum } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { buildHeatmapGrid, formatHeatmapDate } from "@xihan-ui/headless";
import { XhHeatmapRoot } from "@xihan-ui/react";

const DAY_MS = 86_400_000;
const START = "2024-01-01";
const END = "2024-12-31";

// 一整年的提交量：数值由天序号哈希出来，同一年恒出同一份数据
function buildYear(year: number): HeatmapDatum[] {
  const days: HeatmapDatum[] = [];
  let index = 0;
  for (let time = Date.UTC(year, 0, 1); time <= Date.UTC(year, 11, 31); time += DAY_MS) {
    const at = new Date(time);
    const noise = ((Math.imul(++index, 2654435761) >>> 8) % 1000) / 1000;
    const weekend = at.getUTCDay() === 0 || at.getUTCDay() === 6;
    const ceiling = weekend ? 4 : 10;
    days.push({ date: formatHeatmapDate(time), count: noise < 0.22 ? 0 : Math.round(noise * ceiling) });
  }
  return days;
}

const activity = buildYear(2024);

// 网格的推导是纯函数，与组件内部用的是同一份；写函数式 children 时载荷里的 grid 也是它
const grid = buildHeatmapGrid({ value: activity, startDate: START, endDate: END });

const days = grid.cells.size;
// 空白 = 值为 0 的格子：没有数据的日子与写了 0 的日子都算。
// 它不是「色阶第 0 档的格子数」——这里没给 thresholds，首个下界恒为 1，两个数才恰好相等
const empty = grid.emptyCount;

const stats = [
  { label: "总天数", value: \`\${days} 天\` },
  { label: "空白", value: \`\${empty} 天（\${days ? Math.round((empty / days) * 100) : 0}%）\` },
  { label: "最多", value: \`\${grid.max} 次\` },
  { label: "平均", value: \`\${days ? (grid.total / days).toFixed(1) : "0.0"} 次/天\` },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <XhHeatmapRoot value={activity} startDate={START} endDate={END} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        {stats.map(item => (
          <span key={item.label}>
            {\`\${item.label}：\`}
            <strong>{item.value}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}
`;export{t as default};
