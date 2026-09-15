<!-- 计时与暂停 | duration 结束后自动退场；指针停在提示条上或焦点进入提示条内都会暂停计时，离开后继续剩余部分 -->
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

const seq = ref(0);
</script>

<template>
  <div style="display: grid; width: 100%; gap: 12px; justify-items: center">
    <XhToastRoot
      :key="seq"
      v-slot="{ status, paused }"
      title="6 秒后自动收走"
      :duration="6000"
      :translations="{ close: '关闭' }"
    >
      <XhToastIndicator />
      <XhToastContent>
        <XhToastTitle />
        <span style="font-size: 12px; opacity: 0.75">
          状态：{{ status }} · {{ paused ? "计时已按住" : "计时在走" }}
        </span>
      </XhToastContent>
      <XhToastCloseTrigger />
    </XhToastRoot>
    <XhButton size="sm" variant="outline" @click="seq++">重新计时</XhButton>
  </div>
</template>
