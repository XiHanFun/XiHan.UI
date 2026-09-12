const e=`// 基础用法 | 一排入口各带一张菜单，同时只展开一张；条目以 value 标识身份，禁用项方向键跳过也选不中
import type { ReactNode } from "react";
import { XhMenubarRoot } from "@xihan-ui/react";
import { useState } from "react";

const menus = [
  {
    value: "file",
    label: "文件",
    items: [
      { value: "new", label: "新建" },
      { value: "open", label: "打开" },
      { value: "close", label: "关闭", disabled: true },
    ],
  },
  {
    value: "edit",
    label: "编辑",
    items: [
      { value: "undo", label: "撤销" },
      { value: "redo", label: "重做" },
    ],
  },
  {
    value: "view",
    label: "视图",
    items: [
      { value: "zoom-in", label: "放大" },
      { value: "zoom-out", label: "缩小" },
    ],
  },
];

export default function Demo(): ReactNode {
  const [picked, setPicked] = useState("");

  function onSelect(details: { menu: string; value: string }): void {
    setPicked(\`\${details.menu} / \${details.value}\`);
  }

  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "12px", justifyItems: "start" }}>
      <XhMenubarRoot collection={menus} onSelect={onSelect} />

      <span>{\`最近选中：\${picked || "（无）"}\`}</span>
    </div>
  );
}
`;export{e as default};
