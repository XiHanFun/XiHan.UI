var e=`// 看板 | 在几列之间移动任务
import type { SortableTransferDetails } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { XhSortableDropIndicator, XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from "@xihan-ui/react";
import { useState } from "react";

const columns = [
  { id: "todo", title: "待办" },
  { id: "doing", title: "进行中" },
  { id: "done", title: "已完成" },
];
const tones: Record<string, string> = { 调研: "brand", 原型: "info", 评审: "warning", 接口: "success", 联调: "danger", 立项: "neutral" };

export default function Demo(): ReactNode {
  const [lists, setLists] = useState<Record<string, string[]>>({ todo: ["调研", "原型", "评审"], doing: ["接口", "联调"], done: ["立项"] });

  // 落进别的列时源列表发一次 transfer：两列的新顺序都算好了，照着写回即可
  const onTransfer = ({ fromList, toList, fromIds, toIds }: SortableTransferDetails): void =>
    setLists(prev => ({ ...prev, [fromList]: fromIds, [toList]: toIds }));

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "var(--xh-space-4)" }}>
      {columns.map(column => (
        <section
          key={column.id}
          style={{ flex: "1 1 160px", display: "grid", gap: "var(--xh-space-2)", padding: "var(--xh-space-3)", border: "var(--xh-stroke-thin) solid var(--xh-border-default)", borderRadius: "var(--xh-shape-surface)" }}
        >
          <h4 id={\`sortable-board-\${column.id}\`} style={{ margin: 0, fontSize: "var(--xh-text-label-size)" }}>{column.title}</h4>
          <XhSortableRoot
            ids={lists[column.id]}
            group="board"
            listId={column.id}
            aria-labelledby={\`sortable-board-\${column.id}\`}
            style={{ minBlockSize: "var(--xh-control-h-lg)" }}
            onSort={({ ids }) => setLists(prev => ({ ...prev, [column.id]: ids }))}
            onTransfer={onTransfer}
          >
            {lists[column.id]?.map(id => (
              <XhSortableItem
                key={id}
                itemId={id}
                aria-label={id}
                style={{ display: "flex", alignItems: "center", gap: "var(--xh-space-2)", padding: "var(--xh-space-2) var(--xh-space-3)", borderRadius: "var(--xh-shape-control)", background: "var(--xh-bg-subtle)" }}
              >
                <XhSortableItemDragTrigger itemId={id} />
                <span data-demo-block="line" data-tone={tones[id]} />
              </XhSortableItem>
            ))}
            <XhSortableDropIndicator />
            <XhSortableLiveRegion />
          </XhSortableRoot>
        </section>
      ))}
    </div>
  );
}
`;export{e as default};