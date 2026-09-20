const n=`<!-- 语气 | 六种语气更换浮层实心底与其上的文字色，箭头一并随之变化；把指针停在触发器上（或用 Tab 聚焦）查看差别 -->
<script setup lang="ts">
import {
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/vue";

const tones = [
  { value: "brand", label: "品牌" },
  { value: "neutral", label: "中性" },
  { value: "success", label: "成功" },
  { value: "warning", label: "警告" },
  { value: "danger", label: "危险" },
  { value: "info", label: "信息" },
] as const;
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 24px">
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
</template>
`;export{n as default};
