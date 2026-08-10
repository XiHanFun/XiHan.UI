<!-- 大量选项 | 浮层高度封顶后自行滚动；敲首字母连打检索直接跳到该字母开头的条目，方向键照常可用 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhSelectRoot } from "@xihan-ui/vue";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
// 26 个字母各四条，首字母连打即可在段间跳转
const options = Array.from({ length: 104 }, (_, i) => {
  const letter = letters[i % 26];
  const seq = Math.floor(i / 26) + 1;
  return { value: `${letter}${seq}`, label: `${letter} 区 ${seq} 号仓` };
});

const picked = ref<string[]>([]);
</script>

<template>
  <XhSelectRoot
    v-model:value="picked"
    :collection="options"
    label="仓位"
    placeholder="敲 M 试试"
  />
  <p>当前值：{{ picked[0] ?? "（未选）" }}</p>
</template>
