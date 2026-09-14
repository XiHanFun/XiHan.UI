<!-- 流式期间也着色 | 未闭合默认不着色；真要看着色就打开 highlight-while-streaming，同一段半截代码的两种呈现摆在一起 -->
<script setup lang="ts">
import { XhCodeViewCode, XhCodeViewPre, XhCodeViewRoot } from "@xihan-ui/vue";

// 吐到一半的样子：最后一行断在半个表达式上，围栏也还没闭合
const partial = `const stream = await client.chat({
  model: 'demo',
  messages,
  onToken(token) {
    buffer +=`;
</script>

<template>
  <div style="display: grid; gap: 12px">
    <!-- 语言标注也没吐出来：空白、半截、不认识的一律落到 plaintext -->
    <XhCodeViewRoot :code="partial" :complete="false" style="inline-size: 100%;">
      <XhCodeViewPre>
        <XhCodeViewCode />
      </XhCodeViewPre>
    </XhCodeViewRoot>

    <!-- 打开开关：半截代码也按当前词法着色，每来一个字符可能重新分色 -->
    <XhCodeViewRoot
      :code="partial"
      lang="typescript"
      :complete="false"
      highlight-while-streaming
      style="inline-size: 100%;"
    >
      <XhCodeViewPre>
        <XhCodeViewCode />
      </XhCodeViewPre>
    </XhCodeViewRoot>
  </div>
</template>
