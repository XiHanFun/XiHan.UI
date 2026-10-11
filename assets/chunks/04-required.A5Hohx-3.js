var e=`<!-- 必填标记 | required 写为 data-required，皮肤据此为组标题加星号；星号只是视觉冗余，必填这一信息要一并写进文案 -->
<script setup lang="ts">
import { XhFieldsetDescription, XhFieldsetLegend, XhFieldsetRoot, XhRadioGroupRoot } from "@xihan-ui/vue";

const slots = [
  { value: "am", label: "上午（9:00–12:00）" },
  { value: "pm", label: "下午（13:00–18:00）" },
];
<\/script>

<template>
  <XhFieldsetRoot required style="inline-size: 320px;">
    <XhFieldsetLegend>配送时段</XhFieldsetLegend>
    <!-- 组标题只命名外层这一段，内层的单选组要自己的名字 -->
    <XhRadioGroupRoot :collection="slots" name="fieldset-slot" aria-label="配送时段" />
    <XhFieldsetDescription>必选一项，下单后不可更改</XhFieldsetDescription>
  </XhFieldsetRoot>
</template>
`;export{e as default};