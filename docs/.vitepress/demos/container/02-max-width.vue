<!-- 最大宽度 | sm / md / lg / xl 四档与同名断点同宽，full 不限宽；轨道比舞台宽，各档的起止边线错开成台阶，横向滚动看全 -->
<script setup lang="ts">
import { XhContainer, XhFlex } from "@xihan-ui/vue";

const tiers = [
  { maxWidth: "sm", tone: "brand" },
  { maxWidth: "md", tone: "info" },
  { maxWidth: "lg", tone: "success" },
  { maxWidth: "xl", tone: "warning" },
  { maxWidth: "full", tone: "neutral" },
] as const;

// 每一档一行：档名在前，淡色占位块铺满版心剩下的宽度
const row = { display: "flex", alignItems: "center", gap: "var(--xh-space-2)" };
const label = { minInlineSize: "var(--xh-space-8)", color: "var(--xh-fg-muted)", fontSize: "var(--xh-text-caption-size)" };
</script>

<template>
  <!-- 轨道取 xl 断点的 1.25 倍：比最宽的断点档还宽，full 与 xl 才分得开 -->
  <div data-xh-scroll role="region" tabindex="0" aria-label="最大宽度各档对照" style="inline-size: 100%; overflow-x: auto">
    <XhFlex orientation="vertical" gap="sm" style="inline-size: calc(var(--xh-breakpoint-xl) * 1.25)">
      <XhContainer v-for="tier in tiers" :key="tier.maxWidth" :max-width="tier.maxWidth">
        <div :style="row">
          <span :style="label">{{ tier.maxWidth }}</span>
          <div data-demo-block :data-tone="tier.tone" style="flex: 1" />
        </div>
      </XhContainer>
    </XhFlex>
  </div>
</template>
