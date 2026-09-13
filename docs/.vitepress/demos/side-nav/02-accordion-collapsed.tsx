/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 折叠模式 | 以图标保留入口，子级在浮层中展开
import type { SideNavNode } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { SettingsIcon, ShoppingCartIcon, UsersIcon } from "@xihan-ui/icons";
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
    children: [{ value: "order-list", label: "订单列表", href: "#order-list" }],
  },
  {
    value: "system",
    label: "系统设置",
    children: [{ value: "system-log", label: "操作日志", href: "#system-log" }],
  },
];

const icons = {
  user: UsersIcon,
  order: ShoppingCartIcon,
  system: SettingsIcon,
} as const;

export default function Demo(): ReactNode {
  return (
    <XhSideNavRoot collection={collection} collapsed accordion>
      <XhSideNavList>
        {collection.map(branch => (
          <XhSideNavBranch key={branch.value} value={branch.value}>
            <XhSideNavBranchTrigger>
              <XhIcon icon={icons[branch.value as keyof typeof icons]} aria-hidden="true" />
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
