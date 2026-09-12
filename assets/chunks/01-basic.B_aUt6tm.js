const e=`// 基础用法 | 二维排布容器：cols 定分几列，gap 走间距档位，每一格按文档序依次落格
import type { CSSProperties, ReactNode } from "react";
import { XhGridItem, XhGridRoot } from "@xihan-ui/react";

const cellStyle: CSSProperties = {
  padding: "12px",
  borderRadius: "var(--xh-radius-md)",
  background: "var(--xh-bg-subtle)",
  color: "var(--xh-fg-default)",
};

const cells = ["甲", "乙", "丙", "丁", "戊", "己"];

export default function Demo(): ReactNode {
  return (
    <XhGridRoot cols={3} gap="md">
      {cells.map(c => (
        <XhGridItem key={c} style={cellStyle}>{c}</XhGridItem>
      ))}
    </XhGridRoot>
  );
}
`;export{e as default};
