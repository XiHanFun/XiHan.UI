<!-- 返回位 | 返回位就是作者自己的按钮：组件只给身份与位置，type、可及名字与点击行为自己写 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhPageHeaderBackTrigger,
  XhPageHeaderRoot,
  XhPageHeaderDescription,
  XhPageHeaderTitle,
} from "@xihan-ui/vue";

const times = ref(0);
</script>

<template>
  <XhPageHeaderRoot>
    <XhPageHeaderBackTrigger type="button" aria-label="返回上一页" @click="times++">
      ←
    </XhPageHeaderBackTrigger>
    <XhPageHeaderTitle>订单详情</XhPageHeaderTitle>
    <XhPageHeaderDescription>已点返回 {{ times }} 次</XhPageHeaderDescription>
  </XhPageHeaderRoot>
</template>
