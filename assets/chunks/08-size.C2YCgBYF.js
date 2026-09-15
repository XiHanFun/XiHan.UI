const e=`<!-- 尺寸 | size 换字号、行高与内边距三档，行号槽与折叠钮跟着一起走 -->
<script setup lang="ts">
import {
  XhCodeViewCode,
  XhCodeViewFilename,
  XhCodeViewHeader,
  XhCodeViewPre,
  XhCodeViewRoot,
} from "@xihan-ui/vue";

const sample = \`export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}\`;
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XhCodeViewRoot
      v-for="size in ['sm', 'md', 'lg']"
      :key="size"
      :size="size"
      :code="sample"
      lang="typescript"
      :filename="\`clamp.\${size}.ts\`"
      complete
      style="inline-size: 100%"
    >
      <XhCodeViewHeader>
        <XhCodeViewFilename />
      </XhCodeViewHeader>
      <XhCodeViewPre>
        <XhCodeViewCode />
      </XhCodeViewPre>
    </XhCodeViewRoot>
  </div>
</template>
`;export{e as default};
