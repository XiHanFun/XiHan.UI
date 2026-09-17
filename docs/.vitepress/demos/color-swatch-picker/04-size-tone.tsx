// 尺寸与语气 | 格子边长跟随控件行高分三档；tone 决定选中描边与选中徽标使用哪族颜色
import type { ReactNode } from "react";
import { XhColorSwatchPickerRoot } from "@xihan-ui/react";

const sizes = ["sm", "md", "lg"] as const;
const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
const swatches = [
  { value: "#e11d48", label: "玫红" },
  { value: "#f59e0b", label: "琥珀" },
  { value: "#10b981", label: "翠绿" },
  { value: "#3b82f6", label: "天蓝" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "flex-start" }}>
        {sizes.map(s => (
          <XhColorSwatchPickerRoot key={s} swatches={swatches} label={s} size={s} defaultValue="#3b82f6" />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
        {tones.map(t => (
          <XhColorSwatchPickerRoot key={t} swatches={swatches} label={t} tone={t} size="sm" defaultValue="#f59e0b" />
        ))}
      </div>
    </div>
  );
}
