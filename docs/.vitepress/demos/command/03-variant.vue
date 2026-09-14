<!-- 遮罩形态 | variant 只落在 backdrop 那一层：opaque 压一层底、blur 糊掉背后、transparent 只挡点击 -->
<script setup lang="ts">
import type { CommandNode } from "@xihan-ui/headless";
import { XhCommandRoot } from "@xihan-ui/vue";

const commands: CommandNode[] = [
  { value: "users", label: "用户管理" },
  { value: "roles", label: "角色管理" },
  { value: "export", label: "导出报表" },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 12px">
    <XhCommandRoot
      v-for="variant in ['opaque', 'blur', 'transparent']"
      :key="variant"
      :variant="variant"
      :collection="commands"
      placeholder="搜命令…"
      empty="没有匹配的命令"
    >
      <template #trigger>{{ variant }} 遮罩</template>
    </XhCommandRoot>
  </div>
</template>
