// 跨列与错列 | span 让一格横跨几列；offset 让一格改从第 offset + 1 条列线起排，把它前面那几列空出来
import type { CSSProperties, ReactNode } from "react";
import { XhGridItem, XhGridRoot } from "@xihan-ui/react";

const cellStyle: CSSProperties = {
  padding: "10px",
  borderRadius: "var(--xh-radius-md)",
  background: "var(--xh-bg-subtle)",
  color: "var(--xh-fg-default)",
  textAlign: "center",
};
const markStyle: CSSProperties = {
  padding: "10px",
  borderRadius: "var(--xh-radius-md)",
  background: "var(--xh-bg-brand-subtle)",
  color: "var(--xh-fg-brand-strong)",
  textAlign: "center",
};
const labelStyle: CSSProperties = { fontSize: "13px", color: "var(--xh-fg-muted)" };

const offsets = [
  { offset: 1, span: 3 },
  { offset: 2, span: 2 },
  { offset: 3, span: 1 },
] as const;

export default function Demo(): ReactNode {
  return (
    <XhGridRoot gap="lg">
      <XhGridItem>
        <div style={labelStyle}>span：横跨几列就占几格宽，放不下的自动挤到下一行</div>
        <XhGridRoot cols={4} gap="sm" style={{ marginBlockStart: "6px" }}>
          <XhGridItem span={4} style={markStyle}>span = 4</XhGridItem>
          <XhGridItem span={2} style={markStyle}>span = 2</XhGridItem>
          <XhGridItem style={cellStyle}>甲</XhGridItem>
          <XhGridItem style={cellStyle}>乙</XhGridItem>
        </XhGridRoot>
      </XhGridItem>

      <XhGridItem>
        <div style={labelStyle}>offset：起排的列线往后挪，前面那几列空着</div>
        {/* 每档单独一行来看：同一行里前面已经排了东西时，空出来的是那几条列线而不是紧挨着的几格 */}
        <XhGridRoot gap="sm" style={{ marginBlockStart: "6px" }}>
          {offsets.map(o => (
            <XhGridItem key={o.offset}>
              <XhGridRoot cols={4} gap="sm">
                <XhGridItem offset={o.offset} span={o.span} style={markStyle}>{`offset = ${o.offset}`}</XhGridItem>
              </XhGridRoot>
            </XhGridItem>
          ))}
        </XhGridRoot>
      </XhGridItem>

      <XhGridItem>
        <div style={labelStyle}>两者同写：从第三条列线起排，横跨两列</div>
        <XhGridRoot cols={4} gap="sm" style={{ marginBlockStart: "6px" }}>
          <XhGridItem offset={2} span={2} style={markStyle}>offset = 2，span = 2</XhGridItem>
        </XhGridRoot>
      </XhGridItem>
    </XhGridRoot>
  );
}
