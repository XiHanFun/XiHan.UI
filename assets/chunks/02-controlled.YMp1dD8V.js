var e=`<!-- 受控 | 传入 value 后由宿主决定；值可以是 null，表示没有任何一项选中 -->
<script setup lang="ts">
import {
  XhButton,
  XhRadioGroupItem,
  XhRadioGroupItemText,
  XhRadioGroupLabel,
  XhRadioGroupRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const plan = ref<string | null>("free");
<\/script>

<template>
  <XhRadioGroupRoot v-model:value="plan">
    <XhRadioGroupLabel>套餐</XhRadioGroupLabel>
    <XhRadioGroupItem value="free">
      <XhRadioGroupItemText>免费版</XhRadioGroupItemText>
    </XhRadioGroupItem>
    <XhRadioGroupItem value="standard">
      <XhRadioGroupItemText>标准版</XhRadioGroupItemText>
    </XhRadioGroupItem>
  </XhRadioGroupRoot>
  <XhButton variant="outline" size="sm" @click="plan = null">清空</XhButton>
  <span data-demo-output>当前：{{ plan ?? "（未选）" }}</span>
</template>
`;export{e as default};