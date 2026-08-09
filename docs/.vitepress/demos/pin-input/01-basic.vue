<!-- 基础用法 | 每格都是原生输入框，敲一个字符自动跳下一格；粘贴整串会从落点那一格起按格铺开 -->
<script setup lang="ts">
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhPinInputRoot :length="4" placeholder="·">
    <XhPinInputLabel>验证码</XhPinInputLabel>
    <!-- 格间距长在格子自己身上，这层包裹只负责排成一行、不要再加 gap -->
    <div style="display: flex">
      <XhPinInputInput v-for="i in 4" :key="i" :index="i - 1" />
    </div>
  </XhPinInputRoot>
</template>
