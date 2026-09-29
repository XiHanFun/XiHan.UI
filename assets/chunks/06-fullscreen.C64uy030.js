const n=`<!-- 全屏水印 | 固定铺满整个视口，压在页面一切内容之上 -->
<script setup lang="ts">
import { XhButton, XhWatermarkRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const on = ref(false);
<\/script>

<template>
  <XhButton variant="outline" @click="on = !on">{{ on ? "撤下全屏水印" : "铺上全屏水印" }}</XhButton>
  <XhWatermarkRoot v-if="on" fullscreen text="XiHan · 内部资料" />
</template>
`;export{n as default};
