const e=`<!-- 尺寸 | 不传 size 即默认档；行高、内边距与字号一起换档，浮层里的候选也跟着变 -->
<script setup lang="ts">
import { XhComboboxRoot } from "@xihan-ui/vue";

const sizes = [
  { size: "sm", label: "sm" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "lg" },
];

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
];
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px">
    <XhComboboxRoot
      v-for="s in sizes"
      :key="s.label"
      :size="s.size"
      :collection="fruits"
      clearable
      :label="s.label"
      open-on-click
      placeholder="选择水果"
      style="width: 200px"
    />
  </div>
</template>
`;export{e as default};
