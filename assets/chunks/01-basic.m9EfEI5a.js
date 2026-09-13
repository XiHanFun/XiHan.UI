const e=`<!-- 基础用法 | 组织应用的主要导航入口 -->
<script setup lang="ts">
import type { SideNavNode } from "@xihan-ui/headless";
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
} from "@xihan-ui/vue";

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
<\/script>

<template>
  <XhSideNavRoot
    :collection="collection"
    default-value="user-list"
    :default-expanded-value="['user']"
  >
    <XhSideNavList>
      <XhSideNavItem>
        <XhSideNavLink value="dashboard">
          <XhIcon :icon="HomeIcon" aria-hidden="true" />
          <XhSideNavLinkText>工作台</XhSideNavLinkText>
        </XhSideNavLink>
      </XhSideNavItem>
      <XhSideNavBranch v-for="branch in collection.filter((n) => n.children)" :key="branch.value" :value="branch.value">
        <XhSideNavBranchTrigger>
          <XhIcon :icon="branch.value === 'user' ? UsersIcon : ShoppingCartIcon" aria-hidden="true" />
          <XhSideNavBranchText>{{ branch.label }}</XhSideNavBranchText>
          <XhSideNavBranchIndicator />
        </XhSideNavBranchTrigger>
        <XhSideNavBranchContent>
          <XhSideNavItem v-for="leaf in branch.children" :key="leaf.value">
            <XhSideNavLink :value="leaf.value">
              <XhSideNavLinkText>{{ leaf.label }}</XhSideNavLinkText>
            </XhSideNavLink>
          </XhSideNavItem>
        </XhSideNavBranchContent>
      </XhSideNavBranch>
    </XhSideNavList>
  </XhSideNavRoot>
</template>
`;export{e as default};
