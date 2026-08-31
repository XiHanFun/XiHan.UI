<!-- 粘底跟随与播报 | 新消息长出来时自动到底，往上翻就解除；一轮结束在播报区念一句 -->
<script setup lang="ts">
import {
  XhMessageFeedItem,
  XhMessageFeedList,
  XhMessageFeedLiveRegion,
  XhMessageFeedRoot,
  XhMessageFeedScrollButton,
  XhMessageFeedViewport,
} from "@xihan-ui/vue";
import { onBeforeUnmount, ref } from "vue";

const messages = ref([{ id: "m0", text: "第 1 条：往上翻一下，粘附会解除，右下角出现回到底部。" }]);
const announcement = ref("");
const sticking = ref(true);

let timer = 0;
const tick = () => {
  const n = messages.value.length + 1;
  messages.value = [...messages.value, { id: `m${n}`, text: `第 ${n} 条：内容还在长。` }];
  announcement.value = `已收到 ${n} 条消息`;
  if (n < 12) timer = window.setTimeout(tick, 1200);
};
timer = window.setTimeout(tick, 1200);

onBeforeUnmount(() => window.clearTimeout(timer));
</script>

<template>
  <XhMessageFeedRoot
    :count="messages.length"
    status="streaming"
    style="block-size: 220px;"
    @stick-change="sticking = $event.sticking"
  >
    <XhMessageFeedViewport>
      <XhMessageFeedList>
        <XhMessageFeedItem
          v-for="(message, index) in messages"
          :key="message.id"
          :item-id="message.id"
          :item-index="index"
          item-role="assistant"
        >
          {{ message.text }}
        </XhMessageFeedItem>
      </XhMessageFeedList>
    </XhMessageFeedViewport>
    <XhMessageFeedScrollButton>↓</XhMessageFeedScrollButton>
    <!-- 一份会话只该有这一个活区：每条消息各开一个会互相打断 -->
    <XhMessageFeedLiveRegion>{{ announcement }}</XhMessageFeedLiveRegion>
  </XhMessageFeedRoot>
</template>
