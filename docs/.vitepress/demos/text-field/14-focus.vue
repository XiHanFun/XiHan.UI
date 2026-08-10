<!-- 聚焦与选区 | input 部件渲染出来就是一个 input，拿到它的节点就能聚焦、全选、把光标挪到末尾 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhTextFieldInput, XhTextFieldLabel, XhTextFieldRoot } from "@xihan-ui/vue";

const input = ref<HTMLInputElement | null>(null);

// 组件只渲染一个 input，实例上的 $el 就是它
function bindInput(instance: unknown): void {
  input.value = (instance as { $el: HTMLInputElement } | null)?.$el ?? null;
}

function selectAll(): void {
  input.value?.focus();
  input.value?.select();
}

function caretToEnd(): void {
  const el = input.value;
  if (!el) return;
  el.focus();
  el.setSelectionRange(el.value.length, el.value.length);
}
</script>

<template>
  <XhTextFieldRoot default-value="曦寒组件库">
    <XhTextFieldLabel>标题</XhTextFieldLabel>
    <XhTextFieldInput :ref="bindInput" style="inline-size: 220px" />
    <div style="display: flex; gap: 8px">
      <button type="button" @click="input?.focus()">聚焦</button>
      <button type="button" @click="selectAll">全选</button>
      <button type="button" @click="caretToEnd">光标移到末尾</button>
      <button type="button" @click="input?.blur()">失焦</button>
    </div>
  </XhTextFieldRoot>
</template>
