const e=`// 水平排序 | 调整标签顺序
import type { ReactNode } from "react";
import { XhSortableDropIndicator, XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from "@xihan-ui/react";
import { useState } from "react";

const tones = ["brand", "info", "success", "warning"] as const;

export default function Demo(): ReactNode {
  const [ids, setIds] = useState(["概览", "订单", "库存", "报表"]);

  return (
    <XhSortableRoot ids={ids} onSort={({ ids: next }) => setIds(next)} orientation="horizontal">
      {ids.map((id, index) => (
        <XhSortableItem key={id} itemId={id} aria-label={id} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", borderRadius: "var(--xh-shape-pill)", background: "var(--xh-bg-subtle)" }}>
          <XhSortableItemDragTrigger itemId={id} />
          <span data-demo-block="line" data-tone={tones[index]} style={{ inlineSize: "48px" }} />
        </XhSortableItem>
      ))}
      <XhSortableDropIndicator />
      <XhSortableLiveRegion />
    </XhSortableRoot>
  );
}
`;export{e as default};
