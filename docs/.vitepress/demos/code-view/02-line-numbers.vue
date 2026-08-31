<!-- 行号与高亮行 | 行号由皮肤画上去，复制代码不会带上它；高亮行按行号写，与 startLine 对齐 -->
<script setup lang="ts">
import { XhCodeViewCode, XhCodeViewPre, XhCodeViewRoot } from "@xihan-ui/vue";

const sample = `function resolve(input: string) {
  const trimmed = input.trim()
  if (trimmed === '') {
    return null
  }
  return trimmed.toLowerCase()
}`;
</script>

<template>
  <!-- 这段是从第 42 行摘出来的，高亮那三行是要读者看的地方 -->
  <XhCodeViewRoot
    :code="sample"
    lang="typescript"
    complete
    line-numbers
    :start-line="42"
    highlight-lines="44-46"
    style="inline-size: 100%;"
  >
    <XhCodeViewPre>
      <XhCodeViewCode />
    </XhCodeViewPre>
  </XhCodeViewRoot>
</template>
