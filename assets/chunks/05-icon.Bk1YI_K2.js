const n=`<!-- 自定义排版 | 条子本身就是一行 flex，摆什么、摆在哪一侧都归作者；组件只管盒子、计时与退场 -->
<script setup lang="ts">
import { CopyIcon, RocketIcon } from "@xihan-ui/icons";
import { XhIcon, XhToastRoot, XhToastTitle } from "@xihan-ui/vue";

// 尺寸与语气色都取条子给的槽，换个 type 图标就跟着换族
const glyphStyle = {
  display: "grid",
  placeItems: "center",
  flex: "none",
  inlineSize: "var(--xh-icon-size)",
  blockSize: "var(--xh-icon-size)",
  color: "var(--xh-_tone-fg)",
};
<\/script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <!-- 换一枚业务自己的图标 -->
    <XhToastRoot type="info" :duration="0" :closable="false">
      <span aria-hidden="true" :style="glyphStyle"><XhIcon :icon="RocketIcon" /></span>
      <XhToastTitle>部署已开始</XhToastTitle>
    </XhToastRoot>

    <!-- 图标摆到行尾 -->
    <XhToastRoot type="success" :duration="0" :closable="false">
      <XhToastTitle>已复制到剪贴板</XhToastTitle>
      <span aria-hidden="true" :style="glyphStyle"><XhIcon :icon="CopyIcon" /></span>
    </XhToastRoot>

    <!-- 什么都不摆，只有一句话 -->
    <XhToastRoot type="info" :duration="0" :closable="false">
      <XhToastTitle>已切换到只读模式</XhToastTitle>
    </XhToastRoot>
  </div>
</template>
`;export{n as default};
