const n=`// 语气 | tone 决定用哪族颜色，与 variant 正交：四种形态 × 六种语气都成立
import type { ReactNode } from "react";
import { XhButton } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
const variants = ["solid", "subtle", "outline", "ghost"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "10px" }}>
      {variants.map(variant => (
        <div key={variant} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ minWidth: "56px", fontSize: "13px", opacity: 0.7 }}>{variant}</span>
          {tones.map(tone => (
            <XhButton key={tone} variant={variant} tone={tone} size="sm">
              {tone}
            </XhButton>
          ))}
        </div>
      ))}
    </div>
  );
}
`;export{n as default};
