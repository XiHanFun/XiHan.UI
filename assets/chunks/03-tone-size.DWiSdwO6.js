const e=`// 语气与尺寸 | tone 换选中行与展开枝用哪族颜色，size 换行高与缩进档；两轴都打在 root 上，逐层继承
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
  { tone: "success", size: "md", label: "success" },
  { tone: "danger", size: "md", label: "danger" },
  { tone: "brand", size: "sm", label: "sm" },
  { tone: "brand", size: "lg", label: "lg" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
      {rows.map(row => (
        <XhSideNavRoot
          key={row.label}
          collection={collection}
          tone={row.tone}
          size={row.size}
          defaultValue="user-list"
          defaultExpandedValue={["user"]}
          style={{ border: "1px solid var(--xh-border-default)", borderRadius: "8px" }}
        >
          <XhSideNavList>
            <XhSideNavItem>
              <XhSideNavLink value="dashboard">
                <XhSideNavLinkText>{\`工作台 · \${row.label}\`}</XhSideNavLinkText>
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
      ))}
    </div>
  );
}
`;export{e as default};
