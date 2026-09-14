<script setup lang="ts">
import type { CommandNode } from "@xihan-ui/headless";
import { XhCommandRoot } from "@xihan-ui/vue";

const commands: CommandNode[] = [
  { value: "users", label: "用户管理", group: "nav" },
  { value: "export", label: "导出报表", group: "action" },
];
const groups = [
  { value: "nav", label: "页面" },
  { value: "action", label: "动作" },
];
</script>

<template>
  <XhCommandRoot :collection="commands" :groups="groups" placeholder="搜命令…" empty="没有匹配的命令">
    <template #trigger>打开命令面板</template>
  </XhCommandRoot>
</template>
