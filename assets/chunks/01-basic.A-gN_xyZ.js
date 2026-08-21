const e=`<!-- 基础用法 | 一排互斥选项：root 是 radiogroup、每段是 radio；整组只占一个 Tab 位，进组后四个方向键都能走 -->
<script setup lang="ts">
import { XhSegmentedRoot } from "@xihan-ui/vue";

const ranges = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];
<\/script>

<template>
  <!-- 不传 value 即非受控，default-value 只给初值；组本身没有可见标题，名字要自己给 -->
  <XhSegmentedRoot
    :collection="ranges"
    default-value="week"
    aria-label="时间粒度"
  />
</template>
`;export{e as default};
