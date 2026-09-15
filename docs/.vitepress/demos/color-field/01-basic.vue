<!-- 基础用法 | 输入框中的文字是草稿，回车或失焦提交后按 format 重写；色块绘制的是已提交的值，未完成的输入不会被提交 -->
<script setup lang="ts">
import {
  XhColorFieldClearTrigger,
  XhColorFieldControl,
  XhColorFieldHiddenInput,
  XhColorFieldInput,
  XhColorFieldLabel,
  XhColorFieldRoot,
  XhColorFieldSwatch,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref("#3b82f6");
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px">
    <XhColorFieldRoot v-model:value="value" name="accent" placeholder="#rrggbb" clearable>
      <XhColorFieldLabel>主题色</XhColorFieldLabel>
      <XhColorFieldControl style="inline-size: 16rem">
        <XhColorFieldSwatch />
        <XhColorFieldInput />
        <XhColorFieldClearTrigger />
      </XhColorFieldControl>
      <XhColorFieldHiddenInput />
    </XhColorFieldRoot>
    <span style="font-size: 13px">收下的值：<code>{{ value || "（空）" }}</code></span>
  </div>
</template>
