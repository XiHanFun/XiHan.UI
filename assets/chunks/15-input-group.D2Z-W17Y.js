var e=`<!-- 输入组 | 放进 InputGroup，与按钮或固定前后缀拼为一体：中缝合成一条描边，圆角只留在两端 -->
<script setup lang="ts">
import {
  XhButton,
  XhInputGroupItem,
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
        <XhTextFieldInput aria-label="站内搜索" />
      </XhTextFieldControl>
    </XhTextFieldRoot>
    <XhButton>搜索</XhButton>
  </XhInputGroupRoot>

  <XhInputGroupRoot>
    <XhInputGroupItem>https://</XhInputGroupItem>
    <XhTextFieldRoot placeholder="xihanfun">
      <XhTextFieldControl>
        <XhTextFieldInput aria-label="域名" />
      </XhTextFieldControl>
    </XhTextFieldRoot>
    <XhInputGroupItem>.com</XhInputGroupItem>
  </XhInputGroupRoot>
</template>
`;export{e as default};