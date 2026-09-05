<!-- 基础用法 | 交一份命令清单，过滤、归组与空态都由组件包办 -->
<script setup lang="ts">
import type { CommandNode, CommandSelectDetails } from "@xihan-ui/headless";
import { ref } from "vue";
import { XhCommandRoot } from "@xihan-ui/vue";

// keywords 让一条命令同时认英文名与旧称：打 export 也能搜到「导出报表」
const commands: CommandNode[] = [
  { value: "users", label: "用户管理", group: "nav", keywords: ["users"] },
  { value: "roles", label: "角色管理", group: "nav", keywords: ["roles"] },
  { value: "profile", label: "个人资料", group: "nav" },
  { value: "export", label: "导出报表", group: "action", keywords: ["export"] },
  { value: "invite", label: "邀请成员", group: "action" },
  { value: "archive", label: "归档项目", group: "action", disabled: true },
];

const groups = [
  { value: "nav", label: "页面" },
  { value: "action", label: "动作" },
];

const last = ref("还没执行过命令");

function run(details: CommandSelectDetails) {
  last.value = `执行了：${details.label}`;
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhCommandRoot
      :collection="commands"
      :groups="groups"
      placeholder="搜命令…"
      empty="没有匹配的命令"
      @select="run"
    >
      <template #trigger>打开命令面板</template>
      <template #footer>↑↓ 选择 · ↵ 执行 · Esc 关闭</template>
    </XhCommandRoot>
    <span>{{ last }}</span>
  </div>
</template>
