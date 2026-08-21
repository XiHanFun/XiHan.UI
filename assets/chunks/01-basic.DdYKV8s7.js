const n=`<!-- 基础用法 | root / input / submit-trigger 三件缺一不可；Enter 提交、Shift+Enter 换行，清空发生在 submit 派发之后 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhComposerInput,
  XhComposerRoot,
  XhComposerSubmitTrigger,
} from "@xihan-ui/vue";

const value = ref("");
const log = ref("（还没发过）");

function onSubmit(details: { value: string }): void {
  // 这里拿到的是提交那一刻的原文
  log.value = \`提交：\${details.value}\`;
}
<\/script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhComposerRoot v-model:value="value" @submit="onSubmit">
      <XhComposerInput placeholder="说点什么…" rows="1" />
      <XhComposerSubmitTrigger>发送</XhComposerSubmitTrigger>
    </XhComposerRoot>
    <span>{{ log }}</span>
  </div>
</template>
`;export{n as default};
