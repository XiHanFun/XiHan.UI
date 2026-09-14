<!-- 小数位与千位分隔 | precision 定小数位，separator 定分隔符；不给分隔符就不分隔，插什么符号是地区习惯 -->
<script setup lang="ts">
import { XhNumberAnimation } from "@xihan-ui/vue";
</script>

<template>
  <p>整数、不分隔：<XhNumberAnimation :from="0" :to="1234567" /></p>
  <p>整数、逗号分隔：<XhNumberAnimation :from="0" :to="1234567" separator="," /></p>
  <p>
    两位小数、空格分隔：
    <XhNumberAnimation :from="0" :to="1234567.89" :precision="2" separator=" " />
  </p>
  <p>
    负数也认：<XhNumberAnimation :from="0" :to="-8642.5" :precision="1" separator="," />
  </p>
</template>
