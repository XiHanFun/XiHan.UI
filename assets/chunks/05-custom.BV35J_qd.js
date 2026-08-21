const t=`<!-- 自定义外观 | 描边、底色、标题色、圆角各是一个组件令牌；描边槽位换成透明就只剩淡底，尺寸不变 -->
<script setup lang="ts">
import { XhAlertDescription, XhAlertRoot, XhAlertTitle } from "@xihan-ui/vue";
<\/script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <!-- 只留淡底：描边换成透明，边框盒还在，不会因为掉了一圈线而跳动 -->
    <XhAlertRoot tone="info" style="--xh-alert-border: transparent">
      <XhAlertTitle>无描边</XhAlertTitle>
      <XhAlertDescription>底色与内边距都还在。</XhAlertDescription>
    </XhAlertRoot>

    <!-- 只留描边：底色换成透明 -->
    <XhAlertRoot tone="warning" style="--xh-alert-bg: transparent">
      <XhAlertTitle>无底色</XhAlertTitle>
      <XhAlertDescription>剩一圈线，衬在页面本来的底色上。</XhAlertDescription>
    </XhAlertRoot>

    <!-- 语气表以外的配色逐个实例给，圆角也是一个槽位 -->
    <XhAlertRoot
      style="
        --xh-alert-bg: #f4f0ff;
        --xh-alert-border: #c4b5fd;
        --xh-alert-title-fg: #5b21b6;
        --xh-alert-radius: var(--xh-radius-none);
      "
    >
      <XhAlertTitle>自定配色</XhAlertTitle>
      <XhAlertDescription>底色、描边、标题色、圆角各占一个槽位。</XhAlertDescription>
    </XhAlertRoot>
  </div>
</template>
`;export{t as default};
