<!-- 基础用法 | 一块画布加一条笔迹路径就够了：按下落笔、移动成迹、抬笔收一笔 -->
<script setup lang="ts">
import { XhSignaturePadControl, XhSignaturePadRoot, XhSignaturePadPath } from "@xihan-ui/vue";
</script>

<template>
  <XhSignaturePadRoot style="max-inline-size: 22rem">
    <!-- 画布是 svg，笔迹全落在它里面那一条 path 上 -->
    <XhSignaturePadControl>
      <XhSignaturePadPath />
    </XhSignaturePadControl>
  </XhSignaturePadRoot>
</template>
