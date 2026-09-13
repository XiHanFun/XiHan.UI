/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 组织应用的主要导航入口
import type { SideNavNode } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { HomeIcon, ShoppingCartIcon, UsersIcon } from "@xihan-ui/icons";
import {
  XhIcon,
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
      { value: "order-refund", label: "退款处理", href: "#order-refund" },
    ],
  },
];

export default function Demo(): ReactNode {
  return (
    <XhSideNavRoot collection={collection} defaultValue="user-list" defaultExpandedValue={["user"]}>
      <XhSideNavList>
        <XhSideNavItem>
          <XhSideNavLink value="dashboard">
            <XhIcon icon={HomeIcon} aria-hidden="true" />
            <XhSideNavLinkText>工作台</XhSideNavLinkText>
          </XhSideNavLink>
        </XhSideNavItem>
        {collection.filter(n => n.children).map(branch => (
          <XhSideNavBranch key={branch.value} value={branch.value}>
            <XhSideNavBranchTrigger>
              <XhIcon icon={branch.value === "user" ? UsersIcon : ShoppingCartIcon} aria-hidden="true" />
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
