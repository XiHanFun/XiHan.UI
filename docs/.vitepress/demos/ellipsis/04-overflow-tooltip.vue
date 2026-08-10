<!-- 溢出才提示 | 上面套 Tooltip 按 overflow-change 开关，下面用 tooltip 交给平台的原生提示 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhEllipsis,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/vue";

const width = ref(200);
const overflowing = ref(false);
const text = "配送地址：浙江省杭州市余杭区文一西路 969 号 3 号楼 12 层 1203 室";

// 触发器本身是按钮，这里让它按普通文字那样铺满一行
const asText = {
  display: "block",
  inlineSize: "100%",
  padding: "0",
  border: "0",
  background: "none",
  font: "inherit",
  color: "inherit",
  textAlign: "start",
  cursor: "default",
};
</script>

<template>
  <div style="display: grid; gap: 16px; inline-size: 100%">
    <label style="display: flex; align-items: center; gap: 8px">
      容器宽度
      <input v-model.number="width" type="range" min="120" max="560" step="20" />
      {{ width }}px
    </label>

    <!-- 组件只报「被裁了没有」，浮层归 Tooltip；没被裁时把提示整个关掉 -->
    <div :style="{ inlineSize: `${width}px`, maxInlineSize: '100%' }">
      <XhTooltipRoot :disabled="!overflowing">
        <XhTooltipTrigger :style="asText">
          <XhEllipsis @overflow-change="overflowing = $event.overflowing">
            {{ text }}
          </XhEllipsis>
        </XhTooltipTrigger>
        <XhTooltipPositioner>
          <XhTooltipContent>{{ text }}</XhTooltipContent>
        </XhTooltipPositioner>
      </XhTooltipRoot>
    </div>

    <!-- 不想要浮层就开 tooltip：被裁时整段文字写进 title，交给平台自己的提示 -->
    <div :style="{ inlineSize: `${width}px`, maxInlineSize: '100%' }">
      <XhEllipsis tooltip>{{ text }}</XhEllipsis>
    </div>
  </div>
</template>
