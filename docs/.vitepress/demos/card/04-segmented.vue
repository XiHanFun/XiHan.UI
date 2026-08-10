<!-- 分段与悬停 | segmented 在段与段之间画一条分隔线；hoverable 只在能用指针的设备上抬起 -->
<script setup lang="ts">
import { XhCardBody, XhCardFooter, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhCardRoot variant="outline" segmented style="inline-size: 220px">
      <XhCardHeader>
        <XhCardTitle>分段</XhCardTitle>
      </XhCardHeader>
      <XhCardBody>头、身、脚之间各有一条线。</XhCardBody>
      <XhCardFooter>底部操作位</XhCardFooter>
    </XhCardRoot>

    <XhCardRoot variant="outline" hoverable style="inline-size: 220px">
      <XhCardHeader>
        <XhCardTitle>可悬停</XhCardTitle>
      </XhCardHeader>
      <XhCardBody>把指针移上来看抬起效果。</XhCardBody>
    </XhCardRoot>
  </div>
</template>
