const n=`<!-- 确认气泡 | 标题、说明与两颗按钮拼成一次就地确认；两颗按钮按下后都只是把浮层收起 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhPopoverArrow,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/vue";

const removed = ref(false);

function confirm(setOpen: (next: boolean) => void) {
  removed.value = true;
  setOpen(false);
}
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <XhPopoverRoot v-slot="{ setOpen }" placement="top" size="sm">
      <XhPopoverTrigger>删除这条记录</XhPopoverTrigger>
      <XhPopoverPositioner>
        <XhPopoverContent>
          <XhPopoverTitle>删除后不可恢复</XhPopoverTitle>
          <XhPopoverDescription>这条记录连同它的附件一起清掉。</XhPopoverDescription>
          <div style="display: flex; justify-content: flex-end; gap: 8px">
            <XhButton size="sm" variant="ghost" @click="setOpen(false)">
              取消
            </XhButton>
            <XhButton size="sm" variant="solid" tone="danger" @click="confirm(setOpen)">
              删除
            </XhButton>
          </div>
          <XhPopoverArrow />
        </XhPopoverContent>
      </XhPopoverPositioner>
    </XhPopoverRoot>
    <span>{{ removed ? "记录已删除" : "记录还在" }}</span>
  </div>
</template>
`;export{n as default};
