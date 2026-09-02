<!-- 运行态与播报 | status 由宿主持有，组件只把它透出成 data-state；viewport 恒 aria-live="off"，播报只发生在 live-region 里 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhThreadContent,
  XhThreadLiveRegion,
  XhThreadRoot,
  XhThreadViewport,
} from "@xihan-ui/vue";

type Status = "idle" | "submitted" | "streaming" | "error";

const messages = ref([{ id: 1, role: "用户", text: "帮我写一段开场白。" }]);
const status = ref<Status>("idle");
// 播报只写整段最终文本：中途逐字写等于让读屏把同一段话越念越长
const liveText = ref("");

let timer = 0;

function run(): void {
  window.clearTimeout(timer);
  messages.value = [{ id: 1, role: "用户", text: "帮我写一段开场白。" }];
  liveText.value = "";
  status.value = "submitted";

  timer = window.setTimeout(() => {
    status.value = "streaming";
    messages.value.push({ id: 2, role: "助手", text: "好的，正在往下写…" });

    timer = window.setTimeout(() => {
      const text = "好的，这是一段开场白：欢迎来到曦寒设计系统。";
      messages.value[1] = { id: 2, role: "助手", text };
      status.value = "idle";
      // 一轮结束时一次性写进播报区
      liveText.value = text;
    }, 1200);
  }, 600);
}
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhThreadRoot style="block-size: 200px" :status="status">
      <XhThreadViewport>
        <XhThreadContent>
          <p v-for="m in messages" :key="m.id" style="margin: 0">
            <strong>{{ m.role }}：</strong>{{ m.text }}
          </p>
        </XhThreadContent>
      </XhThreadViewport>
      <XhThreadLiveRegion>{{ liveText }}</XhThreadLiveRegion>
    </XhThreadRoot>

    <div>
      <XhButton variant="solid" @click="run">跑一轮</XhButton>
      <XhButton variant="outline" @click="status = 'error'">置为 error</XhButton>
      <span style="margin-inline-start: 12px">status：{{ status }}</span>
    </div>
  </div>
</template>
