const n=`// 逐列填 | 打开 sequential 后项按文档序成段落进各列，读起来是「先走完左列，再走下一列」
import type { CSSProperties, ReactNode } from "react";
import { XhMasonry } from "@xihan-ui/react";

const cardStyle: CSSProperties = {
  padding: "12px",
  borderRadius: "var(--xh-radius-md)",
  background: "var(--xh-bg-subtle)",
  color: "var(--xh-fg-default)",
};

const cards = [
  { label: "1", height: 70 },
  { label: "2", height: 120 },
  { label: "3", height: 60 },
  { label: "4", height: 100 },
  { label: "5", height: 80 },
  { label: "6", height: 110 },
];

export default function Demo(): ReactNode {
  return (
    <XhMasonry columns={3} gap="md" sequential>
      {cards.map(c => (
        <div key={c.label} style={{ ...cardStyle, blockSize: \`\${c.height}px\` }}>
          {c.label}
        </div>
      ))}
    </XhMasonry>
  );
}
`;export{n as default};
