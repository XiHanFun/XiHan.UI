const n=`<!-- 尺寸 | 每格的边长随 size 换档，不传 size 即默认档 -->
<script setup lang="ts">
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 20px">
    <XhPinInputRoot v-for="s in sizes" :key="s.label" :size="s.size" :length="4" placeholder="·">
      <XhPinInputLabel>{{ s.label }}</XhPinInputLabel>
      <div style="display: flex">
        <XhPinInputInput v-for="i in 4" :key="i" :index="i - 1" />
      </div>
    </XhPinInputRoot>
  </div>
</template>
`;export{n as default};
