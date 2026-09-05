<!-- 受控展开与禁用 | 展开集合交给宿主：一次全展开或全收起，也能按当前路由把该开的那一枝开上；collection 里标了 disabled 的入口方向键跳过，点它也不落值 -->
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

const branches = collection.filter((node) => node.children);

const expanded = ref<string[]>(["user"]);
const value = ref<string | null>("user-list");

// 展开集合归宿主，组件只发意图：这两颗钮改的是同一份状态
function expandAll() {
  expanded.value = branches.map((branch) => branch.value);
}

function collapseAll() {
  expanded.value = [];
}
</script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <div style="display: flex; gap: 8px">
      <XhButton size="sm" variant="outline" @click="expandAll">全部展开</XhButton>
      <XhButton size="sm" variant="outline" @click="collapseAll">全部收起</XhButton>
    </div>

    <XhSideNavRoot
      v-model:value="value"
      v-model:expanded-value="expanded"
      :collection="collection"
      loop
      style="border: 1px solid var(--xh-border-default); border-radius: 8px"
    >
      <XhSideNavList>
        <XhSideNavItem>
          <XhSideNavLink value="dashboard">
            <XhSideNavLinkText>工作台</XhSideNavLinkText>
          </XhSideNavLink>
        </XhSideNavItem>
        <XhSideNavBranch v-for="branch in branches" :key="branch.value" :value="branch.value">
          <XhSideNavBranchTrigger>
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

    <p style="font-size: 13px; opacity: 0.75">
      展开：{{ expanded.length ? expanded.join("、") : "（全收起）" }} · 选中：{{
        value ?? "（无）"
      }}
    </p>
  </div>
</template>
