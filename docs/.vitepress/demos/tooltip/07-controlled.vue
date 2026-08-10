<!-- 受控 | 传了 open 就由宿主说了算；悬停、聚焦、Escape 都只发意图，最终写不写由外面这份状态决定 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/vue";

const open = ref(false);
const log = ref<string[]>([]);

// 只留最近三条意图
function onOpenChange(details: { open: boolean }) {
  log.value = [details.open ? "要展开" : "要收起", ...log.value].slice(0, 3);
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <XhTooltipRoot
      v-model:open="open"
      placement="bottom"
      :open-delay="0"
      @open-change="onOpenChange"
    >
      <XhTooltipTrigger>把指针停上来</XhTooltipTrigger>
      <XhTooltipPositioner>
        <XhTooltipContent>
          显隐完全跟着 open 走
          <XhTooltipArrow />
        </XhTooltipContent>
      </XhTooltipPositioner>
    </XhTooltipRoot>

    <XhButton variant="outline" @click="open = !open">
      {{ open ? "收起" : "展开" }}
    </XhButton>
    <span>最近意图：{{ log.join(" ← ") || "（还没动过）" }}</span>
  </div>
</template>
