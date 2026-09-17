<script setup lang="ts">
import {
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
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
  { value: "delete", label: "删除" },
];
</script>

<template>
  <XhTransferRoot :default-value="['read']" :collection="items" style="inline-size: var(--xh-doc-catalog-w); --xh-transfer-list-h: 64px">
    <XhTransferSourcePanel>
      <XhTransferPanelHeader><XhTransferPanelTitle>待选</XhTransferPanelTitle></XhTransferPanelHeader>
      <XhTransferList>
        <XhTransferItem v-for="item in items" :key="item.value" :value="item.value">
          <XhTransferItemCheckbox />
          <XhTransferItemText>{{ item.label }}</XhTransferItemText>
        </XhTransferItem>
      </XhTransferList>
    </XhTransferSourcePanel>
    <XhTransferToTargetTrigger />
    <XhTransferToSourceTrigger />
    <XhTransferTargetPanel>
      <XhTransferPanelHeader><XhTransferPanelTitle>已选</XhTransferPanelTitle></XhTransferPanelHeader>
      <XhTransferList>
        <XhTransferItem v-for="item in items" :key="item.value" :value="item.value">
          <XhTransferItemCheckbox />
          <XhTransferItemText>{{ item.label }}</XhTransferItemText>
        </XhTransferItem>
      </XhTransferList>
    </XhTransferTargetPanel>
  </XhTransferRoot>
</template>
