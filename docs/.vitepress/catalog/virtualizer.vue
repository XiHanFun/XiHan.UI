<script setup lang="ts">
import { XhVirtualizerContent, XhVirtualizerItem, XhVirtualizerRoot, XhVirtualizerViewport } from "@xihan-ui/vue";
</script>

<template>
  <XhVirtualizerRoot v-slot="{ virtualItems }" :count="10000" :estimate-size="32" style="block-size: 150px; inline-size: 220px; font-size: 13px">
    <XhVirtualizerViewport>
      <XhVirtualizerContent>
        <XhVirtualizerItem
          v-for="item in virtualItems"
          :key="item.key"
          :value="item.index"
          style="display: flex; align-items: center; height: 32px; padding-inline: 12px; border-block-end: 1px solid var(--xh-border-subtle)"
        >
          第 {{ item.index + 1 }} 条
        </XhVirtualizerItem>
      </XhVirtualizerContent>
    </XhVirtualizerViewport>
  </XhVirtualizerRoot>
</template>
