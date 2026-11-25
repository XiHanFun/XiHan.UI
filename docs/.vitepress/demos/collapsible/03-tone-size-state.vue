<!-- 语气、尺寸与状态 | tone 落在触发按钮的展开态上，size 改变触发按钮的高度、内边距与字号；disabled 把触发器整个关停，点击与键盘都不再改变开合，已展开的内容维持原样 -->
<script setup lang="ts">
import {
  XhCollapsibleContent,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
} from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-6); width: 100%">
    <div
      style="
        display: grid;
        gap: var(--xh-space-4);
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        align-items: start;
      "
    >
      <XhCollapsibleRoot v-for="tone in tones" :key="tone" :tone="tone" default-open>
        <XhCollapsibleTrigger>{{ tone }}</XhCollapsibleTrigger>
        <XhCollapsibleContent>收起后触发按钮保持默认颜色。</XhCollapsibleContent>
      </XhCollapsibleRoot>
    </div>

    <div
      style="
        display: grid;
        gap: var(--xh-space-4);
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

    <div style="max-width: 420px; display: grid; gap: var(--xh-space-3)">
      <XhCollapsibleRoot disabled>
        <XhCollapsibleTrigger>收起且禁用</XhCollapsibleTrigger>
        <XhCollapsibleContent>点不开。</XhCollapsibleContent>
      </XhCollapsibleRoot>

      <XhCollapsibleRoot default-open disabled>
        <XhCollapsibleTrigger>展开且禁用</XhCollapsibleTrigger>
        <XhCollapsibleContent>内容停在展开态，收不上。</XhCollapsibleContent>
      </XhCollapsibleRoot>
    </div>
  </div>
</template>
