<!-- 语气 | tone 换的是选中那一节的指示条与文字颜色，这里用 default-value 预置「用法」为选中项 -->
<script setup lang="ts">
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

const sections = [
  { value: "anchor-tone-install", label: "安装" },
  { value: "anchor-tone-usage", label: "用法" },
  { value: "anchor-tone-faq", label: "常见问题" },
];
</script>

<template>
  <div
    style="
      inline-size: 100%;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
    "
  >
    <div v-for="t in tones" :key="t">
      <div style="margin-block-end: 8px; font-size: 12px">{{ t }}</div>
      <XhAnchorRoot :tone="t" default-value="anchor-tone-usage">
        <XhAnchorList>
          <XhAnchorItem v-for="s in sections" :key="s.value">
            <XhAnchorLink :value="s.value">{{ s.label }}</XhAnchorLink>
          </XhAnchorItem>
          <!-- 指示条必须住在 list 里：它以 list 为定位参照系 -->
          <XhAnchorIndicator />
        </XhAnchorList>
      </XhAnchorRoot>
    </div>
  </div>
</template>
