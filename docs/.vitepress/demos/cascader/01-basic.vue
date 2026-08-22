<!-- 基础用法 | collection 是层级、显示文本与禁用的唯一事实源；levels 按深度摊开，每层一个 column -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderControl,
  XhCascaderIndicator,
  XhCascaderItem,
  XhCascaderItemIndicator,
  XhCascaderItemText,
  XhCascaderLabel,
  XhCascaderPositioner,
  XhCascaderRoot,
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
      {
        value: "ningbo",
        label: "宁波",
        children: [{ value: "haishu", label: "海曙区" }],
      },
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
  <XhCascaderRoot v-slot="{ levels }" v-model:value="area" :collection="regions" placeholder="请选择地区">
    <XhCascaderLabel>收货地区</XhCascaderLabel>
    <XhCascaderControl>
      <XhCascaderTrigger>
        <XhCascaderValueText />
        <XhCascaderIndicator />
      </XhCascaderTrigger>
    </XhCascaderControl>
    <XhCascaderPositioner>
      <XhCascaderContent>
        <XhCascaderColumn v-for="lv in levels" :key="lv.level" :level="lv.level">
          <XhCascaderItem v-for="node in lv.items" :key="node.value" :value="node.value">
            <XhCascaderItemText>{{ node.label }}</XhCascaderItemText>
            <XhCascaderItemIndicator />
          </XhCascaderItem>
        </XhCascaderColumn>
      </XhCascaderContent>
    </XhCascaderPositioner>
  </XhCascaderRoot>
  <p>当前路径：{{ area.length ? area[0].join(" / ") : "（未选）" }}</p>
</template>
