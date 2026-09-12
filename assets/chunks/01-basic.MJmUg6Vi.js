const e=`// 基础用法 | ids 是顺序的唯一真源，sort 事件回传的 ids 已经重排好，可直接写回
import type { ReactNode } from "react";
import { XhSortableItem, XhSortableItemDragTrigger, XhSortableRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [ids, setIds] = useState(["写方案", "评审", "实现", "上线"]);

  return (
    <>
      <XhSortableRoot ids={ids} onSort={details => setIds(details.ids)} style={{ inlineSize: "100%" }}>
        {ids.map(id => (
          <XhSortableItem key={id} itemId={id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", border: "1px solid var(--xh-border-default)" }}>
            <XhSortableItemDragTrigger itemId={id} />
            <span>{id}</span>
          </XhSortableItem>
        ))}
      </XhSortableRoot>
      <p style={{ marginTop: "12px", color: "var(--xh-fg-muted)" }}>{\`当前顺序：\${ids.join(" → ")}\`}</p>
    </>
  );
}
`;export{e as default};
