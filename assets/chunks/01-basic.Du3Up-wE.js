const n=`// 基础用法 | 按最短列排列卡片
import type { CSSProperties, ReactNode } from "react";
import { XhMasonry } from "@xihan-ui/react";

const cards = [
  { id: 1, tone: "brand", height: "88px" },
  { id: 2, tone: "info", height: "136px" },
  { id: 3, tone: "success", height: "104px" },
  { id: 4, tone: "warning", height: "128px" },
  { id: 5, tone: "danger", height: "80px" },
  { id: 6, tone: "neutral", height: "116px" },
] as const;

export default function Demo(): ReactNode {
  return (
    <XhMasonry columns={3} gap="md" aria-label="瀑布流占位区块" style={{ inlineSize: "min(680px, 100%)" }}>
      {cards.map(card => (
        <article
          key={card.id}
          data-demo-block
          data-tone={card.tone}
          style={{ "--xh-demo-block-block-size": card.height } as CSSProperties}
        />
      ))}
    </XhMasonry>
  );
}
`;export{n as default};
