const e=`<!-- 只注册不显示 | 全局快捷键用 useHotkeys；键帽要不要出是另一件事，组件本身就是它的消费者 -->
<script setup lang="ts">
import { useHotkeys } from "@xihan-ui/vue";
import { ref } from "vue";

const hits = ref(0);

useHotkeys(() => ({
  keys: ["Mod", "k"],
  preventDefault: true,
  onHotKey: () => {
    hits.value += 1;
  },
}));
<\/script>

<template>
  <p>按 Mod+K（Mac 上是 ⌘K）：已命中 {{ hits }} 次。这一段没有渲染任何键帽。</p>
</template>
`;export{e as default};
