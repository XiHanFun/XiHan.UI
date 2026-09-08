// 尺寸 | 输入框高度与加减按钮一起换档，不传 size 即默认档
import type { ReactNode } from "react";
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/react";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "16px" }}>
      {sizes.map(s => (
        <XhNumberFieldRoot key={s.label} size={s.size} defaultValue="1">
          <XhNumberFieldLabel>{s.label}</XhNumberFieldLabel>
          <XhNumberFieldControl>
            <XhNumberFieldDecrementTrigger />
            <XhNumberFieldInput />
            <XhNumberFieldIncrementTrigger />
          </XhNumberFieldControl>
        </XhNumberFieldRoot>
      ))}
    </div>
  );
}
