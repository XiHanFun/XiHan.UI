// 尺寸 | size 一档换掉 trigger 与菜单条目的字号与内边距，写在 root 上、浮层里的条目一并跟着变
import type { ReactNode } from "react";
import { XhMenubarRoot } from "@xihan-ui/react";

const sizes = [
  { value: "sm", label: "sm" },
  { value: undefined, label: "缺省" },
  { value: "lg", label: "lg" },
] as const;

const menus = [
  {
    value: "file",
    label: "文件",
    items: [
      { value: "new", label: "新建" },
      { value: "open", label: "打开" },
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
  return (
    // 菜单浮层往下落位，给容器底部留出它展开的空间
    <div style={{ inlineSize: "100%", display: "grid", gap: "12px", paddingBlockEnd: "180px" }}>
      {sizes.map(s => (
        <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ inlineSize: "60px", flex: "none" }}>{s.label}</span>
          <XhMenubarRoot size={s.value} collection={menus} />
        </div>
      ))}
    </div>
  );
}
