<!-- 形态、尺寸与状态 | variant 设置按钮外观，size 分小、中、大三档，disabled 标出暂时不可执行的操作 -->
<script setup lang="ts">
import { XhButton } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-direction: column; align-items: center; gap: var(--xh-space-4)">
    <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: var(--xh-space-3)">
      <XhButton variant="solid">主要</XhButton>
      <XhButton variant="subtle">次要</XhButton>
      <XhButton variant="outline">线框</XhButton>
      <XhButton variant="ghost">幽灵</XhButton>
      <XhButton variant="dashed">虚线</XhButton>
      <XhButton variant="link">链接</XhButton>
    </div>

    <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: var(--xh-space-3)">
      <XhButton size="sm">小尺寸</XhButton>
      <XhButton>中尺寸</XhButton>
      <XhButton size="lg">大尺寸</XhButton>
    </div>

    <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: var(--xh-space-3)">
      <XhButton disabled>主要操作</XhButton>
      <XhButton disabled variant="subtle">次要操作</XhButton>
      <XhButton disabled variant="outline">线框按钮</XhButton>
      <XhButton disabled variant="ghost">幽灵按钮</XhButton>
    </div>
  </div>
</template>
