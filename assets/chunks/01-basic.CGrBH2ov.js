const n=`// 基础用法 | 按最短列排列卡片
import type { CSSProperties, ReactNode } from "react";
import { XhMasonry } from "@xihan-ui/react";

const cards = [
  { title: "快速上手", description: "几分钟完成安装并渲染第一个组件。" },
  { title: "无头内核", description: "行为、状态和无障碍逻辑独立于视图层，可在多个框架中复用。" },
  { title: "设计令牌", description: "统一颜色、间距和动效。" },
  { title: "多端适配", description: "同时支持 Vue、React 和 Web Components。" },
  { title: "无障碍", description: "内置键盘导航与语义属性。" },
  { title: "主题系统", description: "支持浅色、深色、高对比度和自定义品牌主题。" },
];
const cardStyle: CSSProperties = {
  padding: "16px",
  borderRadius: "var(--xh-shape-surface)",
  background: "var(--xh-bg-subtle)",
};

export default function Demo(): ReactNode {
  return (
    <XhMasonry columns={3} gap="md" style={{ inlineSize: "min(680px, 100%)" }}>
      {cards.map(card => (
        <article key={card.title} style={cardStyle}>
          <strong>{card.title}</strong>
          <p style={{ marginBlockEnd: 0, color: "var(--xh-fg-muted)" }}>{card.description}</p>
        </article>
      ))}
    </XhMasonry>
  );
}
`;export{n as default};
