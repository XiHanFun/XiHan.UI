<!-- 只注册不显示 | useHotkeys 只安装监听，展示是 Kbd/KbdGroup 的独立职责 -->
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
</script>

<template>
  <p>按 Mod+K（Mac 上是 ⌘K）：已命中 {{ hits }} 次。这一段没有渲染任何键帽。</p>
</template>
