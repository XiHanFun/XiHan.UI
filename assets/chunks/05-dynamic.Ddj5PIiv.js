const n=`// 动态增删 | 项增删后重新量高、重新落格；新项排在末尾，摘掉一项后其余项会补位
import type { CSSProperties, ReactNode } from "react";
import { XhMasonry } from "@xihan-ui/react";
import { useRef, useState } from "react";

const cardStyle: CSSProperties = {
  padding: "12px",
  borderRadius: "var(--xh-radius-md)",
  background: "var(--xh-bg-subtle)",
  color: "var(--xh-fg-default)",
};

const buttonStyle: CSSProperties = {
  padding: "4px 10px",
  borderRadius: "var(--xh-radius-sm)",
  border: "1px solid var(--xh-border-default)",
  background: "transparent",
  color: "var(--xh-fg-default)",
};

export default function Demo(): ReactNode {
  const seq = useRef(4);
  const [cards, setCards] = useState([
    { id: 1, height: 90 },
    { id: 2, height: 140 },
    { id: 3, height: 60 },
  ]);

  function add(): void {
    // 先取号再算高度：高度是按号算的，取号与算高度得分成两步
    const id = seq.current++;
    // 高度在 60–160 之间挑一个，好看出落格是按高度定的
    setCards(previous => [...previous, { id, height: 60 + ((id * 37) % 100) }]);
  }

  function removeLast(): void {
    setCards(previous => previous.slice(0, -1));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        <button type="button" style={buttonStyle} onClick={add}>
          添加一项
        </button>
        <button type="button" style={buttonStyle} onClick={removeLast}>
          摘掉末项
        </button>
      </div>

      <XhMasonry columns={3} gap="md">
        {cards.map(c => (
          <div key={c.id} style={{ ...cardStyle, blockSize: \`\${c.height}px\` }}>
            {c.id}
          </div>
        ))}
      </XhMasonry>
    </div>
  );
}
`;export{n as default};
