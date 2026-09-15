<!-- 可见文案 | label 部件未写内容时显示解析后的 label，屏幕上看到的与读屏朗读的因此是同一段文字 -->
<script setup lang="ts">
import { XhSpinner, XhSpinnerLabel } from "@xihan-ui/vue";
</script>

<template>
  <!-- 文案只写在 label prop 上，部件自己把它显示出来 -->
  <XhSpinner label="正在加载数据">
    <XhSpinnerLabel />
  </XhSpinner>

  <!-- 换语言包同理：label → translations.label → 内置默认值，取第一段有字的 -->
  <XhSpinner :translations="{ label: '正在提交表单' }">
    <XhSpinnerLabel />
  </XhSpinner>
</template>
