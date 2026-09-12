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
  <XhClipboardRoot value="https://xihan.dev">
    <XhClipboardControl>
      <XhClipboardInput />
      <XhClipboardCopyTrigger>
        <XhClipboardIndicator>复制</XhClipboardIndicator>
      </XhClipboardCopyTrigger>
    </XhClipboardControl>
  </XhClipboardRoot>
</template>
