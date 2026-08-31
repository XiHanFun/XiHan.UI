<!-- 与消息流合成一个对话 | 发送键原位变停止；提交后粘底跟到最新一条，生成期间还能接着改下一句 -->
<script setup lang="ts">
import {
  XhMessageFeedItem,
  XhMessageFeedItemLabel,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedScrollButton,
  XhMessageFeedViewport,
  XhPromptInputInput,
  XhPromptInputRoot,
  XhPromptInputSubmitTrigger,
} from "@xihan-ui/vue";
import { onBeforeUnmount, ref } from "vue";

interface Message {
  id: string;
  role: "user" | "assistant";
  who: string;
  text: string;
}

const messages = ref<Message[]>([
  { id: "m0", role: "assistant", who: "助手", text: "问点什么试试。" },
]);
const busy = ref(false);

let timer = 0;
let seq = 0;

const reply = (question: string) => {
  const id = `a${(seq += 1)}`;
  messages.value = [...messages.value, { id, role: "assistant", who: "助手", text: "" }];
  const full = `收到「${question}」，这是一段边写边显示的回复。`;
  let at = 0;
  const tick = () => {
    at = Math.min(at + 2, full.length);
    messages.value = messages.value.map((m) => (m.id === id ? { ...m, text: full.slice(0, at) } : m));
    if (at < full.length) {
      timer = window.setTimeout(tick, 60);
      return;
    }
    busy.value = false;
  };
  tick();
};

const onSubmit = ({ value }: { value: string }) => {
  messages.value = [
    ...messages.value,
    { id: `u${(seq += 1)}`, role: "user", who: "我", text: value },
  ];
  busy.value = true;
  reply(value);
};

const onStop = () => {
  window.clearTimeout(timer);
  busy.value = false;
};

onBeforeUnmount(() => window.clearTimeout(timer));
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; block-size: 320px;">
    <XhMessageFeedRoot :count="messages.length" :status="busy ? 'streaming' : 'idle'" style="flex: 1; min-block-size: 0;">
      <XhMessageFeedViewport>
        <XhMessageFeedList>
          <XhMessageFeedItem
            v-for="(message, index) in messages"
            :key="message.id"
            :item-id="message.id"
            :item-index="index"
            :item-role="message.role"
            :item-streaming="busy && index === messages.length - 1"
          >
            <XhMessageFeedItemLabel>{{ message.who }}</XhMessageFeedItemLabel>
            <div>{{ message.text }}</div>
          </XhMessageFeedItem>
        </XhMessageFeedList>
      </XhMessageFeedViewport>
      <XhMessageFeedScrollButton>↓</XhMessageFeedScrollButton>
    </XhMessageFeedRoot>

    <!-- busy 期间按钮换成停止，输入框仍可编辑：用户还要能改下一句 -->
    <XhPromptInputRoot
      :busy="busy"
      :translations="{ input: '给助手写点什么' }"
      @submit="onSubmit"
      @stop="onStop"
    >
      <XhPromptInputInput rows="1" placeholder="给助手写点什么…" />
      <XhPromptInputSubmitTrigger>{{ busy ? "停止" : "发送" }}</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>
  </div>
</template>
