const a=`<!-- 尺寸 | size 只改内边距、间距与字号，不写就是缺省档；关闭钮的命中区不跟着缩 -->
<script setup lang="ts">
import { XhTagCloseTrigger, XhTagLabel, XhTagRoot } from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
    <XhTagRoot variant="subtle" size="sm" closable>
      <XhTagLabel>小</XhTagLabel>
      <XhTagCloseTrigger>×</XhTagCloseTrigger>
    </XhTagRoot>
    <XhTagRoot variant="subtle" closable>
      <XhTagLabel>缺省</XhTagLabel>
      <XhTagCloseTrigger>×</XhTagCloseTrigger>
    </XhTagRoot>
    <XhTagRoot variant="subtle" size="lg" closable>
      <XhTagLabel>大</XhTagLabel>
      <XhTagCloseTrigger>×</XhTagCloseTrigger>
    </XhTagRoot>
  </div>
</template>
`;export{a as default};
