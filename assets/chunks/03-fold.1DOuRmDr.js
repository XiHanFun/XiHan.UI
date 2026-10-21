var e=`<!-- 折叠超长代码 | clamped 是纯受控的：组件只发意图，是否落实由宿主决定，便于全部展开这类操作统一持有 -->
<script setup lang="ts">
import { XhCodeViewCode, XhCodeViewFoldTrigger, XhCodeViewPre, XhCodeViewRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const clamped = ref(true);

const sample = Array.from(
  { length: 24 },
  (_, i) => \`const step\${i + 1} = pipeline.at(\${i})\`,
).join("\\n");

// 读屏名由组件按折叠态取 translations 里的一句，钮上的字由作者写：两边取同一张表，看到的与读到的才对得上
const translations = { expand: "展开全部 24 行", collapse: "收起" };
<\/script>

<template>
  <XhCodeViewRoot
    v-model:clamped="clamped"
    :code="sample"
    lang="typescript"
    complete
    line-numbers
    :clamp="8"
    :translations="translations"
    style="inline-size: 100%;"
  >
    <XhCodeViewPre>
      <XhCodeViewCode />
    </XhCodeViewPre>
    <!-- 读屏名与 aria-expanded 由组件按折叠态翻面，钮上的字照同一张表跟着翻 -->
    <XhCodeViewFoldTrigger>
      {{ clamped ? translations.expand : translations.collapse }}
    </XhCodeViewFoldTrigger>
  </XhCodeViewRoot>
</template>
`;export{e as default};