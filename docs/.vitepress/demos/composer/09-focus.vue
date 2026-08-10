<!-- 聚焦与选中 | 输入部件渲染出来就是一个 textarea，拿到它的节点就能聚焦、全选、失焦；发完一条把焦点送回去，接着敲下一条 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhComposerInput,
  XhComposerRoot,
  XhComposerSubmitTrigger,
} from "@xihan-ui/vue";

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
  <div style="width: 100%; display: grid; gap: 12px">
    <XhComposerRoot @submit="onSubmit">
      <XhComposerInput :ref="bindInput" placeholder="发一条，焦点会自己回来" rows="1" />
      <XhComposerSubmitTrigger>发送</XhComposerSubmitTrigger>
    </XhComposerRoot>

    <div style="display: flex; gap: 8px">
      <XhButton variant="outline" size="sm" @click="input?.focus()">聚焦</XhButton>
      <XhButton variant="outline" size="sm" @click="input?.select()">全选</XhButton>
      <XhButton variant="ghost" size="sm" @click="input?.blur()">失焦</XhButton>
    </div>
    <span>{{ log }}</span>
  </div>
</template>
