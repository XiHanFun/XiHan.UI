// 禁用 | 禁用走 aria-disabled 而非原生 disabled：禁用的入口仍聚焦得上、仍是方向键的起点，只是展不开菜单
import type { ReactNode } from "react";
import { XhMenubarRoot, XhSwitch } from "@xihan-ui/react";
import { useState } from "react";

const menus = [
  {
    value: "file",
    label: "文件",
    items: [
      { value: "new", label: "新建" },
      { value: "open", label: "打开" },
    ],
  },
  // 单项禁用：整条没锁时，也只有这一项展不开
  {
    value: "edit",
    label: "编辑",
    disabled: true,
    items: [{ value: "undo", label: "撤销" }],
  },
  { value: "help", label: "帮助", items: [{ value: "about", label: "关于" }] },
];

export default function Demo(): ReactNode {
  const [locked, setLocked] = useState(false);

  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "12px", paddingBlockEnd: "140px" }}>
      <XhMenubarRoot disabled={locked} collection={menus} />

      <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <XhSwitch checked={locked} onCheckedChange={details => setLocked(details.checked)} />
        整条禁用（展开与选中都不再发生）
      </label>
    </div>
  );
}
