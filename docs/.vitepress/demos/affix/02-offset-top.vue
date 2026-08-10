<!-- 让出吸顶栏 | offset-top 把判定线往下挪，钉住后也在同一位置留出这段高度 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhAffixContent, XhAffixRoot } from "@xihan-ui/vue";

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    ref="scrollEl"
    style="
      position: relative;
      block-size: 240px;
      overflow: auto;
      padding: 12px;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <!-- 容器自带一条 40px 的吸顶栏，钉住的内容要躲开它 -->
    <div
      style="
        position: sticky;
        inset-block-start: 0;
        z-index: 1;
        block-size: 40px;
        display: flex;
        align-items: center;
        padding-inline: 8px;
        background: var(--xh-bg-subtle);
      "
    >
      吸顶栏
    </div>

    <p style="block-size: 120px">往下滚。</p>

    <XhAffixRoot :target="scrollEl" :offset-top="40">
      <XhAffixContent
        style="
          padding: 8px 12px;
          border-radius: 6px;
          background: var(--xh-bg-brand);
          color: var(--xh-fg-on-brand);
        "
      >
        钉在吸顶栏下方 40px 处
      </XhAffixContent>
    </XhAffixRoot>

    <p style="block-size: 600px">后面还有很长的内容。</p>
  </div>
</template>
