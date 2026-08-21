const n=`<!-- 标签位置 | placement 决定标签在上还是在左，不传即在上 -->
<script setup lang="ts">
import {
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsValue,
} from "@xihan-ui/vue";

const rows = [
  { label: "订单号", value: "XH-20260810-0042" },
  { label: "下单时间", value: "2026-08-10 09:31" },
];

// 上面那一档不写 placement，用 undefined 表达
const placements = [
  { placement: undefined, caption: "标签在上（默认）" },
  { placement: "left", caption: "标签在左" },
] as const;
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 24px">
    <div v-for="p in placements" :key="p.caption" style="inline-size: 260px">
      <p>{{ p.caption }}</p>
      <XhDescriptionsRoot :placement="p.placement">
        <XhDescriptionsItem v-for="row in rows" :key="row.label">
          <XhDescriptionsLabel>{{ row.label }}</XhDescriptionsLabel>
          <XhDescriptionsValue>{{ row.value }}</XhDescriptionsValue>
        </XhDescriptionsItem>
      </XhDescriptionsRoot>
    </div>
  </div>
</template>
`;export{n as default};
