// 语气、尺寸与状态 | tone 决定选中态轨道使用哪族颜色，因此这一行都设为开；size 同时缩放轨道与滑块，不写即默认档；disabled 同时阻止指针与键盘，状态机收不到 TOGGLE
import type { ReactNode } from "react";
import { XhSwitch } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

const itemStyle = { display: "inline-flex", alignItems: "center", gap: "var(--xh-space-2)" };

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-6)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--xh-space-4)", flexWrap: "wrap" }}>
        {tones.map(t => (
          <span key={t} style={itemStyle}>
            <XhSwitch tone={t} defaultChecked />
            <span>{t}</span>
          </span>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--xh-space-4)" }}>
        <span style={itemStyle}>
          <XhSwitch size="sm" defaultChecked />
          <span>小</span>
        </span>
        <span style={itemStyle}>
          <XhSwitch defaultChecked />
          <span>缺省</span>
        </span>
        <span style={itemStyle}>
          <XhSwitch size="lg" defaultChecked />
          <span>大</span>
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--xh-space-4)" }}>
        <XhSwitch disabled />
        <XhSwitch disabled defaultChecked />
      </div>
    </div>
  );
}
