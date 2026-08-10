<!-- 勾选与父子级联 | 复选下机器只做朴素切换，级联与半选由宿主在受控回调里算：勾选框本身就是行里的一段标记 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/vue";

const collection = [
  {
    value: "east",
    label: "华东",
    children: [
      { value: "sh", label: "上海" },
      { value: "hz", label: "杭州" },
      { value: "nj", label: "南京" },
    ],
  },
  {
    value: "north",
    label: "华北",
    children: [
      { value: "bj", label: "北京" },
      { value: "tj", label: "天津" },
    ],
  },
];

const childrenOf = new Map<string, string[]>();
const parentOf = new Map<string, string>();
for (const region of collection) {
  childrenOf.set(
    region.value,
    region.children.map((city) => city.value)
  );
  for (const city of region.children) parentOf.set(city.value, region.value);
}

const selected = ref<string[]>(["hz"]);

// 机器给的是「这一下切了谁」的朴素结果，宿主据此把整枝与祖先一并改写
function onSelectionChange(details: { value: string[] }): void {
  const prev = new Set(selected.value);
  const toggled =
    details.value.find((v) => !prev.has(v)) ??
    selected.value.find((v) => !details.value.includes(v));
  if (toggled == null) return;

  const on = !prev.has(toggled);
  const next = new Set(prev);
  for (const value of [toggled, ...(childrenOf.get(toggled) ?? [])]) {
    if (on) next.add(value);
    else next.delete(value);
  }

  const parent = parentOf.get(toggled);
  if (parent) {
    const kids = childrenOf.get(parent) ?? [];
    if (kids.every((k) => next.has(k))) next.add(parent);
    else next.delete(parent);
  }

  selected.value = [...next];
}

// 全选画勾、部分选画横杠、未选留空
function mark(value: string): string {
  if (selected.value.includes(value)) return "✓";
  const kids = childrenOf.get(value) ?? [];
  return kids.some((k) => selected.value.includes(k)) ? "–" : "";
}

const boxStyle = {
  display: "inline-flex",
  flex: "none",
  alignItems: "center",
  justifyContent: "center",
  inlineSize: "1rem",
  blockSize: "1rem",
  border: "1px solid var(--xh-border-strong)",
  borderRadius: "3px",
  fontSize: "0.75rem",
  lineHeight: "1",
};
</script>

<template>
  <div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
    <XhTreeRoot
      :collection="collection"
      :selected-value="selected"
      :default-expanded-value="['east', 'north']"
      :expand-on-click="false"
      selection-mode="multiple"
      @selection-change="onSelectionChange"
    >
      <XhTreeLabel>投放城市</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch v-for="region in collection" :key="region.value" :value="region.value">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger>▸</XhTreeBranchTrigger>
            <span aria-hidden="true" :style="boxStyle">{{ mark(region.value) }}</span>
            <XhTreeBranchText>{{ region.label }}</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem v-for="city in region.children" :key="city.value" :value="city.value">
              <span aria-hidden="true" :style="boxStyle">{{ mark(city.value) }}</span>
              <XhTreeItemText>{{ city.label }}</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
    </XhTreeRoot>
    <span>选中：{{ selected.length ? selected.join("、") : "（无）" }}</span>
  </div>
</template>
