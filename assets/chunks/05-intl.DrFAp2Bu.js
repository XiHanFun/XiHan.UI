const n=`<!-- 语言与数字格式 | locale 决定小数点与分组习惯，formatOptions 交给 Intl.NumberFormat 铺货币、百分比与紧凑记数；小数位仍归 precision -->
<script setup lang="ts">
import { XhNumberAnimation } from "@xihan-ui/vue";

const euro = { style: "currency", currency: "EUR", useGrouping: true } as const;
const percent = { style: "percent" } as const;
const compact = { notation: "compact" } as const;
<\/script>

<template>
  <p>
    德语欧元：
    <XhNumberAnimation :from="0" :to="1234567.89" :precision="2" locale="de-DE" :format-options="euro" />
  </p>
  <p>
    百分比：
    <XhNumberAnimation :from="0" :to="0.873" :precision="1" locale="zh-CN" :format-options="percent" />
  </p>
  <p>
    紧凑记数：
    <XhNumberAnimation :from="0" :to="12840000" :precision="1" locale="en-US" :format-options="compact" />
  </p>
</template>
`;export{n as default};
