<!-- 遮罩形态 | overlay 包住一块内容：等待时盖一层遮罩、转圈居中，内容报 aria-busy 且点不到；loading 改成 false 即撤下 -->
<script setup lang="ts">
import { XhButton, XhSpinner } from "@xihan-ui/vue";
import { ref } from "vue";

const loading = ref(true);
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: var(--xh-space-3); justify-items: start">
    <XhButton variant="outline" size="sm" @click="loading = !loading">
      {{ loading ? "数据回来了" : "重新加载" }}
    </XhButton>

    <!-- 外框接住作者写的样式：遮罩照它的圆角铺满 -->
    <XhSpinner
      overlay
      :loading="loading"
      label="正在刷新报表"
      style="inline-size: 260px; border-radius: var(--xh-shape-surface)"
    >
      <div
        style="
          padding: var(--xh-space-4);
          border: var(--xh-stroke-thin) solid var(--xh-border-default);
          border-radius: var(--xh-shape-surface);
        "
      >
        <p style="margin: 0">本季新增客户 128 家，环比增长 12%。</p>
      </div>
    </XhSpinner>
  </div>
</template>
