<!-- 语气、尺寸与状态 | tone 决定点亮的星使用哪族颜色，不写时沿用警示色；size 改变星的大小与间距，不写即默认中档；read-only 仍进入 Tab 序列、读屏可朗读但不可修改，disabled 整条退出 Tab 序列 -->
<script setup lang="ts">
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: var(--xh-space-6)">
    <div style="display: flex; gap: var(--xh-space-8); flex-wrap: wrap">
      <XhRatingRoot v-for="t in tones" :key="t" v-slot="{ items }" :tone="t" :default-value="4" read-only>
        <XhRatingLabel>{{ t }}</XhRatingLabel>
        <XhRatingControl>
          <XhRatingItem v-for="i in items" :key="i" :value="i" />
        </XhRatingControl>
      </XhRatingRoot>
    </div>

    <div style="display: flex; gap: var(--xh-space-8); flex-wrap: wrap; align-items: flex-start">
      <XhRatingRoot v-slot="{ items }" :default-value="3" size="sm">
        <XhRatingLabel>sm</XhRatingLabel>
        <XhRatingControl>
          <XhRatingItem v-for="i in items" :key="i" :value="i" />
        </XhRatingControl>
      </XhRatingRoot>

      <XhRatingRoot v-slot="{ items }" :default-value="3">
        <XhRatingLabel>缺省</XhRatingLabel>
        <XhRatingControl>
          <XhRatingItem v-for="i in items" :key="i" :value="i" />
        </XhRatingControl>
      </XhRatingRoot>

      <XhRatingRoot v-slot="{ items }" :default-value="3" size="lg">
        <XhRatingLabel>lg</XhRatingLabel>
        <XhRatingControl>
          <XhRatingItem v-for="i in items" :key="i" :value="i" />
        </XhRatingControl>
      </XhRatingRoot>
    </div>

    <div style="display: flex; gap: var(--xh-space-8); flex-wrap: wrap">
      <XhRatingRoot v-slot="{ items }" :default-value="4" read-only>
        <XhRatingLabel>只读（4 星）</XhRatingLabel>
        <XhRatingControl>
          <XhRatingItem v-for="i in items" :key="i" :value="i" />
        </XhRatingControl>
      </XhRatingRoot>

      <XhRatingRoot v-slot="{ items }" :default-value="2" disabled>
        <XhRatingLabel>禁用（2 星）</XhRatingLabel>
        <XhRatingControl>
          <XhRatingItem v-for="i in items" :key="i" :value="i" />
        </XhRatingControl>
      </XhRatingRoot>
    </div>
  </div>
</template>
