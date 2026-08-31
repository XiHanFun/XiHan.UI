<!-- 折叠超长代码 | clamped 是纯受控的：组件只发意图，落不落由宿主决定，好让「全部展开」这类操作统一持有 -->
<script setup lang="ts">
import { XhCodeViewCode, XhCodeViewFoldTrigger, XhCodeViewPre, XhCodeViewRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const clamped = ref(true);

const sample = Array.from(
  { length: 24 },
  (_, i) => `const step${i + 1} = pipeline.at(${i})`,
).join("\n");
</script>

<template>
  <XhCodeViewRoot
    v-model:clamped="clamped"
    :code="sample"
    lang="typescript"
    complete
    line-numbers
    :clamp="8"
    style="inline-size: 100%;"
  >
    <XhCodeViewPre>
      <XhCodeViewCode />
    </XhCodeViewPre>
    <!-- 按钮的文案与 aria-expanded 由组件按折叠态翻面 -->
    <XhCodeViewFoldTrigger>
      {{ clamped ? `展开全部 24 行` : "收起" }}
    </XhCodeViewFoldTrigger>
  </XhCodeViewRoot>
</template>
