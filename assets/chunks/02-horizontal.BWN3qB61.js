const t=`// 水平排序 | 调整标签顺序
import type { ReactNode } from "react";
import { XhSortableDropIndicator, XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [ids, setIds] = useState(["概览", "订单", "库存", "报表"]);

  return (
    <XhSortableRoot ids={ids} onSort={({ ids: next }) => setIds(next)} orientation="horizontal">
      {ids.map(id => (
        <XhSortableItem key={id} itemId={id} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", borderRadius: "var(--xh-shape-pill)", background: "var(--xh-bg-subtle)" }}>
          <XhSortableItemDragTrigger itemId={id} />
          <span>{id}</span>
        </XhSortableItem>
      ))}
      <XhSortableDropIndicator />
      <XhSortableLiveRegion />
    </XhSortableRoot>
  );
}
`;export{t as default};
