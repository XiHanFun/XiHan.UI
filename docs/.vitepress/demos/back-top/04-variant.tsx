// 变体 | 选择与所在表面匹配的样式
import type { CSSProperties, ReactNode } from "react";
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/react";

const variants = [
  { label: "线框（默认）", value: "outline" },
  { label: "实心", value: "solid" },
  { label: "幽灵", value: "ghost" },
] as const;

const rootStyle = {
  "position": "absolute",
  "--xh-back-top-inset-block": "12px",
  "--xh-back-top-inset-inline": "12px",
} as CSSProperties;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(112px, 1fr))", gap: "12px", inlineSize: "min(640px, 100%)" }}>
      {variants.map(({ label, value }) => (
        <div
          key={label}
          style={{ position: "relative", blockSize: "120px", padding: "14px", borderRadius: "var(--xh-shape-surface)", background: "var(--xh-bg-subtle)" }}
        >
          <span style={{ color: "var(--xh-fg-muted)" }}>{label}</span>
          <XhBackTopRoot variant={value} visibilityHeight={0} style={rootStyle}>
            <XhBackTopTrigger />
          </XhBackTopRoot>
        </div>
      ))}
    </div>
  );
}
