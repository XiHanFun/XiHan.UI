const n=`// 直达入口 | 没有下级的去处不必套面板：那一项直接铺成一条 link，它不进方向键那一组（那一组只认 trigger），按 Tab 一样到得了
import type { ReactNode } from "react";
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/react";

const entries = [
  { value: "products", label: "产品" },
  { value: "docs", label: "文档" },
  // 直达入口：给了 href 就没有 trigger 也没有面板，点了就跳走
  { value: "changelog", label: "更新日志", href: "#/changelog" },
];

const panels: Record<string, Array<{ href: string; label: string }>> = {
  products: [
    { href: "#/products/runtime", label: "运行时内核" },
    { href: "#/products/vue", label: "Vue 适配器" },
  ],
  docs: [
    { href: "#/docs/guide", label: "上手指南" },
    { href: "#/docs/anatomy", label: "部件解剖" },
  ],
};

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "100%", paddingBlockEnd: "150px" }}>
      <XhNavigationMenuRoot
        collection={entries}
        renderPanel={node => panels[node.value]?.map(l => (
          <XhNavigationMenuLink key={l.href} href={l.href}>
            {l.label}
          </XhNavigationMenuLink>
        ))}
      />
    </div>
  );
}
`;export{n as default};
