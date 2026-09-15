const n=`<!-- 顺序排列 | 按文档顺序逐列填充 -->
<script setup lang="ts">
import { XhMasonry } from "@xihan-ui/vue";

const steps = ["创建项目", "配置主题", "添加组件", "连接数据", "运行测试", "发布应用"];
<\/script>

<template>
  <XhMasonry :columns="3" gap="sm" sequential style="inline-size: min(640px, 100%)">
    <div
      v-for="(step, index) in steps"
      :key="step"
      :style="\`padding: \${14 + (index % 3) * 8}px 14px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)\`"
    >
      <strong>{{ index + 1 }}</strong>
      <div style="margin-block-start: 6px">{{ step }}</div>
    </div>
  </XhMasonry>
</template>
`;export{n as default};
