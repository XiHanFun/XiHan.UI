// 形态与尺寸 | variant 只换外框：outline 带描边与底色，subtle 淡底无描边，ghost 去掉外框与底色；size 三档只改变字号与层级缩进，行的结构与配色都不变
import type { ReactNode } from "react";
import { XhJsonViewerRoot } from "@xihan-ui/react";

const payload = { id: 7, label: "曦寒", nested: { ok: true } };
const variants = ["outline", "subtle", "ghost"] as const;
const sizes = ["sm", "md", "lg"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-4)", inlineSize: "100%", maxInlineSize: "420px" }}>
      <div style={{ display: "grid", gap: "var(--xh-space-3)" }}>
        {variants.map(variant => (
          <XhJsonViewerRoot key={variant} value={payload} defaultExpandedDepth={2} variant={variant} />
        ))}
      </div>

      <div style={{ display: "grid", gap: "var(--xh-space-3)" }}>
        {sizes.map(size => (
          <XhJsonViewerRoot key={size} value={payload} defaultExpandedDepth={2} size={size} />
        ))}
      </div>
    </div>
  );
}
