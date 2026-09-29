const t=`<!-- 自动刷新 | 相对型不给 now 时自己刷新：文字只在跨过分钟、小时、天的边界时才变，就只在那一刻刷新；页面隐藏或离开视口时暂停，回来时立即补一次 -->
<script setup lang="ts">
import { XhTimestamp } from "@xihan-ui/vue";

// 打开页面的那一刻，与两分钟之后的一个日程
const openedAt = Date.now();
const meetingAt = openedAt + 2 * 60 * 1000 + 5 * 1000;
<\/script>

<template>
  <div style="display: grid; grid-template-columns: auto auto; gap: 8px 24px; justify-content: start">
    <span>打开本页</span>
    <XhTimestamp :value="openedAt" type="relative" />
    <span>下一场会议</span>
    <XhTimestamp :value="meetingAt" type="relative" />
  </div>
</template>
`;export{t as default};
