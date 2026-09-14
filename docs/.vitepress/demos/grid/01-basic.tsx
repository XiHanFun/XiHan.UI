// 基础用法 | 创建等宽列
import type { CSSProperties, ReactNode } from "react";
import { XhGridItem, XhGridRoot } from "@xihan-ui/react";

const cellStyle: CSSProperties = {
  minInlineSize: 0,
  padding: "16px",
  borderRadius: "var(--xh-shape-surface)",
  background: "var(--xh-bg-subtle)",
};

const metrics = [
  { label: "活跃用户", value: "12,860" },
  { label: "转化率", value: "8.4%" },
  { label: "订单", value: "1,294" },
];

export default function Demo(): ReactNode {
  return (
    <XhGridRoot cols={3} gap="md" style={{ inlineSize: "min(600px, 100%)" }}>
      {metrics.map(metric => (
        <XhGridItem key={metric.label} style={cellStyle}>
          <div style={{ color: "var(--xh-fg-muted)", fontSize: "13px" }}>{metric.label}</div>
          <strong style={{ display: "block", marginBlockStart: "8px", fontSize: "24px" }}>{metric.value}</strong>
        </XhGridItem>
      ))}
    </XhGridRoot>
  );
}
