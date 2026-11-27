<!-- 基础用法 | 只写根组件就按标准结构铺出标题与盒，减号、输入框、加号共用一份状态；值是原始输入串，不传 value 即为非受控 -->
<script setup lang="ts">
import { XhNumberFieldRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhNumberFieldRoot label="宽度" default-value="1024" :min="0" name="width" />
</template>
