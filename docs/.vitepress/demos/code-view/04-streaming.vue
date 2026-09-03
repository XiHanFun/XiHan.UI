<!-- 流式追加 | 代码还在写的时候默认不着色：半截代码的词法本来就不稳，每来一个字符整块变色比不着色更糟 -->
<script setup lang="ts">
import { XhCodeViewCode, XhCodeViewPre, XhCodeViewRoot } from "@xihan-ui/vue";
import { onBeforeUnmount, onMounted, ref } from "vue";

const full = `async function load(id: string) {
  const res = await fetch(\`/api/items/\${id}\`)
  return res.json()
}`;

const code = ref("");
const complete = ref(false);

let timer = 0;
const tick = () => {
  if (code.value.length >= full.length) {
    complete.value = true;
    return;
  }
  code.value = full.slice(0, code.value.length + 2);
  timer = window.setTimeout(tick, 60);
};
// 挂载后才开始追加：<script setup> 顶层在服务端渲染时也执行，那里没有 window
onMounted(tick);

onBeforeUnmount(() => window.clearTimeout(timer));
</script>

<template>
  <!-- complete 翻真的那一刻着色才上；高度一直按当前行数撑着，不会一跳一跳 -->
  <XhCodeViewRoot
    :code="code"
    :complete="complete"
    lang="typescript"
    style="inline-size: 100%;"
  >
    <XhCodeViewPre>
      <XhCodeViewCode />
    </XhCodeViewPre>
  </XhCodeViewRoot>
</template>
