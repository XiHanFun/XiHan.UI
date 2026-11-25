<!-- 语气、尺寸与状态 | 六种语气更换浮层实心底与其上的文字色，箭头一并随之变化；size 三档只改变浮层的内边距，字号不变，不写即默认档；disabled 只关闭提示本身，被包裹的触发器照常可点击、可聚焦。把指针停在触发器上（或用 Tab 聚焦）查看差别 -->
<script setup lang="ts">
import {
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const tones = [
  { value: "brand", label: "品牌" },
  { value: "neutral", label: "中性" },
  { value: "success", label: "成功" },
  { value: "warning", label: "警告" },
  { value: "danger", label: "危险" },
  { value: "info", label: "信息" },
] as const;

const sizes = [
  { value: "sm", label: "小" },
  { value: undefined, label: "缺省" },
  { value: "lg", label: "大" },
] as const;

const clicks = ref(0);

const rowStyle = "display: flex; flex-wrap: wrap; gap: var(--xh-space-6)";
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-8)">
    <div :style="rowStyle">
      <XhTooltipRoot
        v-for="t in tones"
        :key="t.value"
        :tone="t.value"
        placement="bottom"
        :open-delay="0"
      >
        <XhTooltipTrigger>{{ t.label }}</XhTooltipTrigger>
        <XhTooltipPositioner>
          <XhTooltipContent>
            tone = {{ t.value }}
            <XhTooltipArrow />
          </XhTooltipContent>
        </XhTooltipPositioner>
      </XhTooltipRoot>
    </div>

    <div :style="rowStyle">
      <XhTooltipRoot
        v-for="s in sizes"
        :key="s.label"
        :size="s.value"
        placement="bottom"
        :open-delay="0"
      >
        <XhTooltipTrigger>{{ s.label }}</XhTooltipTrigger>
        <XhTooltipPositioner>
          <XhTooltipContent>
            size = {{ s.value ?? "未指定" }}
            <XhTooltipArrow />
          </XhTooltipContent>
        </XhTooltipPositioner>
      </XhTooltipRoot>
    </div>

    <div style="display: flex">
      <XhTooltipRoot disabled>
        <XhTooltipTrigger @click="clicks++">点我（提示已关）</XhTooltipTrigger>
        <XhTooltipPositioner>
          <XhTooltipContent>这段话不会出现</XhTooltipContent>
        </XhTooltipPositioner>
      </XhTooltipRoot>
    </div>
  </div>
  <span data-demo-output>已点 {{ clicks }} 次</span>
</template>
