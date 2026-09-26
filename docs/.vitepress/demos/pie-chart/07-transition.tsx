// 数据更新 | 换一组数据时扇区从当前角度走到新角度；关掉动画后直接画终态
import type { ReactNode } from "react";
import { XhButton, XhPieChartRoot, XhSwitch } from "@xihan-ui/react";
import { useState } from "react";

const channels = ["搜索", "直接访问", "社交", "邮件"];
const weeks = [
  { week: 1, visits: [4200, 2800, 1800, 1200] },
  { week: 2, visits: [3000, 3400, 2400, 1200] },
  { week: 3, visits: [3600, 2200, 3000, 1600] },
];

export default function Demo(): ReactNode {
  const [index, setIndex] = useState(0);
  const [animated, setAnimated] = useState(true);
  const current = weeks[index]!;
  const rows = channels.map((channel, i) => ({ channel, visits: current.visits[i] }));

  return (
    <div style={{ display: "grid", gap: "var(--xh-space-4)", width: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--xh-space-4)" }}>
        <XhButton onClick={() => setIndex(i => (i + 1) % weeks.length)}>换一组数据</XhButton>
        <label style={{ display: "flex", alignItems: "center", gap: "var(--xh-space-2)" }}>
          <XhSwitch checked={animated} onCheckedChange={details => setAnimated(details.checked)} />
          动画
        </label>
      </div>
      {/* 按数据次序排列：扇区不随数值换位，只在原处伸缩 */}
      <XhPieChartRoot
        data={rows}
        nameField="channel"
        valueField="visits"
        sort="none"
        animated={animated}
        caption={`第 ${current.week} 周访问来源`}
      />
    </div>
  );
}
