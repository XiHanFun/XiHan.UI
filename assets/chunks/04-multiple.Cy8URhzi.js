const e=`<!-- 多选 | 选中的是一组路径，落值后浮层不收起、焦点留在列里接着挑；再点一次即取消 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhCascaderClearTrigger,
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

const catalog = [
  {
    value: "fruit",
    label: "水果",
    children: [
      { value: "apple", label: "苹果" },
      { value: "banana", label: "香蕉" },
    ],
  },
  {
    value: "vegetable",
    label: "蔬菜",
    children: [
      { value: "tomato", label: "番茄" },
      { value: "potato", label: "土豆" },
    ],
  },
];

const picked = ref<string[][]>([["fruit", "apple"]]);
<\/script>

<template>
  <XhCascaderRoot
    v-slot="{ levels }"
    v-model:value="picked"
    :collection="catalog"
    multiple
    placeholder="可以多挑几条"
  >
    <XhCascaderLabel>采购清单</XhCascaderLabel>
    <XhCascaderControl>
      <XhCascaderTrigger>
        <XhCascaderValueText />
        <XhCascaderIndicator />
      </XhCascaderTrigger>
      <XhCascaderClearTrigger />
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
  <p>已选 {{ picked.length }} 条：{{ picked.map((p) => p.join("/")).join("、") || "（无）" }}</p>
</template>
`;export{e as default};
