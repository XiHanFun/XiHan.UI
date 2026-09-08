const e=`<!-- 尺寸 | size 换字号、行高与行号槽的宽度，三档并列对照 -->
<script setup lang="ts">
import { computeTextDiff } from "@xihan-ui/headless";
import { XhDiffViewBody, XhDiffViewHeader, XhDiffViewRoot, XhDiffViewViewport } from "@xihan-ui/vue";
import { computed } from "vue";

const before = \`export function clamp(n: number, min: number) {
  return Math.max(n, min)
}\`;

const after = \`export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}\`;

const model = computed(() => computeTextDiff(before, after));
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XhDiffViewRoot v-for="size in ['sm', 'md', 'lg']" :key="size" :model="model" :size="size">
      <XhDiffViewHeader>src/clamp.ts · {{ size }}</XhDiffViewHeader>
      <XhDiffViewViewport>
        <XhDiffViewBody />
      </XhDiffViewViewport>
    </XhDiffViewRoot>
  </div>
</template>
`;export{e as default};
