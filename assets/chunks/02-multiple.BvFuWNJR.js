const e=`// 多选 | Space 切换当前行，Shift + 方向键、Shift + Space 与 Shift + 点击把锚点到那一行的一段并进选中，Ctrl 或 Cmd+A 选择或清空全部可用行
import type { ReactNode } from "react";
import {
  XhGridListRoot,
  XhGridListRow,
  XhGridListRowContent,
  XhGridListRowSelectionIndicator,
  XhGridListRowText,
} from "@xihan-ui/react";
import { useState } from "react";

const items = [
  { value: "read", label: "读取" },
  { value: "write", label: "写入" },
  { value: "deploy", label: "发布", disabled: true },
];

export default function Demo(): ReactNode {
  const [selected, setSelected] = useState<string[]>(["read"]);
  return (
    <div data-demo-stack>
      <XhGridListRoot collection={items} selectionMode="multiple" value={selected} onValueChange={details => setSelected(details.value)}>
        {items.map(item => (
          <XhGridListRow key={item.value} value={item.value} disabled={item.disabled}>
            <XhGridListRowSelectionIndicator />
            <XhGridListRowContent><XhGridListRowText>{item.label}</XhGridListRowText></XhGridListRowContent>
          </XhGridListRow>
        ))}
      </XhGridListRoot>
      <span data-label>
        权限：
        {selected.join("、") || "无"}
      </span>
    </div>
  );
}
`;export{e as default};
