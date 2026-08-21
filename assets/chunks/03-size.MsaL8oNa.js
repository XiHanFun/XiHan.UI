const e=`<!-- 尺寸 | size 换的是字号与键帽的内边距，三档与其余控件同源 -->
<script setup lang="ts">
import { XhHotkeys } from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 24px">
    <!-- 三枚各占一组组合，同一组注册两遍会一起响应；这一节只演尺寸，命中不拦浏览器的默认动作 -->
    <XhHotkeys :keys="['Mod', '1']" size="sm" :prevent-default="false" />
    <XhHotkeys :keys="['Mod', '2']" size="md" :prevent-default="false" />
    <XhHotkeys :keys="['Mod', '3']" size="lg" :prevent-default="false" />
  </div>
</template>
`;export{e as default};
