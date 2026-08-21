const t=`<!-- 禁用与载入 | loading 会挡住点击，并给 indicator 部件挂上旋转动画 -->
<script setup lang="ts">
import { XhButton, XhButtonIndicator, XhButtonLabel } from "@xihan-ui/vue";
<\/script>

<template>
  <XhButton disabled>禁用</XhButton>
  <XhButton loading>
    <XhButtonIndicator />
    <XhButtonLabel>提交中</XhButtonLabel>
  </XhButton>
</template>
`;export{t as default};
