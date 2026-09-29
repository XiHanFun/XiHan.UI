const e=`<!-- 回到底部带未读数 | 离开底部期间新到的消息记成未读，数字挂在回到底部按钮上并进入它的可访问名；回到底部即清零 -->
<script setup lang="ts">
import {
  XhMessageFeedItem,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedScrollToEndTrigger,
  XhMessageFeedUnreadCount,
  XhMessageFeedViewport,
} from "@xihan-ui/vue";
import { onBeforeUnmount, onMounted, ref } from "vue";

const messages = ref(Array.from({ length: 8 }, (_, index) => ({
  id: \`m\${index + 1}\`,
  text: index === 0 ? "第 1 条：往上翻，之后到的消息会记成未读。" : \`第 \${index + 1} 条消息。\`,
})));

let timer = 0;
function tick() {
  const n = messages.value.length + 1;
  messages.value = [...messages.value, { id: \`m\${n}\`, text: \`第 \${n} 条消息。\` }];
  if (n < 30)
    timer = window.setTimeout(tick, 2000);
}
// 挂载后才起：<script setup> 顶层在服务端渲染时也执行，那里没有 window
onMounted(() => {
  timer = window.setTimeout(tick, 2000);
});

onBeforeUnmount(() => window.clearTimeout(timer));
<\/script>

<template>
  <XhMessageFeedRoot :count="messages.length" style="block-size: 240px">
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
    <XhMessageFeedScrollToEndTrigger>
      <XhMessageFeedUnreadCount />
    </XhMessageFeedScrollToEndTrigger>
  </XhMessageFeedRoot>
</template>
`;export{e as default};
