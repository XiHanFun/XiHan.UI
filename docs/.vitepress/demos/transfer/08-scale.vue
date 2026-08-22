<!-- 整块换档 | 面板高度、表头、条目行、勾选格与搬运按钮各是一个令牌，写在根上整块一起换档 -->
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

const items = [
  { value: "read", label: "查看" },
  { value: "create", label: "新建" },
  { value: "update", label: "编辑" },
  { value: "delete", label: "删除" },
  { value: "export", label: "导出" },
  { value: "audit", label: "审计" },
];

// 一档尺寸就是一组令牌：两栏间距、面板高度、表头、搜索框、条目、勾选格与搬运按钮
const compact =
  "--xh-transfer-gap: 8px; --xh-transfer-list-h: 7rem; --xh-transfer-header-py: 2px; --xh-transfer-title-font-size: 12px; --xh-transfer-search-h: 26px; --xh-transfer-search-font-size: 12px; --xh-transfer-item-py: 1px; --xh-transfer-item-font-size: 12px; --xh-transfer-checkbox-size: 13px; --xh-transfer-checkbox-font-size: 10px; --xh-transfer-trigger-size: 22px; --xh-transfer-trigger-font-size: 12px";
const roomy =
  "--xh-transfer-gap: 20px; --xh-transfer-list-h: 14rem; --xh-transfer-header-py: 10px; --xh-transfer-title-font-size: 16px; --xh-transfer-search-h: 40px; --xh-transfer-search-font-size: 16px; --xh-transfer-item-py: 6px; --xh-transfer-item-font-size: 16px; --xh-transfer-checkbox-size: 20px; --xh-transfer-checkbox-font-size: 14px; --xh-transfer-trigger-size: 36px; --xh-transfer-trigger-font-size: 16px";

const tight = ref<string[]>(["read"]);
const loose = ref<string[]>(["read"]);
</script>

<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      gap: 24px;
      inline-size: 100%;
      max-inline-size: 520px;
    "
  >
    <div>
      <p style="margin-block-end: 8px; font-size: 13px">紧凑</p>
      <XhTransferRoot v-model:value="tight" :collection="items" searchable :style="compact">
        <XhTransferSourcePanel>
          <XhTransferPanelHeader>
            <XhTransferPanelTitle>待选权限</XhTransferPanelTitle>
            <XhTransferPanelCount />
          </XhTransferPanelHeader>
          <XhTransferSearch placeholder="搜索" />
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
        </XhTransferSourcePanel>

        <XhTransferToTargetTrigger />
        <XhTransferToSourceTrigger />

        <XhTransferTargetPanel>
          <XhTransferPanelHeader>
            <XhTransferPanelTitle>已选权限</XhTransferPanelTitle>
            <XhTransferPanelCount />
          </XhTransferPanelHeader>
          <XhTransferSearch placeholder="搜索" />
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
    </div>

    <div>
      <p style="margin-block-end: 8px; font-size: 13px">宽松</p>
      <XhTransferRoot v-model:value="loose" :collection="items" searchable :style="roomy">
        <XhTransferSourcePanel>
          <XhTransferPanelHeader>
            <XhTransferPanelTitle>待选权限</XhTransferPanelTitle>
            <XhTransferPanelCount />
          </XhTransferPanelHeader>
          <XhTransferSearch placeholder="搜索" />
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
        </XhTransferSourcePanel>

        <XhTransferToTargetTrigger />
        <XhTransferToSourceTrigger />

        <XhTransferTargetPanel>
          <XhTransferPanelHeader>
            <XhTransferPanelTitle>已选权限</XhTransferPanelTitle>
            <XhTransferPanelCount />
          </XhTransferPanelHeader>
          <XhTransferSearch placeholder="搜索" />
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
    </div>
  </div>
</template>
