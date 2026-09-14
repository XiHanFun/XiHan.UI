<script setup lang="ts">
import { XhBadge, XhButton } from "@xihan-ui/vue";
</script>

<template>
  <XhBadge :count="8" tone="danger" label="8 条未读">
    <XhButton variant="outline">收件箱</XhButton>
  </XhBadge>
</template>
