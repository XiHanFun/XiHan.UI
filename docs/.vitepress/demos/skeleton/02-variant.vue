<!-- 形状 | 容器的 shape 是这一组的默认形状，单根骨架条自带 shape 就按自己的来 -->
<script setup lang="ts">
import { XhSkeletonItem, XhSkeletonRoot } from "@xihan-ui/vue";
</script>

<template>
  <!-- 头像位与两行文字并排：容器默认 text，头像那一根单独声明 circle -->
  <XhSkeletonRoot
    style="inline-size: 260px; flex-direction: row; align-items: center"
  >
    <XhSkeletonItem shape="circle" />
    <XhSkeletonItem />
  </XhSkeletonRoot>

  <!-- 整组都是块：容器给了 rect，里面不必逐根再写 -->
  <XhSkeletonRoot shape="rect" style="inline-size: 200px">
    <XhSkeletonItem />
  </XhSkeletonRoot>
</template>
