const n=`<!-- 分组排布 | 格子由作者逐个写出，中间插什么都行；下标接着排，跳格与整串粘贴仍按文档序走 -->
<script setup lang="ts">
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/vue";
<\/script>

<template>
  <XhPinInputRoot :length="6" type="alphanumeric" placeholder="·">
    <XhPinInputLabel>邀请码（3 + 3）</XhPinInputLabel>
    <div style="display: flex; align-items: center">
      <XhPinInputInput v-for="i in 3" :key="'a' + i" :index="i - 1" />
      <span style="margin-inline: 8px">—</span>
      <XhPinInputInput v-for="i in 3" :key="'b' + i" :index="i + 2" />
    </div>
  </XhPinInputRoot>
</template>
`;export{n as default};
