// 语气 | tone 决定指示器与选中段文字用哪族颜色，六种语气各一组
import type { ReactNode } from "react";
import { XhSegmentedRoot } from "@xihan-ui/react";

const tones = [
  "brand",
  "neutral",
  "success",
  "warning",
  "danger",
  "info",
] as const;
const answers = [
  { value: "on", label: "开" },
  { value: "off", label: "关" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
      {tones.map(t => (
        <XhSegmentedRoot
          key={t}
          collection={answers}
          tone={t}
          aria-label={t}
          defaultValue="on"
        />
      ))}
    </div>
  );
}
