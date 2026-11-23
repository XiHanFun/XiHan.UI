<!-- 点行看详情 | actionOnClick 让点行触发行主操作（看详情），勾选只由行首方框与 Space 改变，适合一边勾选做批量操作、一边点开某一行 -->
<script setup lang="ts">
import type { GridListNode } from "@xihan-ui/headless";
import {
  XhGridListLabel,
  XhGridListRoot,
  XhGridListRow,
  XhGridListRowContent,
  XhGridListRowDescription,
  XhGridListRowSelectionIndicator,
  XhGridListRowText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const keys: GridListNode[] = [
  { value: "user:global", label: "user:global", description: "全局偏好" },
  { value: "user:guide", label: "user:guide", description: "引导进度" },
  { value: "user:welcome", label: "user:welcome", description: "欢迎页状态" },
];
const checked = ref<string[]>([]);
const detail = ref("（未打开）");
</script>

<template>
  <div data-demo-stack>
    <XhGridListRoot
      v-model:value="checked"
      :collection="keys"
      selection-mode="multiple"
      action-on-click
      @action="detail = $event.value"
    >
      <XhGridListLabel>缓存键</XhGridListLabel>
      <XhGridListRow v-for="key in keys" :key="key.value" :value="key.value">
        <XhGridListRowSelectionIndicator />
        <XhGridListRowContent>
          <XhGridListRowText>{{ key.label }}</XhGridListRowText>
          <XhGridListRowDescription>{{ key.description }}</XhGridListRowDescription>
        </XhGridListRowContent>
      </XhGridListRow>
    </XhGridListRoot>
    <span data-demo-output>详情：{{ detail }} · 已勾选：{{ checked.length ? checked.join("、") : "（无）" }}</span>
  </div>
</template>
