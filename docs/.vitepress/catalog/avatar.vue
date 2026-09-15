<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhAvatarRoot src="/images/demo-avatar.svg" alt="曦寒">
      <XhAvatarImage />
      <XhAvatarFallback>曦</XhAvatarFallback>
    </XhAvatarRoot>
    <XhAvatarRoot tone="brand">
      <XhAvatarImage />
      <XhAvatarFallback>XH</XhAvatarFallback>
    </XhAvatarRoot>
  </div>
</template>
