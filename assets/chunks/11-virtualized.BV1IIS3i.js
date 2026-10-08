var e=`<!-- 虚拟滚动 | 行数很大时把日志与 Virtualizer 接线：virtualizer 交出 collectionVirtualizer，行放进 Virtualizer 的条目里，只挂窗口里的那些；粘底跟着 Virtualizer 的视口走 -->
<script setup lang="ts">
import {
  XhLogLine,
  XhLogRoot,
  XhLogViewport,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";

const lines = Array.from({ length: 10000 }, (_, index) =>
  \`\${String(index + 1).padStart(5, "0")}  GET /api/orders/\${8000 + index}  200  \${(index % 90) + 10}ms\`);
<\/script>

<template>
  <XhVirtualizerRoot v-slot="{ virtualItems, collectionVirtualizer }" :count="lines.length" :estimate-size="20" style="inline-size: 100%">
    <XhLogRoot :rows="10" :virtualizer="collectionVirtualizer">
      <XhLogViewport>
        <XhVirtualizerViewport>
          <XhVirtualizerContent>
            <XhVirtualizerItem v-for="item in virtualItems" :key="item.key" :value="item.index">
              <XhLogLine>{{ lines[item.index] }}</XhLogLine>
            </XhVirtualizerItem>
          </XhVirtualizerContent>
        </XhVirtualizerViewport>
      </XhLogViewport>
    </XhLogRoot>
  </XhVirtualizerRoot>
</template>
`;export{e as default};