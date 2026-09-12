const n=`// 基础用法 | 等宽不等高的项按最短列优先落进三列，底边尽量齐平
import type { CSSProperties, ReactNode } from "react";
import { XhMasonry } from "@xihan-ui/react";

const cardStyle: CSSProperties = {
  padding: "12px",
  borderRadius: "var(--xh-radius-md)",
  background: "var(--xh-bg-subtle)",
  color: "var(--xh-fg-default)",
};

const cards = [
  { label: "甲", height: 90 },
  { label: "乙", height: 140 },
  { label: "丙", height: 60 },
  { label: "丁", height: 110 },
  { label: "戊", height: 70 },
  { label: "己", height: 150 },
];

export default function Demo(): ReactNode {
  return (
    <XhMasonry columns={3} gap="md">
      {cards.map(c => (
        <div key={c.label} style={{ ...cardStyle, blockSize: \`\${c.height}px\` }}>
          {c.label}
        </div>
      ))}
    </XhMasonry>
  );
}
`;export{n as default};
