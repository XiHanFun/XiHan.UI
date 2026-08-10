<!-- 勾选与回显策略 | 多选下选中值受控：宿主收到朴素切换后算出级联集合写回，触发框里的文本也由宿主按「整组选满只报组名」折叠 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from "@xihan-ui/vue";

const collection = [
  {
    value: "user",
    label: "用户管理",
    children: [
      { value: "user:view", label: "查看" },
      { value: "user:edit", label: "编辑" },
      { value: "user:del", label: "删除" },
    ],
  },
  {
    value: "order",
    label: "订单管理",
    children: [
      { value: "order:view", label: "查看" },
      { value: "order:export", label: "导出" },
    ],
  },
];

const childrenOf = new Map<string, string[]>();
const parentOf = new Map<string, string>();
for (const group of collection) {
  childrenOf.set(
    group.value,
    group.children.map((item) => item.value)
  );
  for (const item of group.children) parentOf.set(item.value, group.value);
}

const value = ref<string[]>(["user:view"]);

// 机器给的是「这一下切了谁」的朴素结果，宿主据此把整组与父级一并改写
function onValueChange(details: { value: string[] }): void {
  const prev = new Set(value.value);
  const toggled =
    details.value.find((v) => !prev.has(v)) ??
    value.value.find((v) => !details.value.includes(v));
  if (toggled == null) return;

  const on = !prev.has(toggled);
  const next = new Set(prev);
  for (const v of [toggled, ...(childrenOf.get(toggled) ?? [])]) {
    if (on) next.add(v);
    else next.delete(v);
  }

  const parent = parentOf.get(toggled);
  if (parent) {
    const kids = childrenOf.get(parent) ?? [];
    if (kids.every((k) => next.has(k))) next.add(parent);
    else next.delete(parent);
  }

  value.value = [...next];
}

// 整组选满只报组名，否则逐条报「组名 / 条目」
const summary = computed(() => {
  const picked = new Set(value.value);
  const parts: string[] = [];
  for (const group of collection) {
    const kids = childrenOf.get(group.value) ?? [];
    if (kids.length > 0 && kids.every((k) => picked.has(k))) {
      parts.push(group.label);
      continue;
    }
    for (const item of group.children) {
      if (picked.has(item.value)) parts.push(`${group.label} / ${item.label}`);
    }
  }
  return parts.join("、");
});

function mark(target: string): string {
  if (value.value.includes(target)) return "✓";
  const kids = childrenOf.get(target) ?? [];
  return kids.some((k) => value.value.includes(k)) ? "–" : "";
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
  <XhTreeSelectRoot
    :collection="collection"
    :value="value"
    :default-expanded-value="['user', 'order']"
    multiple
    style="max-inline-size: 340px"
    @value-change="onValueChange"
  >
    <XhTreeSelectLabel>权限</XhTreeSelectLabel>
    <XhTreeSelectTrigger>
      <!-- 写了插槽就归作者：折叠后的文本从这里给 -->
      <XhTreeSelectValueText>{{ summary || "选择权限" }}</XhTreeSelectValueText>
      <XhTreeSelectIndicator>▾</XhTreeSelectIndicator>
    </XhTreeSelectTrigger>
    <XhTreeSelectPositioner>
      <XhTreeSelectContent>
        <XhTreeSelectTree>
          <XhTreeSelectBranch
            v-for="group in collection"
            :key="group.value"
            :value="group.value"
          >
            <XhTreeSelectBranchControl>
              <XhTreeSelectBranchTrigger>▸</XhTreeSelectBranchTrigger>
              <span aria-hidden="true" :style="boxStyle">{{ mark(group.value) }}</span>
              <XhTreeSelectBranchText>{{ group.label }}</XhTreeSelectBranchText>
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem
                v-for="item in group.children"
                :key="item.value"
                :value="item.value"
              >
                <span aria-hidden="true" :style="boxStyle">{{ mark(item.value) }}</span>
                <XhTreeSelectItemText>{{ item.label }}</XhTreeSelectItemText>
              </XhTreeSelectItem>
            </XhTreeSelectBranchContent>
          </XhTreeSelectBranch>
        </XhTreeSelectTree>
      </XhTreeSelectContent>
    </XhTreeSelectPositioner>
  </XhTreeSelectRoot>
  <p>选中值：{{ value.length ? value.join("、") : "（无）" }}</p>
</template>
