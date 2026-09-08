const t=`<!-- 尺寸档 | 前后缀块跟着组内控件自己的档走，组上不必把同一档再写一遍 -->
<script setup lang="ts">
import {
  XhInputGroupItem,
  XhInputGroupRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhInputGroupRoot>
    <XhInputGroupItem>￥</XhInputGroupItem>
    <XhTextFieldRoot size="sm" placeholder="0.00">
      <XhTextFieldControl>
        <XhTextFieldInput />
      </XhTextFieldControl>
    </XhTextFieldRoot>
  </XhInputGroupRoot>

  <XhInputGroupRoot>
    <XhInputGroupItem>￥</XhInputGroupItem>
    <XhTextFieldRoot size="lg" placeholder="0.00">
      <XhTextFieldControl>
        <XhTextFieldInput />
      </XhTextFieldControl>
    </XhTextFieldRoot>
  </XhInputGroupRoot>
</template>
`;export{t as default};
