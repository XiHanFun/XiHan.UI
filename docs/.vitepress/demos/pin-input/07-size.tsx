// 尺寸 | 每格的边长随 size 换档，不传 size 即默认档
import type { ReactNode } from "react";
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/react";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
const cells = Array.from({ length: 4 }, (_, i) => i);

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "20px" }}>
      {sizes.map(s => (
        <XhPinInputRoot key={s.label} size={s.size} length={4} placeholder="·">
          <XhPinInputLabel>{s.label}</XhPinInputLabel>
          <div style={{ display: "flex" }}>
            {cells.map(i => <XhPinInputInput key={i} index={i} />)}
          </div>
        </XhPinInputRoot>
      ))}
    </div>
  );
}
