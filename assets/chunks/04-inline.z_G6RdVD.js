var e=`<!-- 快捷键注册 | 可见提示显式开启 register 后响应按键 -->
<script setup lang="ts">
import { XhKbd } from "@xihan-ui/vue";
import { ref } from "vue";

const count = ref(0);
<\/script>

<template>
  <XhKbd :keys="['Mod', 'K']" register @hot-key="count += 1" />
  <output data-demo-output>{{ count ? \`已触发 \${count} 次\` : "按下组合键" }}</output>
</template>
`;export{e as default};