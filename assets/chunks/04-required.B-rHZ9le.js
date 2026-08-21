const e=`<!-- 必填标记 | required 落成 data-required，皮肤据此给组标题加星号；星号只是视觉冗余，必填这件事要一并写进文案 -->
<script setup lang="ts">
import { XhFieldsetHelperText, XhFieldsetLegend, XhFieldsetRoot } from "@xihan-ui/vue";
<\/script>

<template>
  <XhFieldsetRoot required style="inline-size: 320px;">
    <XhFieldsetLegend>配送时段</XhFieldsetLegend>
    <label style="display: flex; gap: 8px; align-items: center;">
      <input type="radio" name="fieldset-slot" value="am" />
      上午（9:00–12:00）
    </label>
    <label style="display: flex; gap: 8px; align-items: center;">
      <input type="radio" name="fieldset-slot" value="pm" />
      下午（13:00–18:00）
    </label>
    <XhFieldsetHelperText>必选一项，下单后不可更改</XhFieldsetHelperText>
  </XhFieldsetRoot>
</template>
`;export{e as default};
