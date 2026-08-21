const e=`<!-- 尺寸 | 不传 size 即默认档；触发框与列里的条目一起换档 -->
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

const sizes = [
  { size: "sm", label: "sm" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "lg" },
];

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
  <div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px">
    <XhCascaderRoot
      v-for="s in sizes"
      :key="s.label"
      v-slot="{ levels }"
      :size="s.size"
      :collection="regions"
      placeholder="请选择地区"
    >
      <XhCascaderLabel>{{ s.label }}</XhCascaderLabel>
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
`;export{e as default};
