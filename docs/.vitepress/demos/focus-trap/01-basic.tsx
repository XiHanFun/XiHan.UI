// 基础用法 | 打开后焦点进到区域里，Tab 在三颗按钮之间回绕；完成后停用，焦点回到打开它的按钮
import type { ReactNode } from "react";
import { XhButton, XhFocusTrap } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [editing, setEditing] = useState(false);
  if (!editing)
    return <XhButton onClick={() => setEditing(true)}>编辑</XhButton>;
  return (
    <XhFocusTrap style={{ display: "flex", gap: "var(--xh-space-2)" }}>
      <XhButton>加粗</XhButton>
      <XhButton>斜体</XhButton>
      <XhButton tone="neutral" onClick={() => setEditing(false)}>完成</XhButton>
    </XhFocusTrap>
  );
}
