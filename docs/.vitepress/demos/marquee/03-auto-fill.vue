<!-- 重复铺满 | autoFill 在轨道里铺两份内容，走完一份第二份正好压在起点上，看不出接缝；不开则整段走完再回来 -->
<script setup lang="ts">
import { XhMarqueeContent, XhMarqueeRoot } from "@xihan-ui/vue";

const tags = ["多租户", "字段级脱敏", "动态 API", "工作流", "代码生成"];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <div v-for="fill in [false, true]" :key="String(fill)">
      <p style="margin-block-end: 8px; font-size: 12px">
        {{ fill ? "autoFill：一圈只走一份，接缝处始终有内容" : "不开：整段走出窗口后再从另一侧进来" }}
      </p>
      <XhMarqueeRoot
        :auto-fill="fill"
        :speed="60"
        style="max-inline-size: 420px; border: 1px solid var(--xh-border-default); border-radius: 6px"
      >
        <XhMarqueeContent>
          <span v-for="t in tags" :key="t" style="padding: 6px 14px; white-space: nowrap">{{ t }}</span>
        </XhMarqueeContent>
      </XhMarqueeRoot>
    </div>
  </div>
</template>
