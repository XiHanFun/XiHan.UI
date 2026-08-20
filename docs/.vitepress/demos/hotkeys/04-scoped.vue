<!-- 限定范围 | target 写 parent 时只在组件所在的那一层容器里接组合，整页范围的组合不会互相抢 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhHotkeys } from "@xihan-ui/vue";

const hits = ref(0);
</script>

<template>
  <div
    style="
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border: 1px solid currentColor;
      border-radius: 8px;
    "
  >
    <!-- 监听装在这一层容器上：焦点在框外时按同一组合不会触发 -->
    <input placeholder="在这里按 Mod+Enter" />
    <XhHotkeys :keys="['Mod', 'Enter']" target="parent" @hot-key="hits += 1" />
    <span>框内已触发 {{ hits }} 次</span>
  </div>
</template>
