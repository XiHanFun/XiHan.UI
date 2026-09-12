const n=`<!-- 限定范围 | target 显式返回真实容器，只在这一层接组合 -->
<script setup lang="ts">
import { XhHotkeys, XhKbdGroup } from "@xihan-ui/vue";
import { ref } from "vue";

const hits = ref(0);
const scope = ref<HTMLElement | null>(null);
<\/script>

<template>
  <div
    ref="scope"
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
    <input placeholder="在这里按 Mod+Enter">
    <XhKbdGroup :keys="['Mod', 'Enter']" />
    <XhHotkeys :keys="['Mod', 'Enter']" :target="() => scope" @hot-key="hits += 1" />
    <span>框内已触发 {{ hits }} 次</span>
  </div>
</template>
`;export{n as default};
