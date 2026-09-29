const n=`<!-- 从外面强调一块 | 受控的 activeKey 写扇区名，图就强调那一块、中心与提示框跟着显示它：图外的筛选、列表或别的图都能这样指给读者看 -->
<script setup lang="ts">
import type { ChartKey } from "@xihan-ui/headless";
import { XhPieChartRoot, XhRadioGroupRoot } from "@xihan-ui/vue";
import { computed, ref } from "vue";

const rows = [
  { channel: "搜索", visits: 4200 },
  { channel: "直接访问", visits: 2600 },
  { channel: "社交", visits: 1800 },
  { channel: "邮件", visits: 900 },
  { channel: "广告", visits: 500 },
];

const choices = [
  { value: "none", label: "不突出" },
  ...rows.map(row => ({ value: row.channel, label: row.channel })),
];

// 图外选中的那一项；「不突出」对应 null
const choice = ref<string | null>("none");
const activeKey = computed<ChartKey | null>(() => (choice.value === "none" ? null : choice.value));
<\/script>

<template>
  <div style="display: grid; gap: var(--xh-space-3); justify-items: start; width: 100%">
    <XhRadioGroupRoot v-model:value="choice" variant="segmented" :collection="choices" aria-label="突出显示的渠道" />
    <XhPieChartRoot
      :data="rows"
      name-field="channel"
      value-field="visits"
      :active-key="activeKey"
      style="width: 100%"
    >
      <template #caption>访问来源</template>
    </XhPieChartRoot>
  </div>
</template>
`;export{n as default};
