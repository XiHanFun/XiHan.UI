const e=`// 间距档位 | gap 收的是档位名不是像素：xs / sm / md / lg / xl 逐档指向一个间距令牌，行距与列距同吃这一份
import type { CSSProperties, ReactNode } from "react";
import { XhGridItem, XhGridRoot } from "@xihan-ui/react";

const cellStyle: CSSProperties = {
  padding: "8px",
  borderRadius: "var(--xh-radius-md)",
  background: "var(--xh-bg-subtle)",
  color: "var(--xh-fg-default)",
  textAlign: "center",
};
const labelStyle: CSSProperties = { fontSize: "13px", color: "var(--xh-fg-muted)" };

const gaps = ["xs", "sm", "md", "lg", "xl"] as const;
const cells = ["甲", "乙", "丙", "丁", "戊", "己"];

export default function Demo(): ReactNode {
  return (
    <XhGridRoot gap="lg">
      {gaps.map(g => (
        <XhGridItem key={g}>
          <div style={labelStyle}>{\`gap = \${g}\`}</div>
          <XhGridRoot cols={3} gap={g} style={{ marginBlockStart: "6px" }}>
            {cells.map(c => (
              <XhGridItem key={c} style={cellStyle}>{c}</XhGridItem>
            ))}
          </XhGridRoot>
        </XhGridItem>
      ))}

      {/* 档位不够用时，直接给使用者槽位写值，它排在所有档位之前 */}
      <XhGridItem>
        <div style={labelStyle}>槽位覆盖</div>
        <XhGridRoot cols={3} gap="xs" style={{ "--xh-grid-gap": "32px", "marginBlockStart": "6px" } as CSSProperties}>
          {cells.map(c => (
            <XhGridItem key={c} style={cellStyle}>{c}</XhGridItem>
          ))}
        </XhGridRoot>
      </XhGridItem>
    </XhGridRoot>
  );
}
`;export{e as default};
