<!-- 外形 | 使用圆形或方形触发器 -->
<script setup lang="ts">
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from "@xihan-ui/vue";
</script>

<template>
  <XhFloatButtonRoot style="position: static" shape="circle">
    <XhFloatButtonTrigger />
    <XhFloatButtonList />
  </XhFloatButtonRoot>
  <XhFloatButtonRoot style="position: static" shape="square">
    <XhFloatButtonTrigger />
    <XhFloatButtonList />
  </XhFloatButtonRoot>
</template>
