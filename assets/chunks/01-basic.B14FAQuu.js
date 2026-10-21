var e=`<!-- 基础用法 | 先选种类，再填这一种的参数，下方显示样例；派发的值是一份格式说明，交给格式化即可 -->
<script setup lang="ts">
import type { FormatSpec } from "@xihan-ui/expression";
import { XhFormatInputRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const format = ref<FormatSpec | null>({ kind: "number", decimals: 2, grouping: true });
<\/script>

<template>
  <XhFormatInputRoot v-model:value="format" aria-label="金额格式" />
  <p data-demo-output>值：{{ format === null ? "（不设格式）" : JSON.stringify(format) }}</p>
</template>
`;export{e as default};