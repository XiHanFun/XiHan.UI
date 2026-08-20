<!-- 基础用法 | 一组组合的键帽：Mod 在 Mac 上出 ⌘、其余平台出 Ctrl，平台由组件自己测出来 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhHotkeys } from "@xihan-ui/vue";

const count = ref(0);
</script>

<template>
  <div style="display: flex; align-items: center; gap: 8px">
    <!-- 不写 platform 即挂载后自己测；命中默认拦下浏览器的默认动作 -->
    <XhHotkeys :keys="['Mod', 'S']" @hot-key="count += 1" />
    <span>已按下 {{ count }} 次</span>
  </div>
</template>
