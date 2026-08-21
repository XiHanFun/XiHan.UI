const n=`<!-- 按行数定高 | rows 定的是「看得见几行」，一行有多高归皮肤，改 --xh-log-line-height 两边一起变 -->
<script setup lang="ts">
import { XhLogContent, XhLogLine, XhLogRoot, XhLogViewport } from "@xihan-ui/vue";

const lines = Array.from(
  { length: 24 },
  (_, i) => \`12:0\${Math.floor(i / 10)}:\${String(i % 10).padStart(2, "0")}  http  GET /api/items/\${1000 + i}  200\`,
);
<\/script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhLogRoot :rows="4">
      <XhLogViewport>
        <XhLogContent>
          <XhLogLine v-for="(line, i) in lines" :key="i">{{ line }}</XhLogLine>
        </XhLogContent>
      </XhLogViewport>
    </XhLogRoot>

    <XhLogRoot :rows="10">
      <XhLogViewport>
        <XhLogContent>
          <XhLogLine v-for="(line, i) in lines" :key="i">{{ line }}</XhLogLine>
        </XhLogContent>
      </XhLogViewport>
    </XhLogRoot>

    <!-- 同样 4 行，行高调宽一档，视口跟着一起长高 -->
    <XhLogRoot :rows="4" style="--xh-log-line-height: 1.75rem">
      <XhLogViewport>
        <XhLogContent>
          <XhLogLine v-for="(line, i) in lines" :key="i">{{ line }}</XhLogLine>
        </XhLogContent>
      </XhLogViewport>
    </XhLogRoot>
  </div>
</template>
`;export{n as default};
