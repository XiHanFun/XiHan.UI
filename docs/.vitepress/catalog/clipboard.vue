<script setup lang="ts">
import {
  XhClipboardControl,
  XhClipboardCopyTrigger,
  XhClipboardIndicator,
  XhClipboardInput,
  XhClipboardRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhClipboardRoot value="pnpm add @xihan-ui/vue">
    <XhClipboardControl>
      <XhClipboardInput />
      <XhClipboardCopyTrigger>
        <XhClipboardIndicator>复制</XhClipboardIndicator>
        <XhClipboardIndicator copied>已复制</XhClipboardIndicator>
      </XhClipboardCopyTrigger>
    </XhClipboardControl>
  </XhClipboardRoot>
</template>
