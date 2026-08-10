<!-- 会话页 | 线程管滚动与粘底，编辑器管收话：发出去先落一条自己的消息，回话一段段写进来时消息区自动跟到底 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhComposerInput,
  XhComposerRoot,
  XhComposerSubmitTrigger,
  XhThreadContent,
  XhThreadRoot,
  XhThreadScrollButton,
  XhThreadViewport,
} from "@xihan-ui/vue";

type Status = "idle" | "streaming";

const reply = "好的，这就往下写。消息一段段进来时，消息区跟着往下走；你要是自己滚上去看旧消息，它就停在那儿等你回来。";

const messages = ref([{ id: 1, role: "助手", text: "有什么想问的？" }]);
const status = ref<Status>("idle");

let nextId = 1;
let timer = 0;

function onSubmit(details: { value: string }): void {
  window.clearTimeout(timer);
  nextId += 1;
  messages.value.push({ id: nextId, role: "用户", text: details.value });
  nextId += 1;
  const replyId = nextId;
  messages.value.push({ id: replyId, role: "助手", text: "" });
  status.value = "streaming";

  let cut = 0;
  const step = (): void => {
    cut += 6;
    const target = messages.value.find(m => m.id === replyId);
    if (target)
      target.text = reply.slice(0, cut);
    if (cut < reply.length) {
      timer = window.setTimeout(step, 90);
      return;
    }
    status.value = "idle";
  };
  step();
}

// 停止只是不再往下写，已经写出来的那半段留在原处
function onStop(): void {
  window.clearTimeout(timer);
  status.value = "idle";
}
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhThreadRoot style="block-size: 240px" :status="status">
      <XhThreadViewport>
        <XhThreadContent>
          <p v-for="m in messages" :key="m.id" style="margin: 0">
            <strong>{{ m.role }}：</strong>{{ m.text }}
          </p>
        </XhThreadContent>
      </XhThreadViewport>
      <XhThreadScrollButton>↓ 回到底部</XhThreadScrollButton>
    </XhThreadRoot>

    <XhComposerRoot
      :run-status="status === 'streaming' ? 'streaming' : 'ready'"
      @submit="onSubmit"
      @stop="onStop"
    >
      <XhComposerInput placeholder="说点什么…" rows="1" />
      <XhComposerSubmitTrigger>
        {{ status === "streaming" ? "停止" : "发送" }}
      </XhComposerSubmitTrigger>
    </XhComposerRoot>
  </div>
</template>
