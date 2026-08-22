const e=`<!-- 自定义换算 | parse 把显示串读成数、format 把数写回显示串；两个方向必须互逆，否则按一下加号值就会漂 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";

const amount = ref("1,234");
// 千位分隔符：读的时候把逗号去掉，写的时候再加回来
const parseAmount = (text: string) => Number(text.replace(/,/g, ""));
const formatAmount = (value: number) => value.toLocaleString("en-US");

const weight = ref("60 kg");
// 单位后缀同理：认得出后缀就读得出数
const parseWeight = (text: string) => Number(text.replace(/\\s*kg$/i, ""));
const formatWeight = (value: number) => \`\${value} kg\`;
<\/script>

<template>
  <XhNumberFieldRoot
    v-model:value="amount"
    :min="0"
    :max="99999"
    :step="100"
    :parse="parseAmount"
    :format="formatAmount"
  >
    <XhNumberFieldLabel>金额（千位分隔）</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldDecrementTrigger />
      <XhNumberFieldInput style="inline-size: 96px" />
      <XhNumberFieldIncrementTrigger />
    </XhNumberFieldControl>
  </XhNumberFieldRoot>

  <XhNumberFieldRoot
    v-model:value="weight"
    :min="0"
    :max="200"
    :step="5"
    :parse="parseWeight"
    :format="formatWeight"
  >
    <XhNumberFieldLabel>体重（带单位）</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldDecrementTrigger />
      <XhNumberFieldInput style="inline-size: 88px" />
      <XhNumberFieldIncrementTrigger />
    </XhNumberFieldControl>
  </XhNumberFieldRoot>

  <!-- 输入途中一律不补格式，否则光标会被打断；手打 1500 要等失焦才变成 1,500 -->
  <span style="font-size: 13px">金额：{{ amount }} · 体重：{{ weight }}</span>
</template>
`;export{e as default};
