// 格内对齐 | align 管每一项在自己那格里的块向落点，justify-items 管行内落点；两轴缺省都是铺满整格
import type { CSSProperties, ReactNode } from "react";
import { XhGridItem, XhGridRoot } from "@xihan-ui/react";

const cellStyle: CSSProperties = {
  padding: "8px 12px",
  borderRadius: "var(--xh-radius-md)",
  background: "var(--xh-bg-subtle)",
  color: "var(--xh-fg-default)",
};
const tallStyle: CSSProperties = {
  ...cellStyle,
  background: "var(--xh-bg-brand-subtle)",
  color: "var(--xh-fg-brand-strong)",
};
const trackStyle: CSSProperties = {
  border: "1px solid var(--xh-border-default)",
  borderRadius: "var(--xh-radius-md)",
  padding: "8px",
  marginBlockStart: "6px",
};
const labelStyle: CSSProperties = { fontSize: "13px", color: "var(--xh-fg-muted)" };

const aligns = ["start", "center", "end", "stretch"] as const;
const justifies = ["start", "center", "end", "stretch"] as const;

export default function Demo(): ReactNode {
  return (
    <XhGridRoot gap="lg">
      {/* 第一格把整行撑高，另外两格才有块向落点可看 */}
      {aligns.map(a => (
        <XhGridItem key={a}>
          <div style={labelStyle}>{`align = ${a}`}</div>
          <XhGridRoot cols={3} gap="sm" align={a} style={trackStyle}>
            <XhGridItem style={tallStyle}>
              这一格内容多
              <br />
              把整行撑高
              <br />
              共三行
            </XhGridItem>
            <XhGridItem style={cellStyle}>乙</XhGridItem>
            <XhGridItem style={cellStyle}>丙</XhGridItem>
          </XhGridRoot>
        </XhGridItem>
      ))}

      {/* 内容比列窄，才看得出行内落点；stretch 下每一格铺满整列 */}
      {justifies.map(j => (
        <XhGridItem key={j}>
          <div style={labelStyle}>{`justify-items = ${j}`}</div>
          <XhGridRoot cols={3} gap="sm" justifyItems={j} style={trackStyle}>
            <XhGridItem style={cellStyle}>甲</XhGridItem>
            <XhGridItem style={cellStyle}>乙</XhGridItem>
            <XhGridItem style={cellStyle}>丙</XhGridItem>
          </XhGridRoot>
        </XhGridItem>
      ))}
    </XhGridRoot>
  );
}
