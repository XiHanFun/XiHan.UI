const e=`<!-- 变体 | 设置输入框外观 -->
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;
<\/script>

<template>
  <div style="display: grid; gap: 16px; justify-items: start">
    <XhDateFieldRoot
      v-for="v in variants"
      :key="v"
      :variant="v"
      default-value="2026-07-28"
      locale="zh-CN"
    >
      <XhDateFieldLabel>{{ v }}</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment :index="0" />
          <span>年</span>
          <XhDateFieldSegment :index="1" />
          <span>月</span>
          <XhDateFieldSegment :index="2" />
          <span>日</span>
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>
  </div>
</template>
`;export{e as default};
