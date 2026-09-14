<!-- 运行态与播报 | status 由宿主持有，组件只把它透出成 root 上的 data-state；播报只发生在 live-region 里，一轮结束才写一句 -->
<script setup lang="ts">
import {
  XhButton,
  XhMessageFeedItem,
  XhMessageFeedItemLabel,
  XhMessageFeedList,
  XhMessageFeedLiveRegion,
  XhMessageFeedRoot,
  XhMessageFeedViewport,
} from "@xihan-ui/vue";
import { onBeforeUnmount, ref } from "vue";

type Status = "idle" | "submitted" | "streaming" | "error";

const first = { id: "m1", role: "user" as const, who: "我", text: "帮我写一段开场白。" };
const messages = ref([first]);
const status = ref<Status>("idle");
// 播报只写整段最终文本：中途逐字写等于让读屏把同一段话越念越长
const announcement = ref("");

let timer = 0;

function run(): void {
  window.clearTimeout(timer);
  messages.value = [first];
  announcement.value = "";
  status.value = "submitted";

  timer = window.setTimeout(() => {
    status.value = "streaming";
    messages.value = [
      first,
      { id: "m2", role: "assistant" as const, who: "助手", text: "好的，正在往下写…" },
    ];

    timer = window.setTimeout(() => {
      const text = "好的，这是一段开场白：欢迎来到曦寒设计系统。";
      messages.value = [first, { id: "m2", role: "assistant" as const, who: "助手", text }];
      status.value = "idle";
      // 一轮结束时一次性写进播报区
      announcement.value = text;
    }, 1200);
  }, 600);
}

onBeforeUnmount(() => window.clearTimeout(timer));
</script>

<template>
  <div style="display: grid; gap: 12px">
    <XhMessageFeedRoot :count="messages.length" :status="status" style="block-size: 200px;">
      <XhMessageFeedViewport>
        <XhMessageFeedList>
          <XhMessageFeedItem
            v-for="(message, index) in messages"
            :key="message.id"
            :item-id="message.id"
            :item-index="index"
            :item-role="message.role"
            :item-streaming="status === 'streaming' && index === messages.length - 1"
          >
            <XhMessageFeedItemLabel>{{ message.who }}</XhMessageFeedItemLabel>
            <div>{{ message.text }}</div>
          </XhMessageFeedItem>
        </XhMessageFeedList>
      </XhMessageFeedViewport>
      <XhMessageFeedLiveRegion>{{ announcement }}</XhMessageFeedLiveRegion>
    </XhMessageFeedRoot>

    <div style="display: flex; align-items: center; gap: 8px">
      <XhButton variant="solid" @click="run">跑一轮</XhButton>
      <XhButton variant="outline" @click="status = 'error'">置为 error</XhButton>
      <span>status：{{ status }}</span>
    </div>
  </div>
</template>
