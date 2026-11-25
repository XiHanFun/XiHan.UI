// 语气、尺寸与状态 | tone 决定选中描边与选中徽标用哪族颜色，格子边长随控件行高分三档；禁用整组置灰，只读只阻止落值不阻止焦点，无效把描边转为警示色
import type { ReactNode } from "react";
import { XhColorSwatchPickerRoot } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
const sizes = ["sm", "md", "lg"] as const;
const swatches = [
  { value: "#e11d48", label: "玫红" },
  { value: "#f59e0b", label: "琥珀" },
  { value: "#10b981", label: "翠绿" },
  { value: "#3b82f6", label: "天蓝" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-6)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--xh-space-6)" }}>
        {tones.map(t => (
          <XhColorSwatchPickerRoot key={t} swatches={swatches} label={t} tone={t} size="sm" defaultValue="#f59e0b" />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--xh-space-6)", alignItems: "flex-start" }}>
        {sizes.map(s => (
          <XhColorSwatchPickerRoot key={s} swatches={swatches} label={s} size={s} defaultValue="#3b82f6" />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--xh-space-6)" }}>
        <XhColorSwatchPickerRoot swatches={swatches} defaultValue="#10b981" label="禁用" disabled />
        <XhColorSwatchPickerRoot swatches={swatches} defaultValue="#10b981" label="只读" readOnly />
        <XhColorSwatchPickerRoot swatches={swatches} label="必填未选" invalid required />
      </div>
    </div>
  );
}
