<!-- 自定义进出场 | 两个覆盖槽各收一整条 animation 简写，换成自己的关键帧；退场那条带 forwards，位移取幅度令牌，减弱动效下只剩淡变 -->
<script setup lang="ts">
import {
  XhAlertContent,
  XhAlertDescription,
  XhAlertRoot,
  XhAlertTitle,
  XhButton,
  XhPresence,
} from "@xihan-ui/vue";
import { ref } from "vue";

const shown = ref(false);
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: var(--xh-space-3)">
    <XhButton size="sm" style="justify-self: start" @click="shown = !shown">
      {{ shown ? "收起提示" : "显示提示" }}
    </XhButton>
    <XhPresence class="presence-demo-rise" :present="shown">
      <XhAlertRoot tone="info">
        <XhAlertContent>
          <XhAlertTitle>有 3 条新评论</XhAlertTitle>
          <XhAlertDescription>出现时从下方浮上来，消失时沉回去。</XhAlertDescription>
        </XhAlertContent>
      </XhAlertRoot>
    </XhPresence>
  </div>
</template>

<style>
.presence-demo-rise {
  --xh-presence-enter-animation: presence-demo-rise-in var(--xh-motion-duration-enter) var(--xh-motion-ease-enter);
  --xh-presence-exit-animation: presence-demo-sink-out var(--xh-motion-duration-exit) var(--xh-motion-ease-exit) forwards;
}

@keyframes presence-demo-rise-in {
  from {
    opacity: 0;
    translate: 0 var(--xh-motion-distance-md);
  }
}

@keyframes presence-demo-sink-out {
  to {
    opacity: 0;
    translate: 0 var(--xh-motion-distance-md);
  }
}
</style>
