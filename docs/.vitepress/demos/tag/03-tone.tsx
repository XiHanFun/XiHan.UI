// 语气 | tone 决定用哪族颜色；语气只换色相，形态与尺寸不受影响
import type { ReactNode } from "react";
import { XhTagLabel, XhTagRoot } from "@xihan-ui/react";

const tones = [
  { value: "brand", label: "品牌" },
  { value: "neutral", label: "中性" },
  { value: "success", label: "成功" },
  { value: "warning", label: "警告" },
  { value: "danger", label: "危险" },
  { value: "info", label: "信息" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
      {tones.map(tone => (
        <XhTagRoot key={tone.value} variant="subtle" tone={tone.value}>
          <XhTagLabel>{tone.label}</XhTagLabel>
        </XhTagRoot>
      ))}
    </div>
  );
}
