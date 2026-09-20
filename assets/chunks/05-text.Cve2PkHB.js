const e=`<!-- 人读文字 | text 关闭后只剩条；EAN 的守卫条按规范比数据条长 5X，不随文字变化 -->
<script setup lang="ts">
import { XhBarCode } from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: start">
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhBarCode format="ean13" value="590123412345" />
      <span style="font-size: 12px">缺省印文字</span>
    </div>
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhBarCode format="ean13" value="590123412345" :text="false" />
      <span style="font-size: 12px">text=false</span>
    </div>
  </div>
</template>
`;export{e as default};
