<!-- 聚焦与选中 | 输入部件就是一个原生 textarea，拿到它的节点就能聚焦、全选、失焦；发完一条把焦点送回去，接着敲下一条 -->
<script setup lang="ts">
import {
  XhButton,
  XhPromptInputInput,
  XhPromptInputRoot,
  XhPromptInputSubmitTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const log = ref("（还没发过）");
const input = ref<HTMLTextAreaElement | null>(null);

// 组件只渲染一个 textarea，实例上的 $el 就是它
function bindInput(instance: unknown): void {
  input.value = (instance as { $el: HTMLTextAreaElement } | null)?.$el ?? null;
}

function onSubmit(details: { value: string }): void {
  log.value = `提交：${details.value}`;
  // 点发送按钮会把焦点留在按钮上，这里送回输入框
  input.value?.focus();
}
</script>

<template>
  <div style="display: grid; gap: 12px">
    <XhPromptInputRoot :translations="{ input: '给助手写点什么' }" @submit="onSubmit">
      <XhPromptInputInput :ref="bindInput" rows="1" placeholder="发一条，焦点会自己回来" />
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>

    <div style="display: flex; gap: 8px">
      <XhButton variant="outline" size="sm" @click="input?.focus()">聚焦</XhButton>
      <XhButton variant="outline" size="sm" @click="input?.select()">全选</XhButton>
      <XhButton variant="ghost" size="sm" @click="input?.blur()">失焦</XhButton>
    </div>
    <span>{{ log }}</span>
  </div>
</template>
