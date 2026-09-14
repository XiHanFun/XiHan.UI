// 尺寸 | 适配不同密度的应用侧栏
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
];

const rows = [
  { size: "sm", label: "小" },
  { size: undefined, label: "中" },
  { size: "lg", label: "大" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
      {rows.map(row => (
        <div key={row.label} style={{ display: "grid", gap: "6px" }}>
          <span style={{ color: "var(--xh-fg-muted)" }}>{row.label}</span>
          <XhSideNavRoot collection={collection} size={row.size} defaultValue="user-list" defaultExpandedValue={["user"]}>
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
  );
}
