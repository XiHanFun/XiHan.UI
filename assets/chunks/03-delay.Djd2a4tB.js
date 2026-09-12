const n=`// 展开延时 | delay-duration 是悬停多久才展开，防的是指针横穿导航时一路闪出面板；skip-delay-duration 是收起后的静默窗口，窗口内再碰任意入口直接展开
import type { ReactNode } from "react";
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/react";

const entries = [
  { value: "cloud", label: "云服务" },
  { value: "data", label: "数据" },
  { value: "ai", label: "智能" },
];

const panels: Record<string, Array<{ href: string; label: string }>> = {
  cloud: [
    { href: "#/cloud/host", label: "云主机" },
    { href: "#/cloud/storage", label: "对象存储" },
  ],
  data: [
    { href: "#/data/warehouse", label: "数据仓库" },
    { href: "#/data/pipeline", label: "数据管道" },
  ],
  ai: [{ href: "#/ai/agent", label: "智能体" }],
};

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "100%", paddingBlockEnd: "150px" }}>
      <XhNavigationMenuRoot
        collection={entries}
        delayDuration={600}
        skipDelayDuration={800}
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
