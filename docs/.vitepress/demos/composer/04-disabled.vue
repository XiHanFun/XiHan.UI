<!-- 禁用与空值 | disabled 罩住整框并走原生 disabled；输入为空或只有空白时发送按钮转灰，但位置留着不收起 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhComposerInput,
  XhComposerRoot,
  XhComposerSubmitTrigger,
} from "@xihan-ui/vue";

const value = ref("");
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <!-- 整框禁用 -->
    <XhComposerRoot disabled default-value="这一台是禁用的">
      <XhComposerInput rows="1" />
      <XhComposerSubmitTrigger>发送</XhComposerSubmitTrigger>
    </XhComposerRoot>

    <!-- 空值：按钮转灰，敲进第一个非空白字符就亮 -->
    <XhComposerRoot v-model:value="value">
      <XhComposerInput placeholder="空着时发送按钮是灰的" rows="1" />
      <XhComposerSubmitTrigger>发送</XhComposerSubmitTrigger>
    </XhComposerRoot>
  </div>
</template>
