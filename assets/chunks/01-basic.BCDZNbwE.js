const n=`<!-- 基础用法 | 挂载即从 from 走到 to，三个尺寸档只改字号；不写 size 就跟着上下文的字号走 -->
<script setup lang="ts">
import { XhNumberAnimation } from "@xihan-ui/vue";
<\/script>

<template>
  <XhNumberAnimation :from="0" :to="1024" size="sm" />
  <XhNumberAnimation :from="0" :to="12480" size="md" />
  <XhNumberAnimation :from="0" :to="98600" size="lg" tone="brand" />
</template>
`;export{n as default};
