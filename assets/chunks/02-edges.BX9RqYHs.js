const e=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 全部边缘 | 从任意边缘或角点调整尺寸 -->
<script setup lang="ts">
import { XhResizableHandle, XhResizableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const dimensions = ref({ width: 240, height: 120 });
const EDGES = ["n", "ne", "e", "se", "s", "sw", "w", "nw"] as const;
<\/script>

<template>
  <XhResizableRoot
    v-model:dimensions="dimensions"
    :edges="[...EDGES]"
    :min-width="120"
    :min-height="80"
    style="border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); padding: 16px"
  >
    <span>从任意边缘调整</span>
    <XhResizableHandle v-for="edge in EDGES" :key="edge" :edge="edge" />
  </XhResizableRoot>
</template>
`;export{e as default};
