// 竖排 | orientation="vertical" 把入口排成一列、面板改从侧边长出来，方向键随之改收上下键
import type { ReactNode } from "react";
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/react";

const entries = [
  { value: "system", label: "系统管理" },
  { value: "monitor", label: "运行监控" },
  { value: "tool", label: "系统工具" },
];

const panels: Record<string, Array<{ href: string; label: string }>> = {
  system: [
    { href: "#/system/user", label: "用户" },
    { href: "#/system/role", label: "角色" },
  ],
  monitor: [
    { href: "#/monitor/online", label: "在线用户" },
    { href: "#/monitor/job", label: "定时任务" },
  ],
  tool: [{ href: "#/tool/codegen", label: "代码生成" }],
};

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "100%", paddingBlockEnd: "40px" }}>
      <XhNavigationMenuRoot
        collection={entries}
        orientation="vertical"
        style={{ inlineSize: "180px" }}
        renderPanel={node => panels[node.value]?.map(l => (
          <XhNavigationMenuLink key={l.href} href={l.href}>
            {l.label}
          </XhNavigationMenuLink>
        ))}
      />
    </div>
  );
}
