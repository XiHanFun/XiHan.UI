// 尺寸与状态 | size 适配不同密度的应用侧栏；禁用的入口保留位置与说明，方向键跳过它，点也不落值
import type { SideNavNode } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
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

const sizeCollection: SideNavNode[] = [
  { value: "dashboard", label: "工作台", href: "#/dashboard" },
  {
    value: "user",
    label: "用户管理",
    children: [
      { value: "user-list", label: "用户列表", href: "#/user/list" },
      { value: "user-role", label: "角色权限", href: "#/user/role" },
    ],
  },
];

const rows = [
  { size: "sm", label: "小" },
  { size: undefined, label: "中" },
  { size: "lg", label: "大" },
] as const;

const collection: SideNavNode[] = [
  { value: "dashboard", label: "工作台", href: "#/dashboard" },
  {
    value: "user",
    label: "用户管理",
    children: [
      { value: "user-list", label: "用户列表", href: "#/user/list" },
      { value: "user-role", label: "角色权限", href: "#/user/role" },
    ],
  },
  {
    value: "order",
    label: "订单管理",
    children: [
      { value: "order-list", label: "订单列表", href: "#/order/list" },
      // 没开这项权限：方向键跳过它，点也不落值
      { value: "order-refund", label: "退款处理", disabled: true },
    ],
  },
  {
    value: "system",
    label: "系统设置",
    children: [{ value: "system-log", label: "操作日志", href: "#/system/log" }],
  },
];

const branches = collection.filter(node => node.children);

const gridStyle = { display: "grid", gap: "var(--xh-space-4)", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" };
const cellStyle = { display: "grid", gap: "var(--xh-space-2)" };
const labelStyle = { color: "var(--xh-fg-muted)", fontSize: "var(--xh-text-caption-size)" };

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-6)" }}>
      <div style={gridStyle}>
        {rows.map(row => (
          <div key={row.label} style={cellStyle}>
            <span style={labelStyle}>{row.label}</span>
            <XhSideNavRoot collection={sizeCollection} size={row.size} defaultValue="user-list" defaultExpandedValue={["user"]}>
              <XhSideNavList>
                <XhSideNavItem>
                  <XhSideNavLink value="dashboard">
                    <XhSideNavLinkText>工作台</XhSideNavLinkText>
                  </XhSideNavLink>
                </XhSideNavItem>
                <XhSideNavBranch value="user">
                  <XhSideNavBranchTrigger>
                    <XhSideNavBranchText>用户管理</XhSideNavBranchText>
                    <XhSideNavBranchIndicator />
                  </XhSideNavBranchTrigger>
                  <XhSideNavBranchContent>
                    <XhSideNavItem>
                      <XhSideNavLink value="user-list">
                        <XhSideNavLinkText>用户列表</XhSideNavLinkText>
                      </XhSideNavLink>
                    </XhSideNavItem>
                    <XhSideNavItem>
                      <XhSideNavLink value="user-role">
                        <XhSideNavLinkText>角色权限</XhSideNavLinkText>
                      </XhSideNavLink>
                    </XhSideNavItem>
                  </XhSideNavBranchContent>
                </XhSideNavBranch>
              </XhSideNavList>
            </XhSideNavRoot>
          </div>
        ))}
      </div>

      <div style={gridStyle}>
        <div style={cellStyle}>
          <span style={labelStyle}>禁用项</span>
          <XhSideNavRoot
            collection={collection}
            defaultValue="user-list"
            defaultExpandedValue={["user", "order"]}
            loop
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
        </div>
      </div>
    </div>
  );
}
