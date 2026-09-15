// 间距 | 设置列与项目之间的间距
import type { CSSProperties, ReactNode } from "react";
import { XhMasonry } from "@xihan-ui/react";

const items = [
  { id: 1, tone: "brand", height: "48px" },
  { id: 2, tone: "info", height: "58px" },
  { id: 3, tone: "success", height: "68px" },
  { id: 4, tone: "warning", height: "78px" },
] as const;
const gaps = ["sm", "lg"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
      {gaps.map(gap => (
        <div key={gap} style={{ inlineSize: "min(280px, 100%)" }}>
          <div style={{ marginBlockEnd: "8px", color: "var(--xh-fg-muted)", fontSize: "13px" }}>{gap}</div>
          <XhMasonry columns={2} gap={gap}>
            {items.map(item => (
              <div key={item.id} data-demo-block data-tone={item.tone} style={{ "--xh-demo-block-block-size": item.height, "--xh-demo-block-radius": "var(--xh-shape-control)" } as CSSProperties} />
            ))}
          </XhMasonry>
        </div>
      ))}
    </div>
  );
}
