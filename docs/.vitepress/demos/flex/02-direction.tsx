// 方向 | orientation 换主轴：horizontal 横排（缺省），vertical 竖排
import type { ReactNode } from "react";
import { XhFlex } from "@xihan-ui/react";

const boxStyle = {
  padding: "8px 14px",
  borderRadius: "var(--xh-radius-md)",
  background: "var(--xh-bg-subtle)",
  color: "var(--xh-fg-default)",
};
const labelStyle = { fontSize: "13px", color: "var(--xh-fg-muted)" };

export default function Demo(): ReactNode {
  return (
    <XhFlex orientation="vertical" gap="lg">
      <XhFlex orientation="vertical" gap="xs">
        <span style={labelStyle}>horizontal（缺省）</span>
        <XhFlex gap="sm">
          <span style={boxStyle}>甲</span>
          <span style={boxStyle}>乙</span>
          <span style={boxStyle}>丙</span>
        </XhFlex>
      </XhFlex>

      <XhFlex orientation="vertical" gap="xs">
        <span style={labelStyle}>vertical</span>
        <XhFlex orientation="vertical" gap="sm">
          <span style={boxStyle}>甲</span>
          <span style={boxStyle}>乙</span>
          <span style={boxStyle}>丙</span>
        </XhFlex>
      </XhFlex>
    </XhFlex>
  );
}
