// 语气与尺寸 | tone 决定进度段用哪族颜色，不写时沿用品牌色；size 只改变轨道厚度，不写即默认中档
import type { ReactNode } from "react";
import { XhProgress } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

const labelStyle = { minWidth: "64px", fontSize: "var(--xh-text-caption-size)", color: "var(--xh-fg-muted)" };
const rowStyle = { display: "flex", gap: "var(--xh-space-3)", alignItems: "center" };

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", display: "grid", gap: "var(--xh-space-6)" }}>
      <div style={{ display: "grid", gap: "var(--xh-space-3)" }}>
        {tones.map(t => (
          <div key={t} style={rowStyle}>
            <span style={labelStyle}>{t}</span>
            <XhProgress value={65} tone={t} style={{ flex: 1 }} />
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: "var(--xh-space-4)" }}>
        <div style={rowStyle}>
          <span style={labelStyle}>sm</span>
          <XhProgress value={65} size="sm" style={{ flex: 1 }} />
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>缺省</span>
          <XhProgress value={65} style={{ flex: 1 }} />
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>lg</span>
          <XhProgress value={65} size="lg" style={{ flex: 1 }} />
        </div>
      </div>
    </div>
  );
}
