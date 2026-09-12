const n=`// 语气 | 普通菜单行与展开项保持中性灰；tone 作用于触发器反馈和显式标记，不给展开项铺品牌色
import type { ReactNode } from "react";
import { XhMenuRoot } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

const actions = [
  { value: "copy", label: "复制" },
  { value: "rename", label: "重命名" },
  { value: "delete", label: "删除", separatorBefore: true },
];

export default function Demo(): ReactNode {
  return (
    // 六个各自独立的菜单，逐个展开对比条目高亮底色
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {tones.map(tone => (
        <XhMenuRoot key={tone} collection={actions} tone={tone} trigger={tone} />
      ))}
    </div>
  );
}
`;export{n as default};
