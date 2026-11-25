// 底框 | 用 frame 给图标套一层圆形底框：四种底框形态之外，tone 同时决定底框与图标的配色，sm、md、lg 三档底框与头像同档
import type { ReactNode } from "react";
import { CheckIcon, FolderIcon, StarIcon } from "@xihan-ui/icons";
import { XhIcon } from "@xihan-ui/react";

const frames = ["solid", "subtle", "outline", "ghost"] as const;
const tones = ["brand", "success", "warning", "danger", "info"] as const;
const sizes = ["sm", "md", "lg"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-4)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--xh-space-3)" }}>
        {frames.map(frame => <XhIcon key={frame} icon={CheckIcon} frame={frame} />)}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--xh-space-3)" }}>
        {tones.map(tone => <XhIcon key={tone} icon={StarIcon} frame="subtle" tone={tone} />)}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--xh-space-3)" }}>
        {sizes.map(size => <XhIcon key={size} icon={FolderIcon} size={size} frame="subtle" tone="brand" />)}
      </div>
    </div>
  );
}
