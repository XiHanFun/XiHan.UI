const n=`// 默认展开项 | defaultValue 只定首帧展开哪一项，之后照常由交互接管；指针移开、Escape 或点回入口都收得起来
import type { ReactNode } from "react";
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/react";

const entries = [
  { value: "guide", label: "指南" },
  { value: "components", label: "组件" },
];

const panels: Record<string, Array<{ href: string; label: string }>> = {
  guide: [
    { href: "#/guide/install", label: "安装" },
    { href: "#/guide/quick-start", label: "快速开始" },
  ],
  components: [
    { href: "#/components/menu", label: "菜单" },
    { href: "#/components/toolbar", label: "工具栏" },
  ],
};

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "100%", paddingBlockEnd: "150px" }}>
      {/* 首帧就展开「指南」，指示条也一并落在它下面 */}
      <XhNavigationMenuRoot
        collection={entries}
        defaultValue="guide"
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
