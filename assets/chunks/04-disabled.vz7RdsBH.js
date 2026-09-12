const e=`// 禁用 | 手柄退出 Tab 序列，按下也不进拖动
import type { ReactNode } from "react";
import { XhSortableItem, XhSortableItemDragTrigger, XhSortableRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [ids, setIds] = useState(["锁定一", "锁定二", "锁定三"]);

  return (
    <XhSortableRoot ids={ids} onSort={details => setIds(details.ids)} disabled>
      {ids.map(id => (
        <XhSortableItem key={id} itemId={id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", border: "1px solid var(--xh-border-default)" }}>
          <XhSortableItemDragTrigger itemId={id} />
          <span>{id}</span>
        </XhSortableItem>
      ))}
    </XhSortableRoot>
  );
}
`;export{e as default};
