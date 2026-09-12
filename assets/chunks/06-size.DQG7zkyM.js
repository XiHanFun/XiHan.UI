const n=`// 尺寸 | size 一档换掉入口的高度、内边距与字号，写在 root 上、面板里的链接一并跟着变
import type { ReactNode } from "react";
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/react";

const sizes = [
  { value: "sm", label: "sm" },
  { value: undefined, label: "缺省" },
  { value: "lg", label: "lg" },
] as const;

const entries = [
  { value: "products", label: "产品" },
  { value: "docs", label: "文档" },
];

const panels: Record<string, Array<{ href: string; label: string }>> = {
  products: [
    { href: "#/products/runtime", label: "运行时内核" },
    { href: "#/products/vue", label: "Vue 适配器" },
  ],
  docs: [{ href: "#/docs/guide", label: "上手指南" }],
};

export default function Demo(): ReactNode {
  return (
    // 面板是绝对定位的浮层，这里给下方留出它落位的空间
    <div
      style={{
        inlineSize: "100%",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        gap: "24px",
        paddingBlockEnd: "180px",
      }}
    >
      {sizes.map(s => (
        <div key={s.label} style={{ display: "grid", gap: "6px" }}>
          <span>{s.label}</span>
          <XhNavigationMenuRoot
            collection={entries}
            size={s.value}
            renderPanel={node => panels[node.value]?.map(l => (
              <XhNavigationMenuLink key={l.href} href={l.href}>
                {l.label}
              </XhNavigationMenuLink>
            ))}
          />
        </div>
      ))}
    </div>
  );
}
`;export{n as default};
