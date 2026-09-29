const n=`<!-- 往前翻历史 | edge 设为 start：哨兵摆在列表开头，更早的消息插在前面，取数期间视口不跳 -->
<script setup lang="ts">
import { XhInfiniteScrollRoot, XhInfiniteScrollSentinel } from "@xihan-ui/vue";
import { onMounted, ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
let oldest = 100;
const messages = ref(Array.from({ length: 12 }, (_, i) => \`消息 \${oldest + i}\`));
const loading = ref(false);
const done = ref(false);

// 从最新一条看起
onMounted(() => {
  if (scrollEl.value)
    scrollEl.value.scrollTop = scrollEl.value.scrollHeight;
});

// 取更早的一页；这里用定时器代替真实请求。loading 要如实写：组件靠它知道什么时候守住视口
function onLoad(): void {
  loading.value = true;
  window.setTimeout(() => {
    const older = Array.from({ length: 8 }, (_, i) => \`消息 \${oldest - 8 + i}\`);
    oldest -= 8;
    messages.value = [...older, ...messages.value];
    loading.value = false;
    done.value = oldest <= 60;
  }, 500);
}
<\/script>

<template>
  <div
    ref="scrollEl"
    data-xh-scroll
    style="
      block-size: 240px;
      overflow: auto;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <XhInfiniteScrollRoot
      edge="start"
      :target="scrollEl"
      :loading="loading"
      :disabled="done"
      @load="onLoad"
    >
      <!-- 哨兵摆在第一条之前 -->
      <XhInfiniteScrollSentinel />
      <p style="margin: 0; padding: 8px 12px; color: var(--xh-fg-muted)">
        {{ done ? "没有更早的消息了" : loading ? "正在取更早的消息…" : "往上翻取更早的消息" }}
      </p>
      <div v-for="message in messages" :key="message" style="padding: 8px 12px">{{ message }}</div>
    </XhInfiniteScrollRoot>
  </div>
</template>
`;export{n as default};
