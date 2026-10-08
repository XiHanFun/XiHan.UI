var e=`<!-- 分页 | page-size 让每侧只渲染当前这一页，两侧各翻各的；翻页器用分页组件拼进面板，页码、页数与条数取自面板插槽。全选、计数与搬运仍按整侧算，搜索串一变回到第 1 页 -->
<script setup lang="ts">
import {
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelCount,
  XhTransferPanelHeader,
  XhTransferPanelTitle,
  XhTransferRoot,
  XhTransferSearch,
  XhTransferSelectAllTrigger,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const PAGE_SIZE = 6;

const items = Array.from({ length: 40 }, (_, i) => ({
  value: \`member-\${i + 1}\`,
  label: \`成员 \${String(i + 1).padStart(2, "0")}\`,
}));

const value = ref<string[]>([]);
<\/script>

<template>
  <div style="inline-size: 100%; max-inline-size: 560px">
    <XhTransferRoot v-model:value="value" :collection="items" :page-size="PAGE_SIZE" searchable>
      <XhTransferSourcePanel v-slot="{ items: shown, page, pageCount, total, setPage }">
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>全部成员</XhTransferPanelTitle>
          <XhTransferSelectAllTrigger>全选</XhTransferSelectAllTrigger>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferSearch placeholder="搜索成员" />
        <XhTransferList>
          <XhTransferItem v-for="item in shown" :key="item.value" :value="item.value">
            <XhTransferItemCheckbox />
            <XhTransferItemText>{{ item.label }}</XhTransferItemText>
          </XhTransferItem>
        </XhTransferList>
        <XhPaginationRoot :page="page" :count="total" :page-size="PAGE_SIZE" size="sm" @page-change="setPage($event.page)">
          <XhPaginationPrevTrigger />
          <span>{{ page }} / {{ pageCount }}</span>
          <XhPaginationNextTrigger />
        </XhPaginationRoot>
      </XhTransferSourcePanel>

      <XhTransferToTargetTrigger />
      <XhTransferToSourceTrigger />

      <XhTransferTargetPanel v-slot="{ items: shown, page, pageCount, total, setPage }">
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>项目成员</XhTransferPanelTitle>
          <XhTransferSelectAllTrigger>全选</XhTransferSelectAllTrigger>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferSearch placeholder="搜索成员" />
        <XhTransferList>
          <XhTransferItem v-for="item in shown" :key="item.value" :value="item.value">
            <XhTransferItemCheckbox />
            <XhTransferItemText>{{ item.label }}</XhTransferItemText>
          </XhTransferItem>
        </XhTransferList>
        <XhPaginationRoot :page="page" :count="total" :page-size="PAGE_SIZE" size="sm" @page-change="setPage($event.page)">
          <XhPaginationPrevTrigger />
          <span>{{ page }} / {{ pageCount }}</span>
          <XhPaginationNextTrigger />
        </XhPaginationRoot>
      </XhTransferTargetPanel>
    </XhTransferRoot>
  </div>
</template>
`;export{e as default};