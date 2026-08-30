const e=`<!-- 只开放部分边 | edges 决定哪几条边可调；没开放的边不显示把手 -->
<script setup lang="ts">
import { XhResizableHandle, XhResizableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const size = ref({ width: 240, height: 120 });
// 只往右下角撑大——文档流里最常见的形态，不需要定位上下文也完全正确
const EDGES = ["e", "s", "se"] as const;
<\/script>

<template>
  <XhResizableRoot
    v-model:size="size"
    :edges="[...EDGES]"
    :min-width="120"
    :min-height="80"
    style="border: 1px solid var(--xh-border-default); border-radius: var(--xh-shape-surface); padding: 12px"
  >
    <span>只有右、下、右下三个把手</span>
    <XhResizableHandle v-for="edge in EDGES" :key="edge" :edge="edge" />
  </XhResizableRoot>
</template>
`;export{e as default};
