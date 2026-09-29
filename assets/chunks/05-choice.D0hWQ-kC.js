const e=`// 视图设置 | 右键菜单中的 checkbox 与 radio 切换后保持展开
import type { ContextMenuNode } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { XhContextMenuRoot } from "@xihan-ui/react";

const collection: ContextMenuNode[] = [
  { value: "grid", label: "显示网格", kind: "checkbox" },
  { value: "small", label: "小图标", kind: "radio", group: "size", groupLabel: "图标大小" },
  { value: "large", label: "大图标", kind: "radio", group: "size" },
];

export default function Demo(): ReactNode {
  return (
    <XhContextMenuRoot
      collection={collection}
      defaultCheckboxValue={["grid"]}
      defaultRadioValue={{ size: "small" }}
      trigger={<span>右键调整视图</span>}
    />
  );
}
`;export{e as default};
