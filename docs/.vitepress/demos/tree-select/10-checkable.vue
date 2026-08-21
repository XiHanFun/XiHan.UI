<!-- 级联勾选与回显策略 | multiple 加 cascade 内建父子传导：点分支整枝勾上、子全勾父勾、部分勾中半选；对外值按 checked-strategy 收敛，parent 档整组选满只报组名 -->
<script setup lang="ts">
import { CheckIcon, MinusIcon } from "@xihan-ui/icons";
import { ref } from "vue";
import {
  XhIcon,
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

const value = ref<string[]>(["user:view"]);

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
    v-slot="{ isSelected, isIndeterminate }"
    v-model:value="value"
    :collection="collection"
    :default-expanded-value="['user', 'order']"
    multiple
    cascade
    checked-strategy="parent"
    style="max-inline-size: 340px"
  >
    <XhTreeSelectLabel>权限</XhTreeSelectLabel>
    <XhTreeSelectTrigger>
      <!-- parent 收敛下整组选满值就是组名，缺省显示文本直接可用 -->
      <XhTreeSelectValueText />
      <XhTreeSelectIndicator />
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
              <XhTreeSelectBranchTrigger />
              <span aria-hidden="true" :style="boxStyle">
                <XhIcon v-if="isSelected(group.value)" :icon="CheckIcon" />
                <XhIcon v-else-if="isIndeterminate(group.value)" :icon="MinusIcon" />
              </span>
              <XhTreeSelectBranchText>{{ group.label }}</XhTreeSelectBranchText>
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem
                v-for="item in group.children"
                :key="item.value"
                :value="item.value"
              >
                <span aria-hidden="true" :style="boxStyle">
                  <XhIcon v-if="isSelected(item.value)" :icon="CheckIcon" />
                </span>
                <XhTreeSelectItemText>{{ item.label }}</XhTreeSelectItemText>
              </XhTreeSelectItem>
            </XhTreeSelectBranchContent>
          </XhTreeSelectBranch>
        </XhTreeSelectTree>
      </XhTreeSelectContent>
    </XhTreeSelectPositioner>
  </XhTreeSelectRoot>
  <p>对外值（parent 收敛）：{{ value.length ? value.join("、") : "（无）" }}</p>
</template>
