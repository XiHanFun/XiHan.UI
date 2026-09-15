// 网格排序 | 在换行布局中排序
import type { ReactNode } from "react";
import { XhSortableDropIndicator, XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from "@xihan-ui/react";
import { useState } from "react";

const tones = ["brand", "info", "success", "warning", "danger", "neutral"] as const;

export default function Demo(): ReactNode {
  const [ids, setIds] = useState(["颜色", "排版", "间距", "圆角", "阴影", "动效"]);

  return (
    <XhSortableRoot ids={ids} onSort={({ ids: next }) => setIds(next)} orientation="both" style={{ maxInlineSize: "340px" }}>
      {ids.map((id, index) => (
        <XhSortableItem key={id} itemId={id} aria-label={id} style={{ display: "flex", alignItems: "center", gap: "6px", inlineSize: "104px", blockSize: "72px", padding: "10px", borderRadius: "var(--xh-shape-surface)", background: "var(--xh-bg-subtle)" }}>
          <XhSortableItemDragTrigger itemId={id} />
          <span data-demo-block data-tone={tones[index]} style={{ blockSize: "40px" }} />
        </XhSortableItem>
      ))}
      <XhSortableDropIndicator />
      <XhSortableLiveRegion />
    </XhSortableRoot>
  );
}
