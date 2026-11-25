<!-- 尺寸 | size 切换字号、行高与内边距三档，行号槽与折叠按钮随之变化 -->
<script setup lang="ts">
import {
  XhCodeViewCode,
  XhCodeViewFileName,
  XhCodeViewHeader,
  XhCodeViewPre,
  XhCodeViewRoot,
} from "@xihan-ui/vue";

const sample = `export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}`;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XhCodeViewRoot
      v-for="size in ['sm', 'md', 'lg']"
      :key="size"
      :size="size"
      :code="sample"
      lang="typescript"
      :file-name="`clamp.${size}.ts`"
      complete
      style="inline-size: 100%"
    >
      <XhCodeViewHeader>
        <XhCodeViewFileName />
      </XhCodeViewHeader>
      <XhCodeViewPre>
        <XhCodeViewCode />
      </XhCodeViewPre>
    </XhCodeViewRoot>
  </div>
</template>
