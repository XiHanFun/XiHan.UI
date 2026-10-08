var e=`<!-- 图标栏名称提示 | 折叠成图标栏后，悬停或聚焦只剩图标的入口时在旁侧显示它的名称 -->
<script setup lang="ts">
import type { SideNavNode } from "@xihan-ui/headless";
import { HomeIcon, SettingsIcon, ShoppingCartIcon, UsersIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhSideNavItem,
  XhSideNavLink,
  XhSideNavLinkText,
  XhSideNavList,
  XhSideNavRoot,
  XhSideNavTooltip,
} from "@xihan-ui/vue";

const collection: SideNavNode[] = [
  { value: "dashboard", label: "工作台", href: "#/dashboard" },
  { value: "user", label: "用户管理", href: "#/user" },
  { value: "order", label: "订单管理", href: "#/order" },
  { value: "system", label: "系统设置", href: "#/system" },
];

const icons = {
  dashboard: HomeIcon,
  user: UsersIcon,
  order: ShoppingCartIcon,
  system: SettingsIcon,
};
<\/script>

<template>
  <XhSideNavRoot :collection="collection" collapsed default-value="dashboard">
    <XhSideNavList>
      <XhSideNavItem v-for="node in collection" :key="node.value">
        <XhSideNavLink :value="node.value">
          <XhIcon :icon="icons[node.value]" aria-hidden="true" />
          <XhSideNavLinkText>{{ node.label }}</XhSideNavLinkText>
        </XhSideNavLink>
      </XhSideNavItem>
    </XhSideNavList>
    <XhSideNavTooltip />
  </XhSideNavRoot>
</template>
`;export{e as default};