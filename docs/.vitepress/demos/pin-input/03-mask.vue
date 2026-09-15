<!-- 遮蔽与字符类别 | mask 把每格转为密码框，type 决定哪类字符可以输入，其余按键既不进入值也不留在框中 -->
<script setup lang="ts">
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhPinInputRoot :length="4" mask>
    <XhPinInputLabel>支付密码（遮蔽）</XhPinInputLabel>
    <div style="display: flex">
      <XhPinInputInput v-for="i in 4" :key="i" :index="i - 1" />
    </div>
  </XhPinInputRoot>

  <XhPinInputRoot :length="4" type="alphanumeric">
    <XhPinInputLabel>兑换码（数字与字母）</XhPinInputLabel>
    <div style="display: flex">
      <XhPinInputInput v-for="i in 4" :key="i" :index="i - 1" />
    </div>
  </XhPinInputRoot>
</template>
