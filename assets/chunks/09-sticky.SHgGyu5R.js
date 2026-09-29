const e=`<!-- 分组标题 | stickyIndices 登记标题的下标：滚过它之后它钉在起点，下一组的标题滚上来时接替 -->
<script setup lang="ts">
import {
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";

const groups = ["A", "B", "C", "D", "E", "F"];
const rows = groups.flatMap(letter => [
  { header: true, text: letter },
  ...Array.from({ length: 12 }, (_, i) => ({ header: false, text: \`\${letter}\${i + 1} 联系人\` })),
]);
const stickyIndices = rows.flatMap((row, index) => (row.header ? [index] : []));
<\/script>

<template>
  <XhVirtualizerRoot
    v-slot="{ virtualItems }"
    :count="rows.length"
    :estimate-size="36"
    :sticky-indices="stickyIndices"
    style="block-size: 260px; inline-size: 100%; max-inline-size: 420px"
  >
    <XhVirtualizerViewport>
      <XhVirtualizerContent>
        <!-- 钉住的条目自带实底（--xh-virtualizer-sticky-bg），滚过去的条目从它下面穿过 -->
        <XhVirtualizerItem
          v-for="item in virtualItems"
          :key="item.key"
          :value="item.index"
          :style="
            rows[item.index]!.header
              ? 'display: flex; align-items: center; height: 36px; padding-inline: 12px; font-weight: 600; color: var(--xh-fg-muted)'
              : 'display: flex; align-items: center; height: 36px; padding-inline: 12px; border-block-end: 1px solid var(--xh-border-subtle)'
          "
        >
          {{ rows[item.index]!.text }}
        </XhVirtualizerItem>
      </XhVirtualizerContent>
    </XhVirtualizerViewport>
  </XhVirtualizerRoot>
</template>
`;export{e as default};
