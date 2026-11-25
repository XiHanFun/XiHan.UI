<!-- 形态与尺寸 | variant 设置复制按钮的外观，size 分小、中、大三档 -->
<script setup lang="ts">
import {
  XhClipboardControl,
  XhClipboardCopyTrigger,
  XhClipboardIndicator,
  XhClipboardInput,
  XhClipboardRoot,
} from "@xihan-ui/vue";

const variants = ["solid", "subtle", "outline", "ghost"] as const;
const labels = { solid: "实心", subtle: "浅色", outline: "线框", ghost: "幽灵" };
const sizes = ["sm", "md", "lg"] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--xh-space-6)">
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--xh-space-3)">
      <XhClipboardRoot v-for="variant in variants" :key="variant" value="XiHan.UI" :variant="variant">
        <XhClipboardCopyTrigger>
          <XhClipboardIndicator>{{ labels[variant] }}</XhClipboardIndicator>
          <XhClipboardIndicator copied>已复制</XhClipboardIndicator>
        </XhClipboardCopyTrigger>
      </XhClipboardRoot>
    </div>

    <div style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--xh-space-3)">
      <XhClipboardRoot v-for="size in sizes" :key="size" value="pnpm add @xihan-ui/vue" :size="size">
        <XhClipboardControl>
          <XhClipboardInput />
          <XhClipboardCopyTrigger>
            <XhClipboardIndicator>复制</XhClipboardIndicator>
            <XhClipboardIndicator copied>已复制</XhClipboardIndicator>
          </XhClipboardCopyTrigger>
        </XhClipboardControl>
      </XhClipboardRoot>
    </div>
  </div>
</template>
