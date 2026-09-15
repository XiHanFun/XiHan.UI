const n=`<!-- 禁用与校验失败 | disabled 让每格都带原生 disabled 且不参与提交，invalid 只做标注、照样能改 -->
<script setup lang="ts">
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/vue";
<\/script>

<template>
  <XhPinInputRoot :length="4" :default-value="['1', '2', '3', '4']" disabled>
    <XhPinInputLabel>禁用</XhPinInputLabel>
    <div style="display: flex">
      <XhPinInputInput v-for="i in 4" :key="i" :index="i - 1" />
    </div>
  </XhPinInputRoot>

  <XhPinInputRoot :length="4" :default-value="['1', '2', '3', '4']" invalid>
    <XhPinInputLabel>校验失败</XhPinInputLabel>
    <div style="display: flex">
      <XhPinInputInput v-for="i in 4" :key="i" :index="i - 1" />
    </div>
  </XhPinInputRoot>
</template>
`;export{n as default};
