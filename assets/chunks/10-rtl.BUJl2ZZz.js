var e=`<!-- 书写方向 | start / end 是逻辑对齐不是左右：RTL 下 bottom-start 贴的是锚点右缘，块轴上的对齐不受影响 -->
<script setup lang="ts">
import {
  XhButton,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const dir = ref<"ltr" | "rtl">("rtl");
<\/script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <XhButton size="sm" variant="outline" @click="dir = dir === 'ltr' ? 'rtl' : 'ltr'">
      当前方向：{{ dir }}（点一下切换）
    </XhButton>

    <div :dir="dir" style="display: flex; gap: 24px">
      <XhPopoverRoot :dir="dir" placement="bottom-start">
        <XhPopoverTrigger>bottom-start</XhPopoverTrigger>
        <XhPopoverPositioner>
          <XhPopoverContent>
            <XhPopoverTitle>start</XhPopoverTitle>
            <XhPopoverDescription>LTR 贴左缘，RTL 贴右缘</XhPopoverDescription>
          </XhPopoverContent>
        </XhPopoverPositioner>
      </XhPopoverRoot>

      <XhPopoverRoot :dir="dir" placement="bottom-end">
        <XhPopoverTrigger>bottom-end</XhPopoverTrigger>
        <XhPopoverPositioner>
          <XhPopoverContent>
            <XhPopoverTitle>end</XhPopoverTitle>
            <XhPopoverDescription>与 start 恰好相反</XhPopoverDescription>
          </XhPopoverContent>
        </XhPopoverPositioner>
      </XhPopoverRoot>
    </div>
  </div>
</template>
`;export{e as default};