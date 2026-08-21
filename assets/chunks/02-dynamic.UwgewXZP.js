const e=`<!-- 动态高度 | 条目开了 measure 就把真实尺寸回喂给内核，estimateSize 只是首帧的起点，滚过一遍就收敛 -->
<script setup lang="ts">
import {
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";

// 每条的文字长度不同，渲出来的高度自然也不同
const rows = Array.from({ length: 500 }, (_, i) => ({
  index: i,
  text: \`第 \${i + 1} 条 —— \${"这一段是用来把行撑高的占位文字。".repeat((i % 4) + 1)}\`,
}));
<\/script>

<template>
  <XhVirtualizerRoot
    v-slot="{ virtualItems, totalSize }"
    :count="rows.length"
    :estimate-size="64"
    style="block-size: 260px; inline-size: 100%; max-inline-size: 420px"
  >
    <XhVirtualizerViewport>
      <XhVirtualizerContent>
        <!-- 不给主轴尺寸：给了就把测量钉死在估算值上，measure 再也收敛不了 -->
        <XhVirtualizerItem
          v-for="item in virtualItems"
          :key="item.key"
          :value="item.index"
          measure
          style="
            padding: 8px 12px;
            border-block-end: 1px solid var(--xh-border-subtle);
            line-height: 20px;
          "
        >
          {{ rows[item.index].text }}
          <small>（实测 {{ Math.round(item.size) }}px · 总长 {{ Math.round(totalSize) }}px）</small>
        </XhVirtualizerItem>
      </XhVirtualizerContent>
    </XhVirtualizerViewport>
  </XhVirtualizerRoot>
</template>
`;export{e as default};
