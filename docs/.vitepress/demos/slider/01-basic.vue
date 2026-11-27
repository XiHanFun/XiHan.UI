<!-- 基础用法 | 只写根组件就按标准结构铺出标题、轨道与拇指；值恒为数组，单滑块即长度 1；方向键移动一格 step，PageUp 与 PageDown 按 largeStep，Home 与 End 到达端点 -->
<script setup lang="ts">
import { XhSliderRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhSliderRoot label="音量" :default-value="[40]" :large-step="10" name="volume" style="inline-size: 320px" />
</template>
