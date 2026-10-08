var e=`<!-- 随文 | 缺省高度是所在行的一行字高、宽 6rem，放进正文或更小的说明文字里都不撑高这一行 -->
<script setup lang="ts">
import { XhSparkline } from "@xihan-ui/vue";

const signups = [42, 38, 51, 47, 60, 58, 66];
<\/script>

<template>
  <div :style="{ display: 'grid', gap: 'var(--xh-space-3)' }">
    <div>
      本周注册 <XhSparkline :data="signups" aria-label="本周每日注册数" /> 共 362 人，较上周多 18%。
    </div>
    <div :style="{ color: 'var(--xh-fg-muted)', fontSize: 'var(--xh-text-caption-size)' }">
      数据截至今日 18:00 <XhSparkline :data="signups" markers="none" aria-label="本周每日注册数" />
    </div>
  </div>
</template>
`;export{e as default};