// 语气、尺寸与描边 | tone 使用语义颜色；size 设置图标大小，weight 设置描边粗细
import type { ReactNode } from "react";
import { StarIcon } from "@xihan-ui/icons";
import { XhIcon } from "@xihan-ui/react";

const tones = ["brand", "success", "warning", "danger", "info"] as const;
const sizes = ["text", "sm", "md", "lg", "xl"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-4)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--xh-space-3)" }}>
        {tones.map(tone => <XhIcon key={tone} icon={StarIcon} tone={tone} size="lg" />)}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--xh-space-3)" }}>
        {sizes.map(size => <XhIcon key={size} icon={StarIcon} size={size} />)}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--xh-space-3)" }}>
        <XhIcon icon={StarIcon} size="lg" weight="light" />
        <XhIcon icon={StarIcon} size="lg" />
        <XhIcon icon={StarIcon} size="lg" weight="bold" />
      </div>
    </div>
  );
}
