<!-- 计时与暂停 | duration 走完自动退场；指针停在条子上或焦点进到条子里都会把计时按住，离开才接着走剩下那一段 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhToastCloseTrigger,
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
      :duration="6000"
      :translations="{ close: '关闭' }"
    >
      <XhToastTitle />
      <span style="font-size: 12px; opacity: 0.75">
        状态：{{ status }} · {{ paused ? "计时已按住" : "计时在走" }}
      </span>
      <XhToastCloseTrigger />
    </XhToastRoot>
    <XhButton size="sm" variant="outline" @click="seq++">重新计时</XhButton>
  </div>
</template>
