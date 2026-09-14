<!-- 吸附状态 | 根据当前状态更新内容 -->
<script setup lang="ts">
import { XhAffixContent, XhAffixRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: min(420px, 100%)">
    <div
      ref="scrollEl"
      style="
        block-size: 220px;
        overflow: auto;
        padding: 12px;
        border-radius: var(--xh-shape-surface);
        background: var(--xh-bg-subtle);
      "
    >
      <div style="block-size: 120px" />

      <XhAffixRoot v-slot="{ affixed: pinned }" :target="scrollEl">
        <XhAffixContent
          style="padding: 8px 12px; border-radius: 6px; background: var(--xh-bg-subtle)"
        >
          {{ pinned ? "已固定" : "工具栏" }}
        </XhAffixContent>
      </XhAffixRoot>

      <div style="block-size: 600px" />
    </div>
  </div>
</template>
