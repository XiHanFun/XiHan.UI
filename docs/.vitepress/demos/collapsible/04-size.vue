<!-- 尺寸 | size 换的是触发按钮的高度、内边距与字号，三档并排对照 -->
<script setup lang="ts">
import {
  XhCollapsibleContent,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <div
    style="
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      align-items: start;
    "
  >
    <XhCollapsibleRoot size="sm" default-open>
      <XhCollapsibleTrigger>小号 sm</XhCollapsibleTrigger>
      <XhCollapsibleContent>按钮最矮，字号也最小。</XhCollapsibleContent>
    </XhCollapsibleRoot>

    <XhCollapsibleRoot default-open>
      <XhCollapsibleTrigger>缺省档</XhCollapsibleTrigger>
      <XhCollapsibleContent>不写 size 就是这一档。</XhCollapsibleContent>
    </XhCollapsibleRoot>

    <XhCollapsibleRoot size="lg" default-open>
      <XhCollapsibleTrigger>大号 lg</XhCollapsibleTrigger>
      <XhCollapsibleContent>按钮最高，字号也最大。</XhCollapsibleContent>
    </XhCollapsibleRoot>
  </div>
</template>
