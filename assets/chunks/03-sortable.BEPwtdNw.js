var e=`// 可拖动 | GridList 负责选择和行内按钮，Sortable 负责指针与键盘重排
import type { ReactNode } from "react";
import {
  XhGridListRoot,
  XhGridListRow,
  XhGridListRowActions,
  XhGridListRowContent,
  XhGridListRowText,
  XhSortableDropIndicator,
  XhSortableItem,
  XhSortableItemDragTrigger,
  XhSortableLiveRegion,
  XhSortableRoot,
} from "@xihan-ui/react";
import { useState } from "react";

const labels: Record<string, string> = {
  brief: "需求梳理",
  design: "交互设计",
  build: "开发实现",
};

export default function Demo(): ReactNode {
  const [ids, setIds] = useState(["brief", "design", "build"]);
  const rows = ids.map(value => ({ value, label: labels[value]! }));
  return (
    <XhSortableRoot ids={ids} onSort={details => setIds(details.ids)}>
      <XhGridListRoot collection={rows}>
        {rows.map(row => (
          <XhSortableItem key={row.value} itemId={row.value}>
            <XhGridListRow value={row.value}>
              <XhGridListRowContent><XhGridListRowText>{row.label}</XhGridListRowText></XhGridListRowContent>
              <XhGridListRowActions><XhSortableItemDragTrigger itemId={row.value} /></XhGridListRowActions>
            </XhGridListRow>
          </XhSortableItem>
        ))}
      </XhGridListRoot>
      <XhSortableDropIndicator />
      <XhSortableLiveRegion />
    </XhSortableRoot>
  );
}
`;export{e as default};