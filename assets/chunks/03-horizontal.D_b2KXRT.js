const n=`<!-- 横向排布 | orientation 只影响排版与 aria-orientation，方向键四个方向照样都能切换 -->
<script setup lang="ts">
import { XhRadioGroupRoot } from "@xihan-ui/vue";

const sizes = [
  { value: "sm", label: "小" },
  { value: "md", label: "中" },
  { value: "lg", label: "大" },
];
<\/script>

<template>
  <XhRadioGroupRoot
    :collection="sizes"
    default-value="md"
    label="尺寸"
    orientation="horizontal"
  />
</template>
`;export{n as default};
