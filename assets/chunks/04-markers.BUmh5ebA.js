var e=`// 极值 | markers="extremes" 在末点之外再标出最高与最低点；markers="none" 一个点都不标
import type { ReactNode } from "react";
import { XhSparkline } from "@xihan-ui/react";

// 一天里每两小时的在线人数
const online = [820, 640, 410, 380, 560, 1240, 1580, 1320, 1460, 1710, 1390, 980];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--xh-space-6)" }}>
      <XhSparkline data={online} markers="extremes" aria-label="今日在线人数，标出最高与最低" />
      <XhSparkline data={online} markers="none" aria-label="今日在线人数" />
    </div>
  );
}
`;export{e as default};