const e=`// 列数 | cols 收 1 到 12 的整数；各列等宽，放不下的格子自动换到下一行
import type { CSSProperties, ReactNode } from "react";
import { XhGridItem, XhGridRoot } from "@xihan-ui/react";

const cellStyle: CSSProperties = {
  padding: "10px",
  borderRadius: "var(--xh-radius-md)",
  background: "var(--xh-bg-subtle)",
  color: "var(--xh-fg-default)",
  textAlign: "center",
};
const labelStyle: CSSProperties = { fontSize: "13px", color: "var(--xh-fg-muted)" };

const columns = [2, 3, 4, 6] as const;
const cells = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸", "子", "丑"];

export default function Demo(): ReactNode {
  return (
    <XhGridRoot gap="lg">
      {columns.map(n => (
        <XhGridItem key={n}>
          <div style={labelStyle}>{\`cols = \${n}\`}</div>
          <XhGridRoot cols={n} gap="sm" style={{ marginBlockStart: "6px" }}>
            {cells.slice(0, n * 2).map(c => (
              <XhGridItem key={c} style={cellStyle}>{c}</XhGridItem>
            ))}
          </XhGridRoot>
        </XhGridItem>
      ))}

      {/* 各列等宽不够用时，直接给使用者槽位写一份轨道表，它排在所有列数档之前 */}
      <XhGridItem>
        <div style={labelStyle}>槽位覆盖：侧栏定宽、正文吃掉剩下的宽度</div>
        <XhGridRoot gap="sm" style={{ "--xh-grid-columns": "160px 1fr", "marginBlockStart": "6px" } as CSSProperties}>
          <XhGridItem style={cellStyle}>侧栏</XhGridItem>
          <XhGridItem style={cellStyle}>正文</XhGridItem>
        </XhGridRoot>
      </XhGridItem>
    </XhGridRoot>
  );
}
`;export{e as default};
