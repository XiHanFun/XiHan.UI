const e=`<!-- 搜索过滤 | 输入即按标签过滤导航树，命中入口的祖先自动展开，其余收起；Escape 清空检索词 -->
<script setup lang="ts">
import type { SideNavNode } from "@xihan-ui/headless";
import {
  XhSideNavBranch,
  XhSideNavBranchContent,
  XhSideNavBranchIndicator,
  XhSideNavBranchText,
  XhSideNavBranchTrigger,
  XhSideNavEmpty,
  XhSideNavInput,
  XhSideNavItem,
  XhSideNavLink,
  XhSideNavLinkText,
  XhSideNavList,
  XhSideNavRoot,
} from "@xihan-ui/vue";

const collection: SideNavNode[] = [
  { value: "dashboard", label: "工作台", href: "#/dashboard" },
  {
    value: "user",
    label: "用户管理",
    children: [
      { value: "user-list", label: "用户列表", href: "#/user/list" },
      { value: "user-role", label: "角色权限", href: "#/user/role" },
    ],
  },
  {
    value: "order",
    label: "订单管理",
    children: [
      { value: "order-list", label: "订单列表", href: "#/order/list" },
      { value: "order-refund", label: "退款处理", href: "#/order/refund" },
    ],
  },
];
<\/script>

<template>
  <XhSideNavRoot
    :collection="collection"
    :translations="{ input: '搜索导航', noMatch: '没有匹配的入口' }"
  >
    <XhSideNavInput placeholder="搜索导航" />
    <XhSideNavList>
      <XhSideNavItem>
        <XhSideNavLink value="dashboard">
          <XhSideNavLinkText>工作台</XhSideNavLinkText>
        </XhSideNavLink>
      </XhSideNavItem>
      <XhSideNavBranch v-for="branch in collection.filter((n) => n.children)" :key="branch.value" :value="branch.value">
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
    <XhSideNavEmpty />
  </XhSideNavRoot>
</template>
`;export{e as default};
