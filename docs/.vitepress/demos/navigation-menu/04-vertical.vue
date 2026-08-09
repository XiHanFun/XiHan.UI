<!-- 竖排 | orientation="vertical" 把入口排成一列、面板改从侧边长出来，方向键随之改收上下键 -->
<script setup lang="ts">
import {
  XhNavigationMenuContent,
  XhNavigationMenuIndicator,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
} from "@xihan-ui/vue";

const groups = [
  {
    value: "system",
    label: "系统管理",
    links: [
      { href: "#/system/user", label: "用户" },
      { href: "#/system/role", label: "角色" },
    ],
  },
  {
    value: "monitor",
    label: "运行监控",
    links: [
      { href: "#/monitor/online", label: "在线用户" },
      { href: "#/monitor/job", label: "定时任务" },
    ],
  },
  {
    value: "tool",
    label: "系统工具",
    links: [{ href: "#/tool/codegen", label: "代码生成" }],
  },
];
</script>

<template>
  <div style="inline-size: 100%; padding-block-end: 40px">
    <XhNavigationMenuRoot orientation="vertical" style="inline-size: 180px">
      <XhNavigationMenuList>
        <XhNavigationMenuItem v-for="g in groups" :key="g.value">
          <XhNavigationMenuTrigger :value="g.value">
            {{ g.label }}
          </XhNavigationMenuTrigger>
          <XhNavigationMenuContent :value="g.value">
            <XhNavigationMenuLink
              v-for="l in g.links"
              :key="l.href"
              :href="l.href"
            >
              {{ l.label }}
            </XhNavigationMenuLink>
          </XhNavigationMenuContent>
        </XhNavigationMenuItem>
        <XhNavigationMenuIndicator />
      </XhNavigationMenuList>
    </XhNavigationMenuRoot>
  </div>
</template>
