const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 局部范围 | 仅在指定区域内响应 -->
<script setup lang="ts">
import { XhHotkeys } from "@xihan-ui/vue";
import { ref } from "vue";

const count = ref(0);
const scope = ref<HTMLElement | null>(null);
<\/script>

<template>
  <div
    ref="scope"
    tabindex="0"
    style="padding: 12px 16px; border-radius: var(--xh-shape-control); background: var(--xh-bg-subtle)"
  >
    聚焦后按 Mod + Enter · {{ count ? \`已触发 \${count} 次\` : "等待输入" }}
    <XhHotkeys :keys="['Mod', 'Enter']" :target="() => scope" @hot-key="count += 1" />
  </div>
</template>
`;export{n as default};
