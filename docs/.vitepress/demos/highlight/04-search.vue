<!-- 跟着输入高亮 | 关键词逐字符比对、不拼进正则，敲进 . * ( 这些字符也只当普通字符找 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhHighlight } from "@xihan-ui/vue";

const keyword = ref("1.0");

const rows = [
  "曦寒 UI 1.0 发布说明",
  "版本 120 的兼容性清单",
  "取值写作 a*b 时的转义规则",
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <input v-model="keyword" placeholder="输入关键词" style="max-inline-size: 240px" />
    <XhHighlight v-for="row in rows" :key="row" :text="row" :keyword="keyword" />
  </div>
</template>
