// 自定义外观 | 轨道色、进度段色、轨道厚度与环的直径、端点各是一个组件令牌，纯色与渐变都可以使用；环的线宽经 strokeWidth：它改变的是几何，半径随之向内收缩
import type { CSSProperties, ReactNode } from "react";
import { XhProgress } from "@xihan-ui/react";

// 进度段与轨道各换一个颜色，语气档之外的配色写在这里
const amber = {
  "--xh-progress-range": "#f0a020",
  "--xh-progress-track": "rgba(240, 160, 32, 0.2)",
} as CSSProperties;

// 进度段接的是 background，写渐变一样成立
const gradient = {
  "--xh-progress-range": "linear-gradient(90deg, #22d3ee, #2563eb)",
} as CSSProperties;

// 厚度是单独一个令牌，三个尺寸档之外的数值直接写死
const thick = { "--xh-progress-thickness": "14px" } as CSSProperties;

// 直径、底槽色与端点形状走令牌
const violet = {
  "--xh-progress-size": "140px",
  "--xh-progress-track": "#e9d5ff",
  "--xh-progress-range": "#7c3aed",
  "--xh-progress-linecap": "butt",
} as CSSProperties;

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", display: "grid", gap: "var(--xh-space-6)" }}>
      <div style={{ display: "grid", gap: "var(--xh-space-4)" }}>
        <XhProgress value={45} style={amber} />
        <XhProgress value={80} style={gradient} />
        <XhProgress value={60} style={thick} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--xh-space-6)", flexWrap: "wrap" }}>
        {/* 线宽是 prop：半径要跟着它变，算在几何里而不是皮肤里 */}
        <XhProgress variant="circle" value={64} strokeWidth={2} />
        <XhProgress variant="circle" value={64} strokeWidth={14} />

        <XhProgress variant="circle" value={64} style={violet} />
      </div>
    </div>
  );
}
