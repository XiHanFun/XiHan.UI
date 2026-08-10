<!-- 事件 | 值的变化走 root 的 value-change，聚焦失焦这类原生事件直接写在 input 部件上 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhTextFieldInput, XhTextFieldLabel, XhTextFieldRoot } from "@xihan-ui/vue";

const log = ref<string[]>([]);

// 新的排在最前，只留最近三条
function push(text: string) {
  log.value = [text, ...log.value].slice(0, 3);
}

function onValueChange(details: { value: string }) {
  push("value-change：" + (details.value || "（空）"));
}
</script>

<template>
  <XhTextFieldRoot placeholder="随便敲几个字" clearable @value-change="onValueChange">
    <XhTextFieldLabel>留言</XhTextFieldLabel>
    <XhTextFieldInput
      style="inline-size: 220px"
      @focus="push('focus')"
      @blur="push('blur')"
    />
  </XhTextFieldRoot>

  <ol v-if="log.length" style="margin: 0; padding-inline-start: 20px">
    <li v-for="(item, i) in log" :key="i">{{ item }}</li>
  </ol>
  <span v-else>还没有事件</span>
</template>
