var e=`<!-- 两端渐隐 | fade 让内容从窗口一端淡入、从另一端淡出，边缘不再生硬地切断文字；有暂停开关时行尾那一端淡到开关之前 -->
<script setup lang="ts">
import { XhMarqueeAutoplayTrigger, XhMarqueeContent, XhMarqueeRoot } from "@xihan-ui/vue";

const notices = [
  "系统将于本周六 02:00 起停机维护两小时",
  "新版导出支持按列脱敏",
  "本月账单已生成",
];
<\/script>

<template>
  <XhMarqueeRoot fade auto-fill style="max-inline-size: 420px">
    <XhMarqueeContent>
      <span v-for="n in notices" :key="n" style="margin-inline-end: 32px; white-space: nowrap">
        {{ n }}
      </span>
    </XhMarqueeContent>
    <XhMarqueeAutoplayTrigger />
  </XhMarqueeRoot>
</template>
`;export{e as default};