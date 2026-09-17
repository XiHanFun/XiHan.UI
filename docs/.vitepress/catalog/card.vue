<script setup lang="ts">
import { XhCardContent, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/vue";
</script>

<template>
  <XhCardRoot style="inline-size: var(--xh-doc-catalog-w)">
    <XhCardHeader><XhCardTitle>卡片标题</XhCardTitle></XhCardHeader>
    <XhCardContent>卡片内容</XhCardContent>
  </XhCardRoot>
</template>
