const n=`// 间距档位 | gap 一档管两处：列与列之间、同一列里项与项之间，留白始终对齐
import type { CSSProperties, ReactNode } from "react";
import { XhMasonry } from "@xihan-ui/react";
import { useState } from "react";

const cardStyle: CSSProperties = {
  padding: "12px",
  borderRadius: "var(--xh-radius-md)",
  background: "var(--xh-bg-subtle)",
  color: "var(--xh-fg-default)",
};

const gaps = ["xs", "sm", "md", "lg", "xl"] as const;

const cards = [
  { label: "甲", height: 80 },
  { label: "乙", height: 120 },
  { label: "丙", height: 60 },
  { label: "丁", height: 100 },
  { label: "戊", height: 90 },
  { label: "己", height: 70 },
];

export default function Demo(): ReactNode {
  const [gap, setGap] = useState<(typeof gaps)[number]>("md");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        {gaps.map(g => (
          <button
            key={g}
            type="button"
            aria-pressed={g === gap}
            style={{
              padding: "4px 10px",
              borderRadius: "var(--xh-radius-sm)",
              border: "1px solid var(--xh-border-default)",
              background: g === gap ? "var(--xh-bg-brand)" : "transparent",
              color: g === gap ? "var(--xh-fg-on-brand)" : "var(--xh-fg-default)",
            }}
            onClick={() => setGap(g)}
          >
            {g}
          </button>
        ))}
      </div>

      <XhMasonry columns={3} gap={gap}>
        {cards.map(c => (
          <div key={c.label} style={{ ...cardStyle, blockSize: \`\${c.height}px\` }}>
            {c.label}
          </div>
        ))}
      </XhMasonry>
    </div>
  );
}
`;export{n as default};
