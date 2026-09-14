<script setup lang="ts">
import type { SideNavNode } from "@xihan-ui/vue";
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
];
</script>

<template>
  <XhSideNavRoot :collection="collection" default-value="user-list" :default-expanded-value="['user']" style="inline-size: 180px">
    <XhSideNavList>
      <XhSideNavItem>
        <XhSideNavLink value="dashboard"><XhSideNavLinkText>工作台</XhSideNavLinkText></XhSideNavLink>
      </XhSideNavItem>
      <XhSideNavBranch value="user">
        <XhSideNavBranchTrigger>
          <XhSideNavBranchText>用户管理</XhSideNavBranchText>
          <XhSideNavBranchIndicator />
        </XhSideNavBranchTrigger>
        <XhSideNavBranchContent>
          <XhSideNavItem v-for="leaf in collection[1].children" :key="leaf.value">
            <XhSideNavLink :value="leaf.value"><XhSideNavLinkText>{{ leaf.label }}</XhSideNavLinkText></XhSideNavLink>
          </XhSideNavItem>
        </XhSideNavBranchContent>
      </XhSideNavBranch>
    </XhSideNavList>
  </XhSideNavRoot>
</template>
