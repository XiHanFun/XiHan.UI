var e=`<!-- 基础用法 | 一万条只渲染可视区内的几条，root 要有确定高度，条目的主轴尺寸由作者按 estimateSize 自行编写 -->
<script setup lang="ts">
import type { VirtualizerRangeChangeDetails } from "@xihan-ui/headless";
import {
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 渲染区间经 range-change 报上来，只在区间真的变了时才报
const range = ref("—");

function onRangeChange({ startIndex, endIndex }: VirtualizerRangeChangeDetails): void {
  range.value = startIndex == null ? "—" : \`\${startIndex} – \${endIndex}\`;
}
<\/script>

<template>
  <XhVirtualizerRoot
    v-slot="{ virtualItems }"
    :count="10000"
    :estimate-size="36"
    style="block-size: 260px; inline-size: 100%; max-inline-size: 420px"
    @range-change="onRangeChange"
  >
    <XhVirtualizerViewport>
      <XhVirtualizerContent>
        <XhVirtualizerItem
          v-for="item in virtualItems"
          :key="item.key"
          :value="item.index"
          style="
            display: flex;
            align-items: center;
            height: 36px;
            padding-inline: 12px;
            border-block-end: var(--xh-stroke-thin) solid var(--xh-border-subtle);
          "
        >
          第 {{ item.index + 1 }} 条
        </XhVirtualizerItem>
      </XhVirtualizerContent>
    </XhVirtualizerViewport>
  </XhVirtualizerRoot>
  <span data-demo-output>可视区：{{ range }}</span>
</template>
`;export{e as default};