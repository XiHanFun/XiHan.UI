const s=`<!-- 跨列 | 一格写 span 横跨几列，上限是当前列数；长文本字段因此不必另开一份描述列表 -->
<script setup lang="ts">
import {
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsValue,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhDescriptionsRoot :columns="3" bordered style="max-inline-size: 720px">
    <XhDescriptionsItem>
      <XhDescriptionsLabel>订单号</XhDescriptionsLabel>
      <XhDescriptionsValue>XH-20260810-0042</XhDescriptionsValue>
    </XhDescriptionsItem>
    <XhDescriptionsItem>
      <XhDescriptionsLabel>下单时间</XhDescriptionsLabel>
      <XhDescriptionsValue>2026-08-10 09:31</XhDescriptionsValue>
    </XhDescriptionsItem>
    <XhDescriptionsItem>
      <XhDescriptionsLabel>支付方式</XhDescriptionsLabel>
      <XhDescriptionsValue>余额支付</XhDescriptionsValue>
    </XhDescriptionsItem>

    <XhDescriptionsItem :span="2">
      <XhDescriptionsLabel>收货地址</XhDescriptionsLabel>
      <XhDescriptionsValue>浙江省杭州市余杭区文一西路 969 号</XhDescriptionsValue>
    </XhDescriptionsItem>
    <XhDescriptionsItem>
      <XhDescriptionsLabel>联系电话</XhDescriptionsLabel>
      <XhDescriptionsValue>138 0000 0000</XhDescriptionsValue>
    </XhDescriptionsItem>

    <!-- 超过 columns 时按 columns 算，不会跨出网格另起一行 -->
    <XhDescriptionsItem :span="9">
      <XhDescriptionsLabel>备注</XhDescriptionsLabel>
      <XhDescriptionsValue>工作日 09:00–18:00 送达，到前电联。</XhDescriptionsValue>
    </XhDescriptionsItem>
  </XhDescriptionsRoot>
</template>
`;export{s as default};
