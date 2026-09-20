const e=`// 禁用项目 | 固定单个项目的位置
import type { ReactNode } from "react";
import { XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from "@xihan-ui/react";
import { useState } from "react";

const tones = ["neutral", "info", "success", "warning"] as const;

export default function Demo(): ReactNode {
  const [ids, setIds] = useState(["固定项", "设计", "实现", "发布"]);

  return (
    <XhSortableRoot ids={ids} onSort={({ ids: next }) => setIds(next)} style={{ inlineSize: "min(360px, 100%)" }}>
      {ids.map((id, index) => (
        <XhSortableItem key={id} itemId={id} disabled={id === "固定项"} aria-label={id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "var(--xh-shape-surface)", background: "var(--xh-bg-subtle)" }}>
          <XhSortableItemDragTrigger itemId={id} disabled={id === "固定项"} />
          <span data-demo-block="line" data-tone={tones[index]} />
        </XhSortableItem>
      ))}
      <XhSortableLiveRegion />
    </XhSortableRoot>
  );
}
`;export{e as default};
