// 语气 | tone 决定条目高亮与标记位用哪族颜色；高亮静止态看不出来，右键弹出后悬停条目、或用方向键把焦点移上去才显现
import type { ReactNode } from "react";
import { XhContextMenuRoot } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

// 标记位的强调色也随语气走，这一处不必悬停就能看出来；indicator 留空串即由皮肤画勾
const commands = [
  { value: "star", label: "标记", indicator: "" },
  { value: "rename", label: "重命名" },
  { value: "delete", label: "删除", separatorBefore: true },
];

const triggerStyle = {
  display: "grid",
  placeItems: "center",
  minBlockSize: "76px",
  border: "1px dashed var(--xh-border-default)",
  borderRadius: "8px",
};

export default function Demo(): ReactNode {
  return (
    // 六块各自独立的触发区，逐块右键对比条目高亮底色
    <div
      style={{
        inlineSize: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "12px",
      }}
    >
      {tones.map(tone => (
        <XhContextMenuRoot
          key={tone}
          tone={tone}
          collection={commands}
          trigger={<span style={triggerStyle}>{tone}</span>}
        />
      ))}
    </div>
  );
}
