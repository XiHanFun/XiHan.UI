<!-- 自动跟到底部 | 新行进来时视口自己跟着走；往上滚一段就停住跟随，root 插槽给的 atBottom / scrollToBottom 够自己画一条回到最新 -->
<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import { XhButton, XhLogContent, XhLogLine, XhLogRoot, XhLogViewport } from "@xihan-ui/vue";

const lines = ref(
  Array.from({ length: 10 }, (_, i) => `12:00:0${i}  boot  第 ${i + 1} 行 · 往上滚一段试试`),
);

let seq = lines.value.length;
let timer: number | undefined;
const streaming = ref(false);

function append(): void {
  seq += 1;
  lines.value.push(`12:0${Math.floor(seq / 60)}:${String(seq % 60).padStart(2, "0")}  http  第 ${seq} 行 · 新来的`);
}

function toggle(): void {
  streaming.value = !streaming.value;
  if (streaming.value)
    timer = window.setInterval(append, 400);
  else
    window.clearInterval(timer);
}

// 离开页面时把定时器收掉
onUnmounted(() => window.clearInterval(timer));
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhLogRoot v-slot="{ atBottom, sticking, scrollToBottom }" :rows="8">
      <XhLogViewport>
        <XhLogContent>
          <XhLogLine v-for="(line, i) in lines" :key="i">{{ line }}</XhLogLine>
        </XhLogContent>
      </XhLogViewport>

      <!-- 不在底部时才露出来，排在视口下面 -->
      <div
        v-if="!atBottom"
        style="display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 12px"
      >
        <span style="font-size: 13px">已暂停跟随 · 跟随意图：{{ sticking ? "开" : "关" }}</span>
        <XhButton variant="outline" size="sm" @click="scrollToBottom()">回到最新</XhButton>
      </div>
    </XhLogRoot>

    <div style="display: flex; gap: 8px">
      <XhButton variant="solid" @click="toggle">{{ streaming ? "停止输出" : "开始输出" }}</XhButton>
      <XhButton variant="outline" @click="append">追加一行</XhButton>
    </div>
  </div>
</template>
