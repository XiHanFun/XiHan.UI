const e=`<!-- 流式未闭合 | complete 为 false 时默认不着色：半截代码的词法本来就不稳，每来一个记号整块变一次色比不着色更难看 -->
<script setup lang="ts">
import { XhCodeBlock } from "@xihan-ui/vue";

// 吐到一半的样子：最后一行断在半个表达式上，围栏也还没闭合
const partial = \`const stream = await client.chat({
  model: 'demo',
  messages,
  onToken(token) {
    buffer +=\`;
<\/script>

<template>
  <!-- 语言标注也没吐出来：空白、半截、不认识的一律落到 plaintext -->
  <XhCodeBlock :code="partial" :complete="false" style="inline-size: 100%;" />

  <!-- 真要看流式着色，把这一条打开 -->
  <XhCodeBlock
    :code="partial"
    lang="typescript"
    :complete="false"
    highlight-while-streaming
    style="inline-size: 100%;"
  />
</template>
`;export{e as default};
