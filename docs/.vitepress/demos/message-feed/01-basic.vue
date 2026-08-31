<!-- 基础用法 | 消息内容全由作者写；组件管的是集合语义、粘底与那一个播报区 -->
<script setup lang="ts">
import {
  XhMessageFeedItem,
  XhMessageFeedItemLabel,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedScrollButton,
  XhMessageFeedViewport,
} from "@xihan-ui/vue";

const messages = [
  { id: "m1", role: "user" as const, who: "我", text: "这个组件负责什么？" },
  { id: "m2", role: "assistant" as const, who: "助手", text: "集合语义、粘底跟随，以及一个统一的播报区。" },
  { id: "m3", role: "user" as const, who: "我", text: "气泡样式呢？" },
  { id: "m4", role: "assistant" as const, who: "助手", text: "气泡、头像、时间都由你自己写，按条目上的 data-role 出样式。" },
];
</script>

<template>
  <!-- 键盘：Tab 进来落在第一条，PageDown / PageUp 在消息之间走，Ctrl+End 一步走到流外 -->
  <XhMessageFeedRoot :count="messages.length" style="block-size: 260px;">
    <XhMessageFeedViewport>
      <XhMessageFeedList>
        <XhMessageFeedItem
          v-for="(message, index) in messages"
          :key="message.id"
          :item-id="message.id"
          :item-index="index"
          :item-role="message.role"
        >
          <XhMessageFeedItemLabel>{{ message.who }}</XhMessageFeedItemLabel>
          <div>{{ message.text }}</div>
        </XhMessageFeedItem>
      </XhMessageFeedList>
    </XhMessageFeedViewport>
    <XhMessageFeedScrollButton />
  </XhMessageFeedRoot>
</template>
