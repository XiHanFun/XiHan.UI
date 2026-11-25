// 形态、语气与尺寸 | 默认渐隐弧，另有 ring 整圈与 dots 三点；tone 只更换圆环起始边一段的颜色，轨道保持中性描边，旋转时才能看出差别；size 只改变直径，默认档 md 不输出 data-size
import type { ReactNode } from "react";
import { XhSpinner } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

const rowStyle = { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--xh-space-6)" } as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-6)" }}>
      <div style={rowStyle}>
        <XhSpinner label="加载中" />
        <XhSpinner variant="ring" label="加载中" />
        <XhSpinner variant="dots" label="加载中" />
      </div>

      <div style={rowStyle}>
        {/* 语气名写在旁边的普通文字上，转圈自身的可及名字仍是"加载中" */}
        {tones.map(t => (
          <span
            key={t}
            style={{ display: "inline-flex", alignItems: "center", gap: "var(--xh-space-2)" }}
          >
            <XhSpinner tone={t} label="加载中" />
            <span style={{ fontSize: "var(--xh-text-caption-size)", color: "var(--xh-fg-muted)" }}>{t}</span>
          </span>
        ))}
      </div>

      <div style={rowStyle}>
        <XhSpinner size="sm" label="加载中" />
        <XhSpinner label="加载中" />
        <XhSpinner size="lg" label="加载中" />
      </div>
    </div>
  );
}
