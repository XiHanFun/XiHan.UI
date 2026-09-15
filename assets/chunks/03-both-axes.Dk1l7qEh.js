const r=`<!-- 双轴滚动 | 同时显示横向和纵向滚动条 -->
<script setup lang="ts">
import { XhScrollbarCorner, XhScrollbarRoot, XhScrollbarThumb, XhScrollbarTrack } from "@xihan-ui/vue";
import { ref } from "vue";

const box = ref<HTMLElement | null>(null);
const rows = Array.from({ length: 30 }, (_, r) => Array.from({ length: 12 }, (_, c) => \`\${r + 1}-\${c + 1}\`));
<\/script>

<template>
  <div style="position: relative; inline-size: 320px">
    <div
      ref="box"
      style="
        block-size: 200px;
        overflow: auto;
        scrollbar-width: none;
        border: 1px solid var(--xh-border-default);
        border-radius: var(--xh-shape-surface);
        padding: 8px;
      "
    >
      <div
        v-for="(row, r) in rows"
        :key="r"
        style="display: flex; gap: 8px; inline-size: max-content; padding-block: 2px"
      >
        <span
          v-for="cell in row"
          :key="cell"
          style="inline-size: 56px; color: var(--xh-fg-muted); font-variant-numeric: tabular-nums"
        >
          {{ cell }}
        </span>
      </div>
    </div>

    <XhScrollbarRoot :scrollable="box" type="auto" gutter>
      <XhScrollbarTrack>
        <XhScrollbarThumb />
      </XhScrollbarTrack>
      <XhScrollbarCorner />
    </XhScrollbarRoot>
    <XhScrollbarRoot :scrollable="box" type="auto" orientation="horizontal" gutter>
      <XhScrollbarTrack>
        <XhScrollbarThumb />
      </XhScrollbarTrack>
    </XhScrollbarRoot>
  </div>
</template>
`;export{r as default};
