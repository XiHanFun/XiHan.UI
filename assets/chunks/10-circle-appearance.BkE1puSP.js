const e=`// 环的外观 | 直径、颜色与端点走令牌，线宽走 strokeWidth：它改的是几何，半径跟着往里收
import type { CSSProperties, ReactNode } from "react";
import { XhProgress } from "@xihan-ui/react";

// 直径、底槽色与端点形状走令牌
const violet = {
  "--xh-progress-size": "140px",
  "--xh-progress-track": "#e9d5ff",
  "--xh-progress-range": "#7c3aed",
  "--xh-progress-linecap": "butt",
} as CSSProperties;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
      {/* 线宽是 prop：半径要跟着它变，算在几何里而不是皮肤里 */}
      <XhProgress variant="circle" value={64} strokeWidth={2} />
      <XhProgress variant="circle" value={64} strokeWidth={14} />

      <XhProgress variant="circle" value={64} style={violet} />
    </div>
  );
}
`;export{e as default};
