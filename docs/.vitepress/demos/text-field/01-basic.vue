<!-- 基础用法 | 只写根组件就按标准结构铺出标题与输入框，clearable 带上清空按钮；不传 value 即为非受控，组件自行维护值 -->
<script setup lang="ts">
import { XhTextFieldRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhTextFieldRoot label="邮箱" name="email" type="email" placeholder="输入你的邮箱" clearable />
</template>
