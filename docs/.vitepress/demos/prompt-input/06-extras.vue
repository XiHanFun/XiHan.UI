<!-- 框里的附加节点 | root 里除三件外还能放自己的按钮与计数；值的读写归宿主，原生属性照旧直接落到输入框上 -->
<script setup lang="ts">
import {
  XhButton,
  XhPromptInputInput,
  XhPromptInputRoot,
  XhPromptInputSubmitTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const max = 40;
const log = ref("（还没发过）");
</script>

<template>
  <div style="display: grid; gap: 12px">
    <XhPromptInputRoot
      v-slot="{ value, setValue }"
      default-value="输入框两侧各放了一颗自己的按钮"
      :translations="{ input: '给助手写点什么' }"
      @submit="log = `提交：${$event.value}`"
    >
      <XhButton variant="ghost" size="sm">附件</XhButton>
      <!-- maxlength 是原生属性，直接落到 textarea 上 -->
      <XhPromptInputInput :maxlength="max" rows="1" placeholder="最多 40 个字" />
      <span style="font-size: 13px; white-space: nowrap">{{ value.length }} / {{ max }}</span>
      <!-- 有内容才给清空，清空后按钮自己转灰 -->
      <XhButton variant="ghost" size="sm" :disabled="value === ''" @click="setValue('')">
        清空
      </XhButton>
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>
    <span>{{ log }}</span>
  </div>
</template>
