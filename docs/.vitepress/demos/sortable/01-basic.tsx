// 基础用法 | 拖动任务调整顺序
import type { ReactNode } from "react";
import { XhSortableDropIndicator, XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [ids, setIds] = useState(["规划", "设计", "实现", "发布"]);

  return (
    <XhSortableRoot ids={ids} onSort={({ ids: next }) => setIds(next)} style={{ inlineSize: "min(360px, 100%)" }}>
      {ids.map(id => (
        <XhSortableItem key={id} itemId={id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "var(--xh-shape-surface)", background: "var(--xh-bg-subtle)" }}>
          <XhSortableItemDragTrigger itemId={id} />
          <span>{id}</span>
        </XhSortableItem>
      ))}
      <XhSortableDropIndicator />
      <XhSortableLiveRegion />
    </XhSortableRoot>
  );
}
