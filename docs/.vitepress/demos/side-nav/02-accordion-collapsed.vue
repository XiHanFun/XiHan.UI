<!-- 手风琴与折叠 | accordion 让同层只开一枝；collapsed 折叠成图标栏（内嵌展开整体收起，文字部件整个隐藏只剩图标），折叠态下悬停/点按/右方向键在旁侧弹出子级面板，面板内选中即落值收起；collapsedPopout 设为 false 可关掉弹出 -->
<script setup lang="ts">
import type { SideNavNode } from "@xihan-ui/headless";
import { ref } from "vue";
import {
  XhButton,
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

const collapsed = ref(false);
</script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <XhButton variant="outline" @click="collapsed = !collapsed">
      {{ collapsed ? "展开侧栏" : "折叠成图标栏" }}
    </XhButton>
    <XhSideNavRoot
      :collection="collection"
      :collapsed="collapsed"
      accordion
      style="border: 1px solid var(--xh-border-default); border-radius: 8px"
    >
      <XhSideNavList>
        <XhSideNavBranch v-for="branch in collection" :key="branch.value" :value="branch.value">
          <XhSideNavBranchTrigger>
            <span aria-hidden="true">▦</span>
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
  </div>
</template>
