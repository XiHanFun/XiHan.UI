<!-- Enter 只换行 | submit-on-enter 关掉后 Enter 交回浏览器插入换行，发送只剩按钮一条路 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhComposerInput,
  XhComposerRoot,
  XhComposerSubmitTrigger,
} from "@xihan-ui/vue";

const value = ref("");
const log = ref("（还没发过）");
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhComposerRoot
      v-model:value="value"
      :submit-on-enter="false"
      @submit="log = `提交：${$event.value}`"
    >
      <XhComposerInput placeholder="Enter 在这里只换行" rows="2" />
      <XhComposerSubmitTrigger>发送</XhComposerSubmitTrigger>
    </XhComposerRoot>
    <span>{{ log }}</span>
  </div>
</template>
