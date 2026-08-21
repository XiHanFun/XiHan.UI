const n=`<!-- 竖排 | orientation="vertical" 把入口排成一列、面板改从侧边长出来，方向键随之改收上下键 -->
<script setup lang="ts">
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/vue";

const entries = [
  { value: "system", label: "系统管理" },
  { value: "monitor", label: "运行监控" },
  { value: "tool", label: "系统工具" },
];

const panels: Record<string, Array<{ href: string; label: string }>> = {
  system: [
    { href: "#/system/user", label: "用户" },
    { href: "#/system/role", label: "角色" },
  ],
  monitor: [
    { href: "#/monitor/online", label: "在线用户" },
    { href: "#/monitor/job", label: "定时任务" },
  ],
  tool: [{ href: "#/tool/codegen", label: "代码生成" }],
};
<\/script>

<template>
  <div style="inline-size: 100%; padding-block-end: 40px">
    <XhNavigationMenuRoot
      :collection="entries"
      orientation="vertical"
      style="inline-size: 180px"
    >
      <template #panel="node">
        <XhNavigationMenuLink
          v-for="l in panels[node.value]"
          :key="l.href"
          :href="l.href"
        >
          {{ l.label }}
        </XhNavigationMenuLink>
      </template>
    </XhNavigationMenuRoot>
  </div>
</template>
`;export{n as default};
