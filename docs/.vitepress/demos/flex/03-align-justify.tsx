// 对齐与分布 | justify 管主轴怎么分，align 管交叉轴怎么对；两条轴互不相干
import type { ReactNode } from "react";
import { XhFlex } from "@xihan-ui/react";

const trackStyle = {
  border: "1px solid var(--xh-border-default)",
  borderRadius: "var(--xh-radius-md)",
  padding: "8px",
  blockSize: "72px",
};
const boxStyle = {
  padding: "8px 14px",
  borderRadius: "var(--xh-radius-md)",
  background: "var(--xh-bg-subtle)",
  color: "var(--xh-fg-default)",
};
const tallBoxStyle = { ...boxStyle, paddingBlock: "20px" };
const labelStyle = { fontSize: "13px", color: "var(--xh-fg-muted)" };

const justifies = ["start", "center", "end", "between"] as const;
const aligns = ["start", "center", "end", "stretch"] as const;

export default function Demo(): ReactNode {
  return (
    <XhFlex orientation="vertical" gap="lg">
      {justifies.map(j => (
        <XhFlex key={j} orientation="vertical" gap="xs">
          <span style={labelStyle}>{`justify = ${j}`}</span>
          {/* 轨道给了固定高度，主轴上才有多余空间可分 */}
          <XhFlex justify={j} gap="sm" align="center" style={trackStyle}>
            <span style={boxStyle}>甲</span>
            <span style={boxStyle}>乙</span>
            <span style={boxStyle}>丙</span>
          </XhFlex>
        </XhFlex>
      ))}

      {aligns.map(a => (
        <XhFlex key={a} orientation="vertical" gap="xs">
          <span style={labelStyle}>{`align = ${a}`}</span>
          <XhFlex align={a} gap="sm" style={trackStyle}>
            <span style={boxStyle}>甲</span>
            <span style={tallBoxStyle}>乙（更高）</span>
            <span style={boxStyle}>丙</span>
          </XhFlex>
        </XhFlex>
      ))}
    </XhFlex>
  );
}
