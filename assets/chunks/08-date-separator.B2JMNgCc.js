const e=`<!-- 按日期分隔 | 跨天的消息之间放一条 separator，与条目平级写在列表里；它对读屏隐藏，时间由消息自己的时间戳表达 -->
<script setup lang="ts">
import {
  XhMessageFeedItem,
  XhMessageFeedItemLabel,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedSeparator,
  XhMessageFeedViewport,
} from "@xihan-ui/vue";
import { computed } from "vue";

const messages = [
  { id: "m1", day: "9 月 27 日", time: "21:40", role: "user" as const, who: "我", text: "明天的发布清单整理好了吗？" },
  { id: "m2", day: "9 月 27 日", time: "21:41", role: "assistant" as const, who: "助手", text: "整理好了，一共 12 项，明早再核一遍。" },
  { id: "m3", day: "今天", time: "09:02", role: "user" as const, who: "我", text: "开始核对吧。" },
  { id: "m4", day: "今天", time: "09:02", role: "assistant" as const, who: "助手", text: "第 1 项：构建产物已上传。" },
];

// 一天的第一条消息前面放一条分隔
const rows = computed(() => messages.map((message, index) => ({
  ...message,
  index,
  separator: index === 0 || messages[index - 1]!.day !== message.day ? message.day : null,
})));
<\/script>

<template>
  <XhMessageFeedRoot :count="messages.length" style="block-size: 280px">
    <XhMessageFeedViewport>
      <XhMessageFeedList>
        <template v-for="row in rows" :key="row.id">
          <XhMessageFeedSeparator v-if="row.separator">{{ row.separator }}</XhMessageFeedSeparator>
          <XhMessageFeedItem :item-id="row.id" :item-index="row.index" :item-role="row.role">
            <XhMessageFeedItemLabel>{{ row.who }} · {{ row.time }}</XhMessageFeedItemLabel>
            <div>{{ row.text }}</div>
          </XhMessageFeedItem>
        </template>
      </XhMessageFeedList>
    </XhMessageFeedViewport>
  </XhMessageFeedRoot>
</template>
`;export{e as default};
