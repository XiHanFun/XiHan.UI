var e=`<!-- ANSI 着色 | 行上写 ansi 交出带转义的原文，按 SGR 拆成着色的段：颜色映射到语义色，粗体、暗淡、下划线各自生效，其余转义不显示 -->
<script setup lang="ts">
import { XhLogContent, XhLogLine, XhLogRoot, XhLogViewport } from "@xihan-ui/vue";

const ESC = "\\u001B";
const lines = [
  \`\${ESC}[2m$ pnpm build\${ESC}[0m\`,
  \`\${ESC}[36mvite\${ESC}[0m v7.1.2 \${ESC}[32mbuilding for production...\${ESC}[0m\`,
  \`\${ESC}[32m✓\${ESC}[0m 1,204 modules transformed.\`,
  \`\${ESC}[33m(!) Some chunks are larger than 500 kB after minification.\${ESC}[0m\`,
  \`\${ESC}[1;31merror\${ESC}[0m src/app.ts(12,3): \${ESC}[4mType 'string' is not assignable to type 'number'.\${ESC}[0m\`,
  \`\${ESC}[1;32m✓ built in 4.21s\${ESC}[0m\`,
];
<\/script>

<template>
  <XhLogRoot :rows="6" style="inline-size: 100%">
    <XhLogViewport>
      <XhLogContent>
        <XhLogLine v-for="(line, i) in lines" :key="i" :ansi="line" />
      </XhLogContent>
    </XhLogViewport>
  </XhLogRoot>
</template>
`;export{e as default};