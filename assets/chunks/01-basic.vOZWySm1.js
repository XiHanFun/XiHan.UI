const n=`<!-- 基础用法 | 一组组合的键帽：Mod 在 Mac 上出 ⌘、其余平台出 Ctrl，平台由组件自己测出来 -->
<script setup lang="ts">
import { XhHotkeys, XhKbdGroup } from "@xihan-ui/vue";
import { ref } from "vue";

const count = ref(0);
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 8px">
    <!-- 展示与注册显式组合；Hotkeys 自身不渲染 DOM -->
    <XhKbdGroup :keys="['Mod', 'S']" />
    <XhHotkeys :keys="['Mod', 'S']" @hot-key="count += 1" />
    <span>已按下 {{ count }} 次</span>
  </div>
</template>
`;export{n as default};
