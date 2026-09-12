const e=`// 受控展开与禁用 | 展开集合交给宿主：一次全展开或全收起，也能按当前路由把该开的那一枝开上；collection 里标了 disabled 的入口方向键跳过，点它也不落值
import type { SideNavNode } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhButton,
  XhSideNavBranch,
  XhSideNavBranchContent,
  XhSideNavBranchIndicator,
  XhSideNavBranchText,
  XhSideNavBranchTrigger,
  XhSideNavItem,
  XhSideNavLink,
  XhSideNavLinkText,
  XhSideNavList,
  XhSideNavRoot,
} from "@xihan-ui/react";
import { useState } from "react";

const collection: SideNavNode[] = [
  { value: "dashboard", label: "工作台", href: "#dashboard" },
  {
    value: "user",
    label: "用户管理",
    children: [
      { value: "user-list", label: "用户列表", href: "#user-list" },
      { value: "user-role", label: "角色权限", href: "#user-role" },
    ],
  },
  {
    value: "order",
    label: "订单管理",
    children: [
      { value: "order-list", label: "订单列表", href: "#order-list" },
      // 没开这项权限：方向键跳过它，点也不落值
      { value: "order-refund", label: "退款处理", disabled: true },
    ],
  },
  {
    value: "system",
    label: "系统设置",
    children: [{ value: "system-log", label: "操作日志", href: "#system-log" }],
  },
];

const branches = collection.filter(node => node.children);

export default function Demo(): ReactNode {
  const [expanded, setExpanded] = useState<string[]>(["user"]);
  const [value, setValue] = useState<string | null>("user-list");

  // 展开集合归宿主，组件只发意图：这两颗钮改的是同一份状态
  function expandAll(): void {
    setExpanded(branches.map(branch => branch.value));
  }

  function collapseAll(): void {
    setExpanded([]);
  }

  return (
    <div style={{ display: "grid", gap: "12px", justifyItems: "start" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        <XhButton size="sm" variant="outline" onClick={expandAll}>全部展开</XhButton>
        <XhButton size="sm" variant="outline" onClick={collapseAll}>全部收起</XhButton>
      </div>

      <XhSideNavRoot
        value={value}
        expandedValue={expanded}
        collection={collection}
        loop
        style={{ border: "1px solid var(--xh-border-default)", borderRadius: "8px" }}
        onValueChange={details => setValue(details.value)}
        onExpandedValueChange={details => setExpanded(details.value)}
      >
        <XhSideNavList>
          <XhSideNavItem>
            <XhSideNavLink value="dashboard">
              <XhSideNavLinkText>工作台</XhSideNavLinkText>
            </XhSideNavLink>
          </XhSideNavItem>
          {branches.map(branch => (
            <XhSideNavBranch key={branch.value} value={branch.value}>
              <XhSideNavBranchTrigger>
                <XhSideNavBranchText>{branch.label}</XhSideNavBranchText>
                <XhSideNavBranchIndicator />
              </XhSideNavBranchTrigger>
              <XhSideNavBranchContent>
                {branch.children?.map(leaf => (
                  <XhSideNavItem key={leaf.value}>
                    <XhSideNavLink value={leaf.value}>
                      <XhSideNavLinkText>{leaf.label}</XhSideNavLinkText>
                    </XhSideNavLink>
                  </XhSideNavItem>
                ))}
              </XhSideNavBranchContent>
            </XhSideNavBranch>
          ))}
        </XhSideNavList>
      </XhSideNavRoot>

      <p style={{ fontSize: "13px", opacity: 0.75 }}>
        {\`展开：\${expanded.length ? expanded.join("、") : "（全收起）"} · 选中：\${value ?? "（无）"}\`}
      </p>
    </div>
  );
}
`;export{e as default};
