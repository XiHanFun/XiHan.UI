const e=`<!-- 语气与尺寸 | tone 换勾选标记的色族，size 换条目行与勾选格的几何档；两轴打在根上，两侧面板一起走 -->
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
  { value: "update", label: "编辑" },
];

const rows = [
  { tone: "success", size: "md", label: "success" },
  { tone: "danger", size: "md", label: "danger" },
  { tone: "brand", size: "sm", label: "sm" },
  { tone: "brand", size: "lg", label: "lg" },
];
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-inline-size: 520px">
    <XhTransferRoot
      v-for="row in rows"
      :key="row.label"
      :collection="items"
      :default-value="['read']"
      :tone="row.tone"
      :size="row.size"
    >
      <XhTransferSourcePanel>
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>待选 · {{ row.label }}</XhTransferPanelTitle>
        </XhTransferPanelHeader>
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
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>已选</XhTransferPanelTitle>
        </XhTransferPanelHeader>
        <XhTransferList>
          <XhTransferItem v-for="item in items" :key="item.value" :value="item.value">
            <XhTransferItemCheckbox />
            <XhTransferItemText>{{ item.label }}</XhTransferItemText>
          </XhTransferItem>
        </XhTransferList>
      </XhTransferTargetPanel>
    </XhTransferRoot>
  </div>
</template>
`;export{e as default};
