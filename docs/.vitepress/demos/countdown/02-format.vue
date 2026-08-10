<!-- 模板与精度 | format 里 H 时 m 分 s 秒 S 毫秒，重复字母的个数即最少位数；precision 决定读到的数有多细 -->
<script setup lang="ts">
import { XhCountdown } from "@xihan-ui/vue";

const value = 3723 * 1000 + 456;
</script>

<template>
  <!-- 模板里非记号的字符原样留下，所以中文单位直接写在里面就行 -->
  <p>中文单位：<XhCountdown :value="value" format="H 时 m 分 s 秒" /></p>
  <p>只看分秒：<XhCountdown :value="value" format="mm:ss" /></p>

  <!-- 精度缺省是整秒，所以这一行的毫秒段一直是 000 -->
  <p>写了 SSS 但精度是秒：<XhCountdown :value="value" format="ss.SSS" /></p>
  <!-- 想显示毫秒得把精度提上去，模板与精度是两件事 -->
  <p>精度提到毫秒：<XhCountdown :value="value" format="ss.SSS" :precision="3" /></p>
</template>
