<!-- 语气与尺寸 | tone 改变淡底与回退文字的配色组，不写即中性缺省；size 三档只改变直径，回退文字的字号随之缩放，默认档不输出 data-size -->
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";

const tones = [
  { value: "brand", label: "曦" },
  { value: "neutral", label: "中" },
  { value: "success", label: "成" },
  { value: "warning", label: "警" },
  { value: "danger", label: "危" },
  { value: "info", label: "信" },
] as const;
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-4)">
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--xh-space-3)">
      <!-- 不写 tone 的那一枚：中性缺省 -->
      <XhAvatarRoot>
        <XhAvatarImage />
        <XhAvatarFallback>XH</XhAvatarFallback>
      </XhAvatarRoot>

      <XhAvatarRoot v-for="tone in tones" :key="tone.value" :tone="tone.value">
        <XhAvatarImage />
        <XhAvatarFallback>{{ tone.label }}</XhAvatarFallback>
      </XhAvatarRoot>
    </div>

    <!-- 有图的一行：图片铺满 root，跟着三档一起缩放 -->
    <div style="display: flex; align-items: center; gap: var(--xh-space-3)">
      <XhAvatarRoot size="sm" src="/images/demo-avatar.svg" alt="曦寒">
        <XhAvatarImage />
        <XhAvatarFallback>曦</XhAvatarFallback>
      </XhAvatarRoot>
      <XhAvatarRoot src="/images/demo-avatar.svg" alt="曦寒">
        <XhAvatarImage />
        <XhAvatarFallback>曦</XhAvatarFallback>
      </XhAvatarRoot>
      <XhAvatarRoot size="lg" src="/images/demo-avatar.svg" alt="曦寒">
        <XhAvatarImage />
        <XhAvatarFallback>曦</XhAvatarFallback>
      </XhAvatarRoot>
      <span style="color: var(--xh-fg-muted); font-size: var(--xh-text-caption-size)">sm / 缺省 / lg</span>
    </div>

    <!-- 落回退态的一行：小头像里的字不撑出去，大头像里的字也不显小 -->
    <div style="display: flex; align-items: center; gap: var(--xh-space-3)">
      <XhAvatarRoot size="sm">
        <XhAvatarImage />
        <XhAvatarFallback>XH</XhAvatarFallback>
      </XhAvatarRoot>
      <XhAvatarRoot>
        <XhAvatarImage />
        <XhAvatarFallback>XH</XhAvatarFallback>
      </XhAvatarRoot>
      <XhAvatarRoot size="lg">
        <XhAvatarImage />
        <XhAvatarFallback>XH</XhAvatarFallback>
      </XhAvatarRoot>
      <span style="color: var(--xh-fg-muted); font-size: var(--xh-text-caption-size)">回退字随档位缩放</span>
    </div>
  </div>
</template>
