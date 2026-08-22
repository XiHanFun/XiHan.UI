const n=`<!-- 形态 | variant 只改触发框的底色与描边用法，浮层与列不跟着变 -->
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

const variants = ["outline", "subtle", "ghost"] as const;

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
  <div style="display: grid; gap: 16px; justify-items: start">
    <XhCascaderRoot
      v-for="v in variants"
      :key="v"
      v-slot="{ levels }"
      :variant="v"
      :collection="regions"
      placeholder="请选择地区"
    >
      <XhCascaderLabel>{{ v }}</XhCascaderLabel>
      <XhCascaderTrigger>
        <XhCascaderValueText />
        <XhCascaderIndicator />
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
