const e=`<!-- 分段形态 | variant="segmented" 把一排短选项画成一条轨道，选中段由滑块标出，换段时滑块滑过去；缺省横排 -->
<script setup lang="ts">
import { XhRadioGroupRoot } from "@xihan-ui/vue";

const ranges = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];
<\/script>

<template>
  <!-- 轨道里不排可见标题：label 在这一形态下只作可及名 -->
  <XhRadioGroupRoot
    variant="segmented"
    :collection="ranges"
    default-value="week"
    label="时间粒度"
  />
</template>
`;export{e as default};
