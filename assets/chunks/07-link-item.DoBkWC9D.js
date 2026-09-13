const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 直达链接 | 混合下拉入口与普通链接
import type { ReactNode } from "react";
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/react";

const entries = [
  { value: "products", label: "产品" },
  { value: "docs", label: "文档" },
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
    <div style={{ inlineSize: "min(640px, 100%)", paddingBlockEnd: "150px" }}>
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
