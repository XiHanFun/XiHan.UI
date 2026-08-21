const o=`<!-- 受控 | 传了 value 就由宿主说了算；值可以是 null，表示一项都没选中 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhRadioGroupItem,
  XhRadioGroupItemText,
  XhRadioGroupLabel,
  XhRadioGroupRoot,
} from "@xihan-ui/vue";

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
  <span>当前：{{ plan ?? "（未选）" }}</span>
  <button type="button" @click="plan = null">清空</button>
</template>
`;export{o as default};
