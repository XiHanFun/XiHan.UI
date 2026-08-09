<!-- 计时与暂停 | duration 走完自动退场；指针停在卡片上或焦点进到卡片里都会把计时按住，离开才接着走剩下那一段 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhToastCloseTrigger,
  XhToastDescription,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/vue";

const seq = ref(0);
</script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <XhToastRoot
      :key="seq"
      v-slot="{ status, paused }"
      title="6 秒后自动收走"
      description="把鼠标停在这张卡片上，计时会被按住"
      :duration="6000"
      :translations="{ close: '关闭' }"
    >
      <XhToastTitle />
      <XhToastDescription />
      <span style="font-size: 12px; opacity: 0.75">
        状态：{{ status }} · {{ paused ? "计时已按住" : "计时在走" }}
      </span>
      <XhToastCloseTrigger>✕</XhToastCloseTrigger>
    </XhToastRoot>
    <XhButton size="sm" variant="outline" @click="seq++">重新计时</XhButton>
  </div>
</template>
