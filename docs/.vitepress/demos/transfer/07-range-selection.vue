<!-- 范围选 | 按住 Shift 点某一项，选中锚点到它那一段；锚点跨到另一侧时退化成普通勾选 -->
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
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
} from "@xihan-ui/vue";

const items = [
  { value: "read", label: "查看" },
  { value: "create", label: "新建" },
  { value: "update", label: "编辑" },
  { value: "delete", label: "删除" },
  { value: "export", label: "导出" },
  { value: "audit", label: "审计" },
];

const value = ref<string[]>(["read"]);
</script>

<template>
  <div style="inline-size: 100%; max-inline-size: 520px">
    <p style="margin-block-end: 12px; color: var(--xh-fg-muted)">
      点左侧第一项，再<strong>按住 Shift</strong> 点更下面的一项 —— 中间整段一起勾上。
      两侧是各自独立的列表，锚点跨到另一侧时退化成普通勾选。
    </p>
    <XhTransferRoot v-model:value="value" :collection="items">
      <XhTransferSourcePanel>
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>待选权限</XhTransferPanelTitle>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferList>
          <!-- 两侧各挂一份全集，不属于本侧的那一份由组件打上 hidden，不卸载节点 -->
          <XhTransferItem
            v-for="item in items"
            :key="item.value"
            :value="item.value"
          >
            <XhTransferItemCheckbox />
            <XhTransferItemText>{{ item.label }}</XhTransferItemText>
          </XhTransferItem>
        </XhTransferList>
      </XhTransferSourcePanel>

      <XhTransferToTargetTrigger />
      <XhTransferToSourceTrigger />

      <XhTransferTargetPanel>
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>已选权限</XhTransferPanelTitle>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferList>
          <XhTransferItem
            v-for="item in items"
            :key="item.value"
            :value="item.value"
          >
            <XhTransferItemCheckbox />
            <XhTransferItemText>{{ item.label }}</XhTransferItemText>
          </XhTransferItem>
        </XhTransferList>
      </XhTransferTargetPanel>
    </XhTransferRoot>

    <p style="margin-block-start: 12px; font-size: 13px">
      已选：{{ value.length ? value.join("、") : "（无）" }}
    </p>
  </div>
</template>
