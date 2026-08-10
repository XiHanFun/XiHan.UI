<!-- 取行中 | loading 让日志区报 aria-busy 并把指针换成忙碌态；「正在拉取」那一行是作者自己渲的 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhButton, XhLogContent, XhLogLine, XhLogRoot, XhLogViewport } from "@xihan-ui/vue";

const lines = ref([
  "12:00:01  boot   服务已启动",
  "12:00:02  db     连接池就绪",
  "12:00:03  http   GET /health  200",
]);

const loading = ref(false);

// 取回来的一批行追加在后面，取的过程里 loading 立着
function fetchMore(): void {
  if (loading.value)
    return;
  loading.value = true;
  window.setTimeout(() => {
    const base = lines.value.length;
    for (let i = 1; i <= 5; i += 1)
      lines.value.push(`12:00:0${base + i}  http   GET /api/items/${1000 + base + i}  200`);
    loading.value = false;
  }, 1200);
}
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhLogRoot :rows="7" :loading="loading">
      <XhLogViewport>
        <XhLogContent>
          <XhLogLine v-for="(line, i) in lines" :key="i">{{ line }}</XhLogLine>
          <XhLogLine v-if="loading" style="color: var(--xh-fg-muted)">正在拉取下一批…</XhLogLine>
        </XhLogContent>
      </XhLogViewport>
    </XhLogRoot>

    <div>
      <XhButton variant="solid" :disabled="loading" @click="fetchMore">再取 5 行</XhButton>
    </div>
  </div>
</template>
