// 基础用法 | 输入框中的文字是草稿，回车或失焦提交后按 format 重写；色块绘制的是已提交的值，未完成的输入不会被提交
import type { ReactNode } from "react";
import {
  XhColorFieldClearTrigger,
  XhColorFieldControl,
  XhColorFieldHiddenInput,
  XhColorFieldInput,
  XhColorFieldLabel,
  XhColorFieldRoot,
  XhColorFieldSwatch,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState("#3b82f6");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <XhColorFieldRoot value={value} onValueChange={details => setValue(details.value)} name="accent" placeholder="#rrggbb" clearable>
        <XhColorFieldLabel>主题色</XhColorFieldLabel>
        <XhColorFieldControl>
          <XhColorFieldSwatch />
          <XhColorFieldInput />
          <XhColorFieldClearTrigger />
        </XhColorFieldControl>
        <XhColorFieldHiddenInput />
      </XhColorFieldRoot>
      <span style={{ fontSize: "13px" }}>
        收下的值：
        <code>{value || "（空）"}</code>
      </span>
    </div>
  );
}
