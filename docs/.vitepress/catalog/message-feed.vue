<script setup lang="ts">
import { XhMessageFeedItem, XhMessageFeedItemLabel, XhMessageFeedList, XhMessageFeedRoot, XhMessageFeedViewport } from "@xihan-ui/vue";

const messages = [
  { id: "m1", role: "user" as const, who: "我", text: "这个组件负责什么？" },
  { id: "m2", role: "assistant" as const, who: "助手", text: "集合语义、粘底跟随与统一播报区。" },
];
</script>

<template>
  <XhMessageFeedRoot :count="messages.length" style="inline-size: var(--xh-doc-catalog-w); block-size: var(--xh-doc-catalog-h)">
    <XhMessageFeedViewport>
      <XhMessageFeedList>
        <XhMessageFeedItem v-for="(message, index) in messages" :key="message.id" :item-id="message.id" :item-index="index" :item-role="message.role">
          <XhMessageFeedItemLabel>{{ message.who }}</XhMessageFeedItemLabel>
          <div>{{ message.text }}</div>
        </XhMessageFeedItem>
      </XhMessageFeedList>
    </XhMessageFeedViewport>
  </XhMessageFeedRoot>
</template>
