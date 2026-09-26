<!-- 暂停开关 | 窗口行尾压一颗暂停开关，触屏与键盘也停得住；名字与图标随状态换成下一步的动作 -->
<script setup lang="ts">
import { XhMarqueeAutoplayTrigger, XhMarqueeContent, XhMarqueeRoot } from "@xihan-ui/vue";

const notices = ["系统将于本周六 02:00 起停机维护两小时", "新版导出支持按列脱敏", "本月账单已生成"];
</script>

<template>
  <XhMarqueeRoot
    auto-fill
    style="max-inline-size: 420px; border: 1px solid var(--xh-border-default); border-radius: 6px"
  >
    <XhMarqueeContent>
      <span v-for="n in notices" :key="n" style="padding: 10px 14px; white-space: nowrap">{{ n }}</span>
    </XhMarqueeContent>
    <!-- 放在 root 里、紧跟轨道；不给内容时皮肤画暂停 / 播放图标 -->
    <XhMarqueeAutoplayTrigger />
  </XhMarqueeRoot>
</template>
