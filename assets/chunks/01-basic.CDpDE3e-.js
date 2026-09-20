const t=`<!-- 基础用法 | 默认由状态图标、文本列和悬停显示的关闭按钮组成；duration 设为 0 即不自动消失 -->
<script setup lang="ts">
import {
  XhButton,
  XhToastCloseTrigger,
  XhToastContent,
  XhToastIndicator,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 关掉之后换一个 key 重新挂一条，方便反复看
const seq = ref(0);
<\/script>

<template>
  <div style="display: grid; width: 100%; gap: 12px; justify-items: center">
    <XhToastRoot
      :key="seq"
      title="草稿已保存"
      :duration="0"
      :translations="{ close: '关闭' }"
    >
      <XhToastIndicator />
      <XhToastContent><XhToastTitle /></XhToastContent>
      <XhToastCloseTrigger />
    </XhToastRoot>
    <XhButton size="sm" variant="outline" @click="seq++">再挂一条</XhButton>
  </div>
</template>
`;export{t as default};
