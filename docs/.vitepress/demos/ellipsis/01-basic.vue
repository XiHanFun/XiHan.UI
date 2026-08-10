<!-- 基础用法 | 一行放不下就收成省略号；有没有被裁如实报出来 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhEllipsis } from "@xihan-ui/vue";

const width = ref(240);
const overflowing = ref(false);
const text =
  "订单 2024-0731-8842 已由杭州仓发出，预计明日 18:00 前送达，签收前请当面核对包装。";
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%">
    <label style="display: flex; align-items: center; gap: 8px">
      容器宽度
      <input v-model.number="width" type="range" min="120" max="640" step="20" />
      {{ width }}px
    </label>

    <!-- 盒子越窄裁得越多。量测跟着容器尺寸走，拖动过程中结论一直是准的 -->
    <div :style="{ inlineSize: `${width}px`, maxInlineSize: '100%' }">
      <XhEllipsis @overflow-change="overflowing = $event.overflowing">
        {{ text }}
      </XhEllipsis>
    </div>

    <p style="margin: 0; color: var(--xh-fg-muted)">
      此刻 {{ overflowing ? "被裁掉了一截" : "整段都放得下" }}
    </p>
  </div>
</template>
