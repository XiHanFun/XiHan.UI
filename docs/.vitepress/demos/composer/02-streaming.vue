<!-- 流式与停止 | run-status 翻成 streaming 后，发送按钮原位变停止：同一个节点、同一个位置，只换 data-mode 与可访问名 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhComposerInput,
  XhComposerRoot,
  XhComposerSubmitTrigger,
} from "@xihan-ui/vue";

const value = ref("");
const streaming = ref(false);
const log = ref("（还没发过）");

function onSubmit(details: { value: string }): void {
  log.value = `提交：${details.value}`;
  // 运行态的真源在宿主，组件既不猜也不改
  streaming.value = true;
}

function onStop(): void {
  log.value = "已按下停止";
  streaming.value = false;
}
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhComposerRoot
      v-model:value="value"
      :run-status="streaming ? 'streaming' : 'ready'"
      @submit="onSubmit"
      @stop="onStop"
    >
      <XhComposerInput placeholder="发一条，按钮就变成停止" rows="1" />
      <XhComposerSubmitTrigger>
        {{ streaming ? "停止" : "发送" }}
      </XhComposerSubmitTrigger>
    </XhComposerRoot>
    <span>run-status：{{ streaming ? "streaming" : "ready" }} · {{ log }}</span>
  </div>
</template>
