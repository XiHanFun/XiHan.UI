// 语气 | tone 决定条目高亮用哪族颜色；静止态看不出来，展开后悬停条目、或用方向键把焦点移上去才显现
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
