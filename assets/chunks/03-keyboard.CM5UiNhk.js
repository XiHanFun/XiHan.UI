const e=`// 键盘拖拽 | 默认开着且关不掉：Tab 到手柄，空格拾起，方向键挪，空格放下，Esc 取消
import type { ReactNode } from "react";
import { XhSortableItem, XhSortableItemDragTrigger, XhSortableRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [ids, setIds] = useState(["第一项", "第二项", "第三项"]);
  const [log, setLog] = useState<string[]>([]);

  return (
    <>
      <p style={{ marginBottom: "8px", color: "var(--xh-fg-muted)" }}>
        Tab 聚焦到手柄，按空格拾起后用 ↑↓ 移动，再按空格落下；Esc 退回原位。
      </p>
      <XhSortableRoot
        ids={ids}
        onSort={(details) => {
          setIds(details.ids);
          setLog(prev => [\`\${details.id}：第 \${details.from + 1} 位 → 第 \${details.to + 1} 位\`, ...prev]);
        }}
        onDragEnd={(details) => {
          if (details.canceled)
            setLog(prev => [\`\${details.id}：已取消\`, ...prev]);
        }}
      >
        {ids.map(id => (
          <XhSortableItem key={id} itemId={id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", border: "1px solid var(--xh-border-default)" }}>
            <XhSortableItemDragTrigger itemId={id} />
            <span>{id}</span>
          </XhSortableItem>
        ))}
      </XhSortableRoot>
      <ul style={{ marginTop: "12px", color: "var(--xh-fg-muted)" }}>
        {log.slice(0, 4).map((line, i) => <li key={i}>{line}</li>)}
      </ul>
    </>
  );
}
`;export{e as default};
