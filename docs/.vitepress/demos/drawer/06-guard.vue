<!-- 关闭前拦截 | 受控时组件不自改状态：Escape、点面板外、按叉都只发一次收起意图，写不写由宿主定 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
} from "@xihan-ui/vue";

const open = ref(false);
const asking = ref(false);

// 展开意图照单全收，收起意图先扣下来，等下面那两颗按钮表态
function onOpenChange(details: { open: boolean }) {
  asking.value = !details.open;
  if (details.open) open.value = true;
}

function discard() {
  asking.value = false;
  open.value = false;
}
</script>

<template>
  <XhDrawerRoot :open="open" :translations="{ close: '关闭' }" @open-change="onOpenChange">
    <XhDrawerTrigger>编辑草稿</XhDrawerTrigger>
    <XhDrawerContent>
      <XhDrawerTitle>编辑草稿</XhDrawerTitle>
      <XhDrawerDescription>
        这里假定草稿一直有未保存的改动，任何一次收起意图都要先问一句。
      </XhDrawerDescription>
      <p style="margin: 0">
        {{ asking ? "改动还没保存，确定丢掉吗？" : "试试按 Escape、点面板外，或者按右上角的叉。" }}
      </p>
      <div v-if="asking" style="display: flex; gap: 8px">
        <XhButton variant="outline" @click="asking = false">继续编辑</XhButton>
        <XhButton variant="solid" @click="discard">丢弃并关闭</XhButton>
      </div>
      <XhDrawerCloseTrigger />
    </XhDrawerContent>
  </XhDrawerRoot>
</template>
