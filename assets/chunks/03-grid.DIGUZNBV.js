const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 网格排序 | 在换行布局中排序
import type { ReactNode } from "react";
import { XhSortableDropIndicator, XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [ids, setIds] = useState(["颜色", "排版", "间距", "圆角", "阴影", "动效"]);

  return (
    <XhSortableRoot ids={ids} onSort={({ ids: next }) => setIds(next)} orientation="both" style={{ maxInlineSize: "340px" }}>
      {ids.map(id => (
        <XhSortableItem key={id} itemId={id} style={{ display: "flex", alignItems: "center", gap: "6px", inlineSize: "104px", blockSize: "72px", padding: "10px", borderRadius: "var(--xh-shape-surface)", background: "var(--xh-bg-subtle)" }}>
          <XhSortableItemDragTrigger itemId={id} />
          <span>{id}</span>
        </XhSortableItem>
      ))}
      <XhSortableDropIndicator />
      <XhSortableLiveRegion />
    </XhSortableRoot>
  );
}
`;export{e as default};
