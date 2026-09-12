// 横排与网格 | orientation 三档：竖排、横排，换行网格用 both，落点按最近中心判
import type { ReactNode } from "react";
import { XhSortableItem, XhSortableItemDragTrigger, XhSortableRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [tabs, setTabs] = useState(["概览", "订单", "库存", "报表"]);
  const [cards, setCards] = useState(["甲", "乙", "丙", "丁", "戊", "己"]);

  return (
    <>
      <p style={{ marginBottom: "8px" }}>横排：只认左右方向键。</p>
      <XhSortableRoot ids={tabs} onSort={details => setTabs(details.ids)} orientation="horizontal">
        {tabs.map(id => (
          <XhSortableItem key={id} itemId={id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", border: "1px solid var(--xh-border-default)" }}>
            <XhSortableItemDragTrigger itemId={id} />
            <span>{id}</span>
          </XhSortableItem>
        ))}
      </XhSortableRoot>

      <p style={{ margin: "20px 0 8px" }}>换行网格：上下左右都认，落点取离指针最近的那一格。</p>
      <XhSortableRoot ids={cards} onSort={details => setCards(details.ids)} orientation="both" style={{ maxInlineSize: "320px" }}>
        {cards.map(id => (
          <XhSortableItem key={id} itemId={id} style={{ display: "flex", alignItems: "center", justifyContent: "center", inlineSize: "88px", blockSize: "64px", border: "1px solid var(--xh-border-default)" }}>
            <XhSortableItemDragTrigger itemId={id}>{id}</XhSortableItemDragTrigger>
          </XhSortableItem>
        ))}
      </XhSortableRoot>
    </>
  );
}
