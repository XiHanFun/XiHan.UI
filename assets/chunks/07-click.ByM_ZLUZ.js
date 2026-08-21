const t=`<!-- 点击事件 | 处理器照常挂在组件上；载入态与禁用态的点击在根上就被拦下，作者挂的处理器也收不到 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhButton } from "@xihan-ui/vue";

const count = ref(0);
<\/script>

<template>
  <XhButton variant="solid" @click="count++">点一下</XhButton>
  <XhButton loading @click="count++">载入中</XhButton>
  <XhButton disabled @click="count++">禁用</XhButton>
  <span style="font-size: 13px">已计数 {{ count }} 次</span>
</template>
`;export{t as default};
