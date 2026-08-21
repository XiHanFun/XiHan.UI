const e=`<!-- 基础用法 | 选中值恒是数组，条目按 value 标识身份；禁用的条目方向键会跳过 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhSelectRoot } from "@xihan-ui/vue";

const fruit = ref<string[]>([]);
const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "blueberry", label: "蓝莓" },
  { value: "cherry", label: "樱桃（缺货）", disabled: true },
  { value: "durian", label: "榴莲" },
];
<\/script>

<template>
  <XhSelectRoot v-model:value="fruit" :collection="fruits" label="水果" placeholder="请选择" />
  <p>当前值：{{ fruit.length ? fruit.join("、") : "（未选）" }}</p>
</template>
`;export{e as default};
