// 自定义外观 | 轨道色、进度段色与轨道厚度各是一个组件令牌，纯色与渐变都塞得进去
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

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", display: "grid", gap: "16px" }}>
      <XhProgress value={45} style={amber} />
      <XhProgress value={80} style={gradient} />
      <XhProgress value={60} style={thick} />
    </div>
  );
}
