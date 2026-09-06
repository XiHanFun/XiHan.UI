<!-- 浮层底栏 | footer 写在 content 里、与列并列，横跨全部列；它不进任何一列的拥有关系，方向键也走不到 -->
<script setup lang="ts">
import {
  XhButton,
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderControl,
  XhCascaderFooter,
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
import { ref } from "vue";

const catalog = [
  {
    value: "fruit",
    label: "水果",
    children: [
      { value: "apple", label: "苹果" },
      { value: "banana", label: "香蕉" },
      { value: "grape", label: "葡萄" },
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
</script>

<template>
  <XhCascaderRoot
    v-slot="{ levels, value, clear, setOpen }"
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
    </XhCascaderControl>
    <XhCascaderPositioner>
      <XhCascaderContent>
        <XhCascaderColumn
          v-for="lv in levels"
          :key="lv.level"
          :level="lv.level"
        >
          <XhCascaderItem
            v-for="node in lv.items"
            :key="node.value"
            :value="node.value"
          >
            <XhCascaderItemText>{{ node.label }}</XhCascaderItemText>
            <XhCascaderItemIndicator />
          </XhCascaderItem>
        </XhCascaderColumn>
        <XhCascaderFooter style="justify-content: space-between">
          <span>已选 {{ value.length }} 条</span>
          <span style="display: flex; gap: 8px">
            <XhButton size="sm" variant="ghost" @click="clear()">清空</XhButton>
            <XhButton size="sm" @click="setOpen(false)">完成</XhButton>
          </span>
        </XhCascaderFooter>
      </XhCascaderContent>
    </XhCascaderPositioner>
  </XhCascaderRoot>
  <p>已选：{{ picked.map((p) => p.join("/")).join("、") || "（无）" }}</p>
</template>
