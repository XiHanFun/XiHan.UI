// 语气 | tone 落在展开态的标题上，六种语气各预置一项展开做对照
import type { ReactNode } from "react";
import { XhAccordionRoot } from "@xihan-ui/react";

const tones = ([
  { value: "brand", label: "品牌" },
  { value: "neutral", label: "中性" },
  { value: "success", label: "成功" },
  { value: "warning", label: "警告" },
  { value: "danger", label: "危险" },
  { value: "info", label: "信息" },
] as const).map(tone => ({
  ...tone,
  panels: [
    {
      value: "open",
      label: `${tone.label}（展开）`,
      content: `tone="${tone.value}"`,
    },
    {
      value: "closed",
      label: `${tone.label}（收起）`,
      content: "收起态的标题不吃语气色。",
    },
  ],
}));

export default function Demo(): ReactNode {
  return (
    <div
      style={{
        display: "grid",
        gap: "16px",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      }}
    >
      {tones.map(tone => (
        <XhAccordionRoot
          key={tone.value}
          tone={tone.value}
          collection={tone.panels}
          defaultValue={["open"]}
        />
      ))}
    </div>
  );
}
