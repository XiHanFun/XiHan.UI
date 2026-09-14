// 响应式列 | 根据容器宽度调整列数
import type { ReactNode } from "react";
import { XhMasonry } from "@xihan-ui/react";

const items = ["概览", "组件", "主题", "发布"];

export default function Demo(): ReactNode {
  return (
    <XhMasonry columns={{ base: 1, sm: 2, md: 3 }} gap="sm" style={{ inlineSize: "min(720px, 100%)" }}>
      {items.map((item, index) => (
        <div key={item} style={{ padding: `${16 + index * 6}px 16px`, borderRadius: "var(--xh-shape-surface)", background: "var(--xh-bg-subtle)" }}>{item}</div>
      ))}
    </XhMasonry>
  );
}
