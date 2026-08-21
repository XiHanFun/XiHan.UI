const e=`<!-- 浮层底栏 | content 的子节点全由作者写：列装进一层横排容器，底栏与它并列，就横跨了全部列 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhCascaderColumn,
  XhCascaderContent,
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
<\/script>

<template>
  <XhCascaderRoot
    v-slot="{ levels, value, clear, setOpen }"
    v-model:value="picked"
    :collection="catalog"
    multiple
    placeholder="可以多挑几条"
  >
    <XhCascaderLabel>采购清单</XhCascaderLabel>
    <XhCascaderTrigger>
      <XhCascaderValueText />
      <XhCascaderIndicator>▾</XhCascaderIndicator>
    </XhCascaderTrigger>
    <XhCascaderPositioner>
      <!-- 浮层壳改成竖排：上半是并排的列，下半是横跨全宽的底栏 -->
      <XhCascaderContent style="flex-direction: column">
        <div style="display: flex; flex-direction: row; align-items: stretch">
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
              <XhCascaderItemIndicator>✓</XhCascaderItemIndicator>
            </XhCascaderItem>
          </XhCascaderColumn>
        </div>
        <div
          style="
            display: flex;
            gap: 8px;
            align-items: center;
            justify-content: space-between;
            padding: 8px;
            border-block-start: 1px solid var(--xh-border-subtle);
          "
        >
          <span style="color: var(--xh-fg-subtle); font-size: 12px">
            已选 {{ value.length }} 条
          </span>
          <span style="display: flex; gap: 8px">
            <XhButton size="sm" variant="ghost" @click="clear()">清空</XhButton>
            <XhButton size="sm" @click="setOpen(false)">完成</XhButton>
          </span>
        </div>
      </XhCascaderContent>
    </XhCascaderPositioner>
  </XhCascaderRoot>
  <p>已选：{{ picked.map((p) => p.join("/")).join("、") || "（无）" }}</p>
</template>
`;export{e as default};
