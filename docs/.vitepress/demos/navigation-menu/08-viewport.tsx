// 共享面板外壳 | 面板整批塞进 viewport 后落位归外壳管：几个入口的面板落在同一处，宽窄不同也不再各贴各的入口
import type { ReactNode } from "react";
import {
  XhNavigationMenuContent,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
  XhNavigationMenuViewport,
} from "@xihan-ui/react";

const groups = [
  {
    value: "products",
    label: "产品",
    links: [
      { href: "#/products/runtime", label: "运行时内核" },
      { href: "#/products/vue", label: "Vue 适配器" },
      { href: "#/products/wc", label: "Web Components 适配器" },
    ],
  },
  {
    value: "docs",
    label: "文档",
    links: [{ href: "#/docs/guide", label: "上手指南" }],
  },
  {
    value: "about",
    label: "关于",
    links: [
      { href: "#/about/team", label: "团队" },
      { href: "#/about/contact", label: "联系我们" },
    ],
  },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "100%", paddingBlockEnd: "180px" }}>
      <XhNavigationMenuRoot>
        <XhNavigationMenuList>
          {groups.map(g => (
            <XhNavigationMenuItem key={g.value}>
              <XhNavigationMenuTrigger value={g.value}>
                {g.label}
              </XhNavigationMenuTrigger>
            </XhNavigationMenuItem>
          ))}
        </XhNavigationMenuList>

        {/* 外壳放在 root 内、list 之后；里面装哪一份面板由各自的 value 决定。
            面板不再住在各自那一项里，按 Tab 走进面板要先走完全部入口 */}
        <XhNavigationMenuViewport>
          {groups.map(g => (
            <XhNavigationMenuContent key={g.value} value={g.value}>
              {g.links.map(l => (
                <XhNavigationMenuLink key={l.href} href={l.href}>
                  {l.label}
                </XhNavigationMenuLink>
              ))}
            </XhNavigationMenuContent>
          ))}
        </XhNavigationMenuViewport>
      </XhNavigationMenuRoot>
    </div>
  );
}
