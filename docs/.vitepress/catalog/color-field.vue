<!-- 提供 color-field 相关实现。 -->

<script setup lang="ts">
import { XhColorFieldControl, XhColorFieldInput, XhColorFieldRoot, XhColorFieldSwatch } from "@xihan-ui/vue";
</script>

<template>
  <XhColorFieldRoot default-value="#3b82f6">
    <XhColorFieldControl style="inline-size: var(--xh-doc-catalog-w-narrow)">
      <XhColorFieldSwatch />
      <XhColorFieldInput />
    </XhColorFieldControl>
  </XhColorFieldRoot>
</template>
