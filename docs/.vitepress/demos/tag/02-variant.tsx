// 形态 | variant 决定颜色怎么用：实心填底、淡色填底、只描边
import type { ReactNode } from "react";
import { XhTagLabel, XhTagRoot } from "@xihan-ui/react";

const variants = ["solid", "subtle", "outline"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
      {variants.map(v => (
        <XhTagRoot key={v} variant={v} tone="brand">
          <XhTagLabel>{v}</XhTagLabel>
        </XhTagRoot>
      ))}
    </div>
  );
}
