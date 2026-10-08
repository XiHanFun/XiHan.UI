var e=`<!-- 按块折叠 | block-folding 按缩进找出语法块，块头行首给一颗折叠钮；折叠集合写块头的行号，可受控（folded）也可非受控（default-folded）；一组钮只占一个 Tab 位、上下方向键在组内走 -->
<script setup lang="ts">
import { XhCodeViewCode, XhCodeViewPre, XhCodeViewRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const sample = \`export function createQueue<T>(limit: number) {
  const pending: T[] = []

  function push(item: T) {
    if (pending.length >= limit) {
      pending.shift()
    }
    pending.push(item)
  }

  function drain(handle: (item: T) => void) {
    while (pending.length > 0) {
      handle(pending.shift()!)
    }
  }

  return { push, drain }
}\`;

// 受控写法：v-model:folded 拿到折叠着的块头行号
const folded = ref([11]);
<\/script>

<template>
  <div style="display: grid; gap: 8px; inline-size: 100%">
    <XhCodeViewRoot
      v-model:folded="folded"
      :code="sample"
      lang="typescript"
      complete
      line-numbers
      block-folding
    >
      <XhCodeViewPre>
        <XhCodeViewCode />
      </XhCodeViewPre>
    </XhCodeViewRoot>
    <span>折叠着的块头：{{ folded.length > 0 ? folded.join("、") : "无" }}</span>
  </div>
</template>
`;export{e as default};