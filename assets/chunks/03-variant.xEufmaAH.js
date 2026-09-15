const a=`<!-- 变体 | 设置复制按钮的外观 -->
<script setup lang="ts">
import { XhClipboardCopyTrigger, XhClipboardIndicator, XhClipboardRoot } from "@xihan-ui/vue";

const variants = ["solid", "subtle", "outline", "ghost"] as const;
const labels = { solid: "实心", subtle: "浅色", outline: "线框", ghost: "幽灵" };
<\/script>

<template>
  <XhClipboardRoot v-for="variant in variants" :key="variant" value="XiHan.UI" :variant="variant">
    <XhClipboardCopyTrigger>
      <XhClipboardIndicator>{{ labels[variant] }}</XhClipboardIndicator>
      <XhClipboardIndicator copied>已复制</XhClipboardIndicator>
    </XhClipboardCopyTrigger>
  </XhClipboardRoot>
</template>
`;export{a as default};
