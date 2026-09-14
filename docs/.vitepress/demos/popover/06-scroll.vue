<!-- 长内容滚动 | 浮层自己不限高，给里面的容器设上限并开滚动，标题与关闭按钮就不跟着滚 -->
<script setup lang="ts">
import {
  XhPopoverArrow,
  XhPopoverCloseTrigger,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/vue";

const versions = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  text: `v1.${18 - i} 更新了若干细节`,
}));
</script>

<template>
  <XhPopoverRoot placement="bottom-start" :translations="{ close: '关闭' }">
    <XhPopoverTrigger>历史版本</XhPopoverTrigger>
    <XhPopoverPositioner>
      <XhPopoverContent>
        <XhPopoverTitle>历史版本</XhPopoverTitle>
        <div style="max-block-size: 160px; overflow: auto">
          <p
            v-for="v in versions"
            :key="v.id"
            style="
              margin: 0;
              padding: 6px 0;
              border-block-end: 1px solid var(--xh-border-subtle);
            "
          >
            {{ v.text }}
          </p>
        </div>
        <XhPopoverCloseTrigger />
        <XhPopoverArrow />
      </XhPopoverContent>
    </XhPopoverPositioner>
  </XhPopoverRoot>
</template>
