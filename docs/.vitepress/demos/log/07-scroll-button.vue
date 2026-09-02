<!-- 回到底部与播报 | 往上翻一段，右下角那颗钮自己冒出来，按下去归位并重新粘附；输出跑完在播报区念一句结论 -->
<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import {
  XhLogContent,
  XhLogLine,
  XhLogLiveRegion,
  XhLogRoot,
  XhLogScrollButton,
  XhLogViewport,
} from "@xihan-ui/vue";

const lines = ref(
  Array.from(
    { length: 10 },
    (_, i) => `12:00:0${i}  build  编译 packages/module-${i + 1} · 往上翻一段试试`,
  ),
);
const announcement = ref("");

let timer: number | undefined;

function tick(): void {
  const seq = lines.value.length + 1;
  lines.value = [...lines.value, `12:0${Math.floor(seq / 60)}:${String(seq % 60).padStart(2, "0")}  build  编译 packages/module-${seq}`];
  if (seq < 24) {
    timer = window.setTimeout(tick, 700);
    return;
  }
  // 一段输出收尾时才念一句，逐行播报会把读屏淹掉
  announcement.value = `构建完成，共 ${seq} 行输出，0 个错误`;
}

timer = window.setTimeout(tick, 700);

// 离开页面时把定时器收掉
onUnmounted(() => window.clearTimeout(timer));
</script>

<template>
  <XhLogRoot :rows="8" style="inline-size: 100%">
    <XhLogViewport>
      <XhLogContent>
        <XhLogLine v-for="(line, i) in lines" :key="i">{{ line }}</XhLogLine>
      </XhLogContent>
    </XhLogViewport>

    <!-- 留空就由皮肤画一枚向下的字形，往里塞节点即换成自己的图形 -->
    <XhLogScrollButton />

    <!-- 视觉隐藏的播报区：念哪一句、什么时候念都归宿主定 -->
    <XhLogLiveRegion>{{ announcement }}</XhLogLiveRegion>
  </XhLogRoot>
</template>
