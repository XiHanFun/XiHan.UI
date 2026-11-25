<!-- 原生输入框 | input 部件就是一个原生 input：写在它上面的属性直接落到真正的输入框，自动填充与移动端键盘类型由它们决定；聚焦失焦等原生事件也写在它上面，值的变化另经组件的 value-change；取得它的节点即可聚焦、全选、把光标移到末尾 -->
<script setup lang="ts">
import {
  XhButton,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const input = ref<HTMLInputElement | null>(null);
const log = ref<string[]>([]);

// 组件只渲染一个 input，实例上的 $el 就是它
function bindInput(instance: unknown): void {
  input.value = (instance as { $el: HTMLInputElement } | null)?.$el ?? null;
}

// 新的排在最前，只留最近三条
function push(text: string): void {
  log.value = [text, ...log.value].slice(0, 3);
}

function onValueChange(details: { value: string }): void {
  push(`value-change：${details.value || "（空）"}`);
}

function selectAll(): void {
  input.value?.focus();
  input.value?.select();
}

function caretToEnd(): void {
  const el = input.value;
  if (!el)
    return;
  el.focus();
  el.setSelectionRange(el.value.length, el.value.length);
}
</script>

<template>
  <XhTextFieldRoot
    default-value="hi@xihan.dev"
    placeholder="you@example.com"
    clearable
    @value-change="onValueChange"
  >
    <XhTextFieldLabel>邮箱</XhTextFieldLabel>
    <XhTextFieldControl>
      <XhTextFieldInput
        :ref="bindInput"
        autocomplete="email"
        inputmode="email"
        spellcheck="false"
        @focus="push('focus')"
        @blur="push('blur')"
      />
    </XhTextFieldControl>
    <div style="display: flex; gap: var(--xh-space-2)">
      <XhButton variant="outline" size="sm" @click="input?.focus()">聚焦</XhButton>
      <XhButton variant="outline" size="sm" @click="selectAll">全选</XhButton>
      <XhButton variant="outline" size="sm" @click="caretToEnd">光标移到末尾</XhButton>
    </div>
  </XhTextFieldRoot>

  <span data-demo-output>{{ log.join(" · ") || "还没有事件" }}</span>
</template>
