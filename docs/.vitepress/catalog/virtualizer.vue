<script setup lang="ts">
import { XhVirtualizerContent, XhVirtualizerItem, XhVirtualizerRoot, XhVirtualizerViewport } from "@xihan-ui/vue";
</script>

<template>
  <XhVirtualizerRoot v-slot="{ virtualItems }" :count="10000" :estimate-size="32" style="block-size: var(--xh-doc-catalog-h); inline-size: var(--xh-doc-catalog-w)">
    <XhVirtualizerViewport>
      <XhVirtualizerContent>
        <XhVirtualizerItem
          v-for="item in virtualItems"
          :key="item.key"
          :value="item.index"
          style="display: flex; align-items: center; block-size: var(--xh-control-h-sm); padding-inline: var(--xh-space-3); border-block-end: var(--xh-stroke-thin) solid var(--xh-border-subtle)"
        >
          第 {{ item.index + 1 }} 条
        </XhVirtualizerItem>
      </XhVirtualizerContent>
    </XhVirtualizerViewport>
  </XhVirtualizerRoot>
</template>
