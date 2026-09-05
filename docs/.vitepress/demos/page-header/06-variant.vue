<!-- 形态 | 不写 variant 即不画面（与写 plain 一个样）；surface 加底色、圆角与左右内衬，raised 再加一层抬起投影，bordered 在这两档改画整圈描边 -->
<script setup lang="ts">
import { XhPageHeaderDescription, XhPageHeaderRoot, XhPageHeaderTitle } from "@xihan-ui/vue";

// 第一档不写 variant，用 undefined 表达
const variants = [
  { variant: undefined, label: "不画面" },
  { variant: "surface", label: "有面" },
  { variant: "raised", label: "抬起" },
] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XhPageHeaderRoot v-for="v in variants" :key="v.label" :variant="v.variant" bordered>
      <XhPageHeaderTitle>{{ v.label }}</XhPageHeaderTitle>
      <XhPageHeaderDescription>页头贴在什么底上，由这一轴决定</XhPageHeaderDescription>
    </XhPageHeaderRoot>
  </div>
</template>
