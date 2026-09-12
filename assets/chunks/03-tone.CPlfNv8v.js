const n=`// 语气 | 换一族颜色只改 tone，形态那一轴一个字不动
import type { Tone } from "@xihan-ui/core";
import type { ReactNode } from "react";
import { XhIcon, XhIconWrapper } from "@xihan-ui/react";

const tones: Tone[] = ["brand", "neutral", "success", "warning", "danger", "info"];

const StarIcon = {
  name: "star",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "path", attrs: { d: "M12 3.5L14.7 9.2L21 10.1L16.5 14.5L17.6 20.7L12 17.8L6.4 20.7L7.5 14.5L3 10.1L9.3 9.2Z" } },
  ],
} as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {tones.map(t => (
          <XhIconWrapper key={t} variant="solid" tone={t}>
            <XhIcon icon={StarIcon} />
          </XhIconWrapper>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {tones.map(t => (
          <XhIconWrapper key={t} variant="subtle" tone={t}>
            <XhIcon icon={StarIcon} />
          </XhIconWrapper>
        ))}
      </div>
    </div>
  );
}
`;export{n as default};
