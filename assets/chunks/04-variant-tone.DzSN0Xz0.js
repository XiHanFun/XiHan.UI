const n=`<!-- 形态与语气 | 形态决定颜色怎么用、语气决定用哪族颜色，两者都写在组上，段自己不重复标注 -->
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";

const variants = ["solid", "subtle", "outline", "ghost"];
const views = ["日", "周", "月"];
<\/script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <XhButtonGroup v-for="v in variants" :key="v" :variant="v" tone="brand">
      <XhButton v-for="label in views" :key="label">{{ label }}</XhButton>
    </XhButtonGroup>

    <!-- 换一族颜色只改语气，形态那条规则一个字不动 -->
    <XhButtonGroup variant="solid" tone="danger">
      <XhButton v-for="label in views" :key="label">{{ label }}</XhButton>
    </XhButtonGroup>
  </div>
</template>
`;export{n as default};
