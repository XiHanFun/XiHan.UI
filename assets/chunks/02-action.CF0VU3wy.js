const t=`<!-- 搭动作钮 | 按钮作用在紧挨着它的那个输入框上，两段共用中缝那条边 -->
<script setup lang="ts">
import {
  XhButton,
  XhInputGroupRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhInputGroupRoot>
    <XhTextFieldRoot placeholder="搜索文档" clearable>
      <XhTextFieldControl>
        <XhTextFieldInput />
      </XhTextFieldControl>
    </XhTextFieldRoot>
    <XhButton variant="solid">搜索</XhButton>
  </XhInputGroupRoot>
</template>
`;export{t as default};
