var e=`<!-- 跟随输入高亮 | 关键词逐字符比对、不拼入正则，输入 . * ( 等字符也只作为普通字符查找 -->
<script setup lang="ts">
import { XhHighlight, XhTextFieldControl, XhTextFieldInput, XhTextFieldRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const keyword = ref("1.0");

const rows = [
  "曦寒 UI 1.0 发布说明",
  "版本 120 的兼容性清单",
  "取值写作 a*b 时的转义规则",
];
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XhTextFieldRoot v-model:value="keyword" placeholder="输入关键词">
      <XhTextFieldControl>
        <XhTextFieldInput aria-label="关键词" />
      </XhTextFieldControl>
    </XhTextFieldRoot>
    <XhHighlight v-for="row in rows" :key="row" :text="row" :keyword="keyword" />
  </div>
</template>
`;export{e as default};