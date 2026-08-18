<!-- 搜索 | searchable 让搜索框可用：输入后整条路径连缀过滤，候选列表替换列视图；上下键走候选、Enter 选中、Escape 先清词再收浮层。无匹配（试试输入「苏州」）时空态占位露面，文案经 translations 覆盖 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderIndicator,
  XhCascaderInput,
  XhCascaderItem,
  XhCascaderItemIndicator,
  XhCascaderItemText,
  XhCascaderLabel,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderSearchList,
  XhCascaderTrigger,
  XhCascaderValueText,
} from "@xihan-ui/vue";

const regions = [
  {
    value: "zhejiang",
    label: "浙江",
    children: [
      {
        value: "hangzhou",
        label: "杭州",
        children: [
          { value: "xihu", label: "西湖区" },
          { value: "binjiang", label: "滨江区" },
        ],
      },
      { value: "ningbo", label: "宁波", children: [{ value: "haishu", label: "海曙区" }] },
    ],
  },
  {
    value: "jiangsu",
    label: "江苏",
    children: [
      {
        value: "nanjing",
        label: "南京",
        children: [
          { value: "xuanwu", label: "玄武区" },
          { value: "gulou", label: "鼓楼区（暂不开放）", disabled: true },
        ],
      },
    ],
  },
];

const area = ref<string[][]>([]);
</script>

<template>
  <XhCascaderRoot
    v-slot="{ levels }"
    v-model:value="area"
    :collection="regions"
    :translations="{ noMatch: '未找到匹配的地区' }"
    searchable
    placeholder="试试输入「西湖」或「苏州」"
  >
    <XhCascaderLabel>收货地区</XhCascaderLabel>
    <XhCascaderTrigger>
      <XhCascaderValueText />
      <XhCascaderIndicator>▾</XhCascaderIndicator>
    </XhCascaderTrigger>
    <XhCascaderPositioner>
      <XhCascaderContent>
        <XhCascaderInput placeholder="搜索地区" />
        <XhCascaderSearchList />
        <XhCascaderColumn v-for="lv in levels" :key="lv.level" :level="lv.level">
          <XhCascaderItem v-for="node in lv.items" :key="node.value" :value="node.value">
            <XhCascaderItemText>{{ node.label }}</XhCascaderItemText>
            <XhCascaderItemIndicator>✓</XhCascaderItemIndicator>
          </XhCascaderItem>
        </XhCascaderColumn>
      </XhCascaderContent>
    </XhCascaderPositioner>
  </XhCascaderRoot>
  <p>当前路径：{{ area.length ? area[0].join(" / ") : "（未选）" }}</p>
</template>
