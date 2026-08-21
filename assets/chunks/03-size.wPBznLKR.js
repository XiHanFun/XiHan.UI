const n=`<!-- 尺寸 | 高度、内边距与字号在组上写一次，沿自定义属性流给组内每一段 -->
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"];
const views = ["日", "周", "月"];
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <XhButtonGroup v-for="s in sizes" :key="s" :size="s" variant="outline">
      <XhButton v-for="v in views" :key="v">{{ v }}</XhButton>
    </XhButtonGroup>
  </div>
</template>
`;export{n as default};
