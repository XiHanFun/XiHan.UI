<!-- 尺寸 | 使用小、中、大三档尺寸 -->
<script setup lang="ts">
import {
  XhClipboardControl,
  XhClipboardCopyTrigger,
  XhClipboardIndicator,
  XhClipboardInput,
  XhClipboardRoot,
} from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 12px">
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
</template>
