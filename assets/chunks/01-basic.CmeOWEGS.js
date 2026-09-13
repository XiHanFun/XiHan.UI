const e=`// 基础用法 | 从顶部入口展开站点导航
import type { ReactNode } from "react";
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/react";

const entries = [
  { value: "products", label: "产品" },
  { value: "docs", label: "文档" },
  { value: "resources", label: "资源" },
];
const panels: Record<string, Array<{ href: string; title: string; description: string }>> = {
  products: [
    { href: "#/products/headless", title: "无头内核", description: "框架无关的行为与状态" },
    { href: "#/products/adapters", title: "多端适配器", description: "Vue、React 与 Web Components" },
  ],
  docs: [
    { href: "#/docs/guide", title: "快速开始", description: "安装并创建第一个组件" },
    { href: "#/docs/components", title: "组件文档", description: "浏览组件与 API" },
  ],
  resources: [
    { href: "#/resources/themes", title: "主题", description: "令牌与视觉定制" },
    { href: "#/resources/examples", title: "示例", description: "常见界面组合" },
  ],
};

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "min(720px, 100%)", paddingBlockEnd: "180px" }}>
      <XhNavigationMenuRoot
        collection={entries}
        renderPanel={node => panels[node.value]?.map(item => (
          <XhNavigationMenuLink key={item.href} href={item.href} style={{ alignItems: "flex-start" }}>
            <span style={{ display: "grid", gap: "2px" }}>
              <strong>{item.title}</strong>
              <span style={{ color: "var(--xh-fg-muted)" }}>{item.description}</span>
            </span>
          </XhNavigationMenuLink>
        ))}
      />
    </div>
  );
}
`;export{e as default};
