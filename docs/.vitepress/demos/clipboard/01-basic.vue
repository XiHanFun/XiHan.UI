<!-- 基础用法 | 展示框是只读不是禁用：聚焦即全选，键盘用户照样能用 Ctrl / Cmd + C 自己带走 -->
<script setup lang="ts">
import { CheckIcon } from "@xihan-ui/icons";
import {
  XhClipboardControl,
  XhClipboardIndicator,
  XhClipboardInput,
  XhClipboardLabel,
  XhClipboardRoot,
  XhClipboardTrigger,
  XhIcon,
} from "@xihan-ui/vue";

const apiToken = "xh_live_9f2c7a41b6d84e05";
</script>

<template>
  <XhClipboardRoot :value="apiToken">
    <XhClipboardLabel>接口密钥</XhClipboardLabel>
    <XhClipboardControl>
      <XhClipboardInput />
      <XhClipboardTrigger>
        <!-- 两个指示器都常挂 DOM、靠 hidden 互斥显隐，来回切按钮不抖宽 -->
        <XhClipboardIndicator>复制</XhClipboardIndicator>
        <XhClipboardIndicator copied><XhIcon :icon="CheckIcon" /> 已复制</XhClipboardIndicator>
      </XhClipboardTrigger>
    </XhClipboardControl>
  </XhClipboardRoot>
</template>
