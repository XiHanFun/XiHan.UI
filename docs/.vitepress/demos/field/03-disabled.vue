<!-- 禁用 | Field 的 disabled 只把 data-disabled 铺到各部件上；真正改不动还得在自己的控件上落原生 disabled -->
<script setup lang="ts">
import { XhFieldControl, XhFieldDescription, XhFieldLabel, XhFieldRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhFieldRoot disabled style="inline-size: 280px;">
    <XhFieldLabel>登录账号</XhFieldLabel>
    <XhFieldControl>
      <input value="zhaifanhua" disabled />
    </XhFieldControl>
    <XhFieldDescription>账号创建后不可更改</XhFieldDescription>
  </XhFieldRoot>
</template>
