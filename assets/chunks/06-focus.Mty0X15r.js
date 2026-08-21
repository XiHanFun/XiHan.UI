const t=`<!-- 焦点明细 | 焦点落到某一天时报出日期与计数，键盘用户与鼠标用户看到同一份明细 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhHeatmapRoot } from "@xihan-ui/vue";

const activity = [
  { date: "2024-01-02", count: 1 },
  { date: "2024-01-04", count: 3 },
  { date: "2024-01-08", count: 6 },
  { date: "2024-01-11", count: 2 },
  { date: "2024-01-15", count: 9 },
  { date: "2024-01-17", count: 4 },
  { date: "2024-01-22", count: 12 },
  { date: "2024-01-25", count: 7 },
  { date: "2024-01-27", count: 2 },
];

const readout = ref("（把焦点移到某一格）");
<\/script>

<template>
  <div style="display: grid; gap: 12px">
    <!-- 每格自己就念得出日期与计数；这里再把它显示出来，眼睛也看得见 -->
    <XhHeatmapRoot
      :value="activity"
      start-date="2024-01-01"
      end-date="2024-01-28"
      @cell-focus="readout = \`\${$event.date}：\${$event.count} 次（第 \${$event.level} 档）\`"
    />
    <span>{{ readout }}</span>
  </div>
</template>
`;export{t as default};
