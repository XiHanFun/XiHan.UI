// 基础用法 | 在触发区上右键（触摸端长按），菜单钉在按下去的那一点上
import type { ReactNode } from "react";
import { XhContextMenuRoot } from "@xihan-ui/react";
import { useState } from "react";

const commands = [
  { value: "copy", label: "复制" },
  { value: "paste", label: "粘贴", disabled: true },
  { value: "rename", label: "重命名" },
  { value: "delete", label: "删除", separatorBefore: true },
];

export default function Demo(): ReactNode {
  const [picked, setPicked] = useState("");

  function onSelect(details: { value: string }): void {
    setPicked(details.value);
  }

  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "12px" }}>
      <XhContextMenuRoot
        collection={commands}
        onSelect={onSelect}
        // 触发区的尺寸与排布归作者，皮肤只管它的交互观感
        trigger={(
          <span style={{ display: "grid", placeItems: "center", minBlockSize: "120px" }}>
            在这块区域上右键
          </span>
        )}
      />

      <span>{`最近选中：${picked || "（无）"}`}</span>
    </div>
  );
}
