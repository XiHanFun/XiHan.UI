const n=`// 语气 | 普通菜单行与展开项保持中性灰；tone 作用于触发器反馈和显式标记，不给展开项铺品牌色
import type { ReactNode } from "react";
import { XhMenubarRoot } from "@xihan-ui/react";

const tones = [
  { value: "brand", label: "brand（缺省）" },
  { value: "neutral", label: "neutral" },
  { value: "success", label: "success" },
  { value: "warning", label: "warning" },
  { value: "danger", label: "danger" },
  { value: "info", label: "info" },
] as const;

const menus = [
  {
    value: "file",
    label: "文件",
    items: [
      { value: "new", label: "新建" },
      { value: "open", label: "打开" },
      { value: "save", label: "保存" },
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
];

export default function Demo(): ReactNode {
  return (
    // 菜单浮层往下落位，给容器底部留出它展开的空间
    <div style={{ inlineSize: "100%", display: "grid", gap: "8px", paddingBlockEnd: "160px" }}>
      {tones.map(t => (
        <div key={t.value} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ inlineSize: "120px", flex: "none" }}>{t.label}</span>
          <XhMenubarRoot tone={t.value} collection={menus} />
        </div>
      ))}
    </div>
  );
}
`;export{n as default};
