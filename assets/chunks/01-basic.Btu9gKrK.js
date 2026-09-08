const t=`<!-- 基础用法 | 前后缀与输入框拼成一个盒：中缝合成一条，圆角只留在两端 -->
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
    <XhInputGroupItem>https://</XhInputGroupItem>
    <XhTextFieldRoot placeholder="xihanfun">
      <XhTextFieldControl>
        <XhTextFieldInput />
      </XhTextFieldControl>
    </XhTextFieldRoot>
    <XhInputGroupItem>.com</XhInputGroupItem>
  </XhInputGroupRoot>
</template>
`;export{t as default};
