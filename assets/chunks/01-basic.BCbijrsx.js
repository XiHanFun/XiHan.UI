const n=`<!-- 基础用法 | 哨兵滚进可视区就派 load，取完把 loading 写回 false -->
<script setup lang="ts">
import { ref } from "vue";
import { XhInfiniteScrollRoot, XhInfiniteScrollSentinel } from "@xihan-ui/vue";

const scrollEl = ref<HTMLElement | null>(null);
const items = ref(Array.from({ length: 12 }, (_, i) => \`第 \${i + 1} 条\`));
const loading = ref(false);

// 取下一页；这里用定时器代替真实请求
function onLoad(): void {
  loading.value = true;
  window.setTimeout(() => {
    const base = items.value.length;
    for (let i = 1; i <= 8; i += 1) items.value.push(\`第 \${base + i} 条\`);
    loading.value = false;
  }, 500);
}
<\/script>

<template>
  <div
    ref="scrollEl"
    style="
      block-size: 240px;
      overflow: auto;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <!-- target 指向真正在滚的那层；不给就以窗口视口为准 -->
    <XhInfiniteScrollRoot :target="scrollEl" :loading="loading" @load="onLoad">
      <div v-for="item in items" :key="item" style="padding: 8px 12px">{{ item }}</div>
      <p v-if="loading" style="margin: 0; padding: 8px 12px; color: var(--xh-fg-muted)">
        正在取下一页…
      </p>
      <!-- 哨兵摆在列表最后一条之后 -->
      <XhInfiniteScrollSentinel />
    </XhInfiniteScrollRoot>
  </div>
</template>
`;export{n as default};
