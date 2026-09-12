const e=`// 基础用法 | 管理后台侧栏：分支内嵌展开（可多开）、选中落在叶子上并一路点亮祖先枝，方向键上下走行、左右管层级
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
      { value: "order-refund", label: "退款处理", href: "#order-refund" },
    ],
  },
];

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string | null>("user-list");

  return (
    <>
      <XhSideNavRoot
        value={value}
        collection={collection}
        defaultExpandedValue={["user"]}
        style={{ border: "1px solid var(--xh-border-default)", borderRadius: "8px" }}
        onValueChange={details => setValue(details.value)}
      >
        <XhSideNavList>
          <XhSideNavItem>
            <XhSideNavLink value="dashboard"><XhSideNavLinkText>工作台</XhSideNavLinkText></XhSideNavLink>
          </XhSideNavItem>
          {collection.filter(n => n.children).map(branch => (
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
      <p>
        选中：
        {value ?? "（无）"}
      </p>
    </>
  );
}
`;export{e as default};
