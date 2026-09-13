/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 禁用项 | 保留不可用入口的位置与说明
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
  return (
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
  );
}
