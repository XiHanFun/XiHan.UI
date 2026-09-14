<!-- 基础用法 | 复制安装命令 -->
<script setup lang="ts">
import { CheckIcon, ClipboardIcon } from "@xihan-ui/icons";
import {
  XhClipboardControl,
  XhClipboardCopyTrigger,
  XhClipboardIndicator,
  XhClipboardInput,
  XhClipboardLabel,
  XhClipboardRoot,
  XhIcon,
} from "@xihan-ui/vue";

const command = "pnpm add @xihan-ui/vue @xihan-ui/styles";
</script>

<template>
  <XhClipboardRoot :value="command">
    <XhClipboardLabel>安装命令</XhClipboardLabel>
    <XhClipboardControl>
      <XhClipboardInput />
      <XhClipboardCopyTrigger>
        <XhClipboardIndicator><XhIcon :icon="ClipboardIcon" /> 复制</XhClipboardIndicator>
        <XhClipboardIndicator copied><XhIcon :icon="CheckIcon" /> 已复制</XhClipboardIndicator>
      </XhClipboardCopyTrigger>
    </XhClipboardControl>
  </XhClipboardRoot>
</template>
