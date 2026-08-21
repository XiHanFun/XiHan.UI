<!-- 列表分组 | 面板插槽给出本侧此刻看得见的条目，据此分组渲染；小标题是普通节点，不入方向键也不入搬运 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelCount,
  XhTransferPanelHeader,
  XhTransferPanelTitle,
  XhTransferRoot,
  XhTransferSearch,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
} from "@xihan-ui/vue";

const groups = [
  { key: "read", label: "读取" },
  { key: "write", label: "写入" },
  { key: "admin", label: "管理" },
];

const permissions = [
  { value: "list", label: "查看列表", group: "read" },
  { value: "detail", label: "查看详情", group: "read" },
  { value: "export", label: "导出数据", group: "read" },
  { value: "create", label: "新建", group: "write" },
  { value: "update", label: "编辑", group: "write" },
  { value: "remove", label: "删除", group: "write" },
  { value: "grant", label: "授权", group: "admin" },
  { value: "audit", label: "审计", group: "admin" },
];

// 面板插槽给的条目只带 value / label，分组信息回自己那份数据里查
function inGroup(
  list: readonly { value: string; label: string }[],
  group: string,
): { value: string; label: string }[] {
  return list.filter((item) =>
    permissions.some((p) => p.value === item.value && p.group === group),
  );
}

const value = ref<string[]>(["list"]);
</script>

<template>
  <div style="inline-size: 100%; max-inline-size: 520px">
    <XhTransferRoot v-model:value="value" :collection="permissions" searchable>
      <XhTransferSourcePanel v-slot="{ items }">
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>可授予</XhTransferPanelTitle>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferSearch placeholder="搜索" />
        <XhTransferList>
          <template v-for="g in groups" :key="g.key">
            <div
              v-if="inGroup(items, g.key).length"
              style="
                padding-block: 4px;
                padding-inline: 8px;
                color: var(--xh-fg-subtle);
                font-size: 12px;
              "
            >
              {{ g.label }}
            </div>
            <XhTransferItem
              v-for="item in inGroup(items, g.key)"
              :key="item.value"
              :value="item.value"
            >
              <XhTransferItemCheckbox />
              <XhTransferItemText>{{ item.label }}</XhTransferItemText>
            </XhTransferItem>
          </template>
        </XhTransferList>
      </XhTransferSourcePanel>

      <XhTransferToTargetTrigger />
      <XhTransferToSourceTrigger />

      <XhTransferTargetPanel v-slot="{ items }">
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>已授予</XhTransferPanelTitle>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferSearch placeholder="搜索" />
        <XhTransferList>
          <template v-for="g in groups" :key="g.key">
            <div
              v-if="inGroup(items, g.key).length"
              style="
                padding-block: 4px;
                padding-inline: 8px;
                color: var(--xh-fg-subtle);
                font-size: 12px;
              "
            >
              {{ g.label }}
            </div>
            <XhTransferItem
              v-for="item in inGroup(items, g.key)"
              :key="item.value"
              :value="item.value"
            >
              <XhTransferItemCheckbox />
              <XhTransferItemText>{{ item.label }}</XhTransferItemText>
            </XhTransferItem>
          </template>
        </XhTransferList>
      </XhTransferTargetPanel>
    </XhTransferRoot>
  </div>
</template>
