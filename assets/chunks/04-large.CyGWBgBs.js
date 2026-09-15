const n=`<!-- 大数据 | maxItems 把超长数组折成一行占位，maxStringLength 截掉过长的字符串，一份大 JSON 不会把页面压住 -->
<script setup lang="ts">
import { XhJsonViewerRoot } from "@xihan-ui/vue";

const payload = {
  total: 240,
  cursor:
    "eyJvZmZzZXQiOjAsImxpbWl0IjoyMCwic29ydCI6ImNyZWF0ZWRfYXQgZGVzYyJ9-very-long-token",
  items: Array.from({ length: 240 }, (_, i) => \`第 \${i + 1} 条\`),
};
<\/script>

<template>
  <XhJsonViewerRoot
    :value="payload"
    :default-expanded-depth="2"
    :max-items="5"
    :max-string-length="24"
    style="inline-size: 100%; max-inline-size: 420px"
  />
</template>
`;export{n as default};
