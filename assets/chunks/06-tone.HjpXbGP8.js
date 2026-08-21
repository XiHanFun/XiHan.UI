const n=`<!-- 语气 | tone 决定用哪族颜色，与 variant 正交；这里固定 subtle 形态，只看语气这一轴 -->
<script setup lang="ts">
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderIndicator,
  XhCascaderItem,
  XhCascaderItemText,
  XhCascaderLabel,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTrigger,
  XhCascaderValueText,
} from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

const regions = [
  {
    value: "zhejiang",
    label: "浙江",
    children: [
      { value: "hangzhou", label: "杭州" },
      { value: "ningbo", label: "宁波" },
    ],
  },
  {
    value: "jiangsu",
    label: "江苏",
    children: [{ value: "nanjing", label: "南京" }],
  },
];
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhCascaderRoot
      v-for="t in tones"
      :key="t"
      v-slot="{ levels }"
      variant="subtle"
      :tone="t"
      :collection="regions"
      placeholder="请选择地区"
    >
      <XhCascaderLabel>{{ t }}</XhCascaderLabel>
      <XhCascaderTrigger>
        <XhCascaderValueText />
        <XhCascaderIndicator>▾</XhCascaderIndicator>
      </XhCascaderTrigger>
      <XhCascaderPositioner>
        <XhCascaderContent>
          <XhCascaderColumn v-for="lv in levels" :key="lv.level" :level="lv.level">
            <XhCascaderItem v-for="node in lv.items" :key="node.value" :value="node.value">
              <XhCascaderItemText>{{ node.label }}</XhCascaderItemText>
            </XhCascaderItem>
          </XhCascaderColumn>
        </XhCascaderContent>
      </XhCascaderPositioner>
    </XhCascaderRoot>
  </div>
</template>
`;export{n as default};
