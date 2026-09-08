// 间距档位 | gap 收的是档位名不是像素：xs / sm / md / lg / xl 逐档指向一个间距令牌
import type { CSSProperties, ReactNode } from "react";
import { XhFlex } from "@xihan-ui/react";

const boxStyle = {
  padding: "6px 12px",
  borderRadius: "var(--xh-radius-md)",
  background: "var(--xh-bg-subtle)",
  color: "var(--xh-fg-default)",
};
const labelStyle = { fontSize: "13px", color: "var(--xh-fg-muted)", inlineSize: "96px" };
// 档位不够用时，直接给使用者槽位写值，它排在所有档位之前
const overrideStyle = { "--xh-flex-gap": "40px" } as CSSProperties;

const gaps = ["xs", "sm", "md", "lg", "xl"] as const;

export default function Demo(): ReactNode {
  return (
    <XhFlex orientation="vertical" gap="sm">
      {gaps.map(g => (
        <XhFlex key={g} align="center" gap="md">
          <span style={labelStyle}>{`gap = ${g}`}</span>
          <XhFlex gap={g}>
            <span style={boxStyle}>甲</span>
            <span style={boxStyle}>乙</span>
            <span style={boxStyle}>丙</span>
          </XhFlex>
        </XhFlex>
      ))}

      <XhFlex align="center" gap="md">
        <span style={labelStyle}>槽位覆盖</span>
        <XhFlex gap="xs" style={overrideStyle}>
          <span style={boxStyle}>甲</span>
          <span style={boxStyle}>乙</span>
          <span style={boxStyle}>丙</span>
        </XhFlex>
      </XhFlex>
    </XhFlex>
  );
}
