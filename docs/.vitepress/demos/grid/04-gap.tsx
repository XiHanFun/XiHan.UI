// 间距 | 设置栅格间距
import type { ReactNode } from "react";
import { XhGridItem, XhGridRoot } from "@xihan-ui/react";

const groups = [
  { gap: "sm", label: "紧凑" },
  { gap: "md", label: "标准" },
  { gap: "lg", label: "宽松" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px", inlineSize: "min(480px, 100%)" }}>
      {groups.map(group => (
        <div key={group.gap}>
          <div style={{ marginBlockEnd: "6px", color: "var(--xh-fg-muted)", fontSize: "13px" }}>{group.label}</div>
          <XhGridRoot cols={3} gap={group.gap}>
            {[1, 2, 3].map(item => <XhGridItem key={item} data-demo-block data-tone="brand" style={{ blockSize: "32px" }} />)}
          </XhGridRoot>
        </div>
      ))}
    </div>
  );
}
