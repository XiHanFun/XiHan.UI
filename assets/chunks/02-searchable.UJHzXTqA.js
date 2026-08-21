const e=`<!-- 搜索过滤 | searchable 给每侧配一个搜索框，筛剩下的才参与方向键、全选与搬运 -->
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
  XhTransferSelectAllTrigger,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
} from "@xihan-ui/vue";

const items = [
  { value: "beijing", label: "北京" },
  { value: "shanghai", label: "上海" },
  { value: "guangzhou", label: "广州" },
  { value: "shenzhen", label: "深圳" },
  { value: "hangzhou", label: "杭州" },
  { value: "chengdu", label: "成都" },
  { value: "wuhan", label: "武汉" },
  { value: "xian", label: "西安" },
];

const value = ref<string[]>([]);

// 默认按标签大小写不敏感包含匹配，这里换成同时认拼音代号
function filter(item: { value: string; label: string }, query: string) {
  const q = query.toLowerCase();
  return item.label.includes(query) || item.value.includes(q);
}
<\/script>

<template>
  <div style="inline-size: 100%; max-inline-size: 520px">
    <XhTransferRoot
      v-model:value="value"
      :collection="items"
      :filter="filter"
      searchable
    >
      <XhTransferSourcePanel>
        <XhTransferPanelHeader>
          <!-- 搜索框没有可见标签，借本侧标题当可及名字，标题因此不能省 -->
          <XhTransferPanelTitle>待选城市</XhTransferPanelTitle>
          <XhTransferPanelCount />
          <XhTransferSelectAllTrigger>全选</XhTransferSelectAllTrigger>
        </XhTransferPanelHeader>
        <XhTransferSearch placeholder="搜索，也认 beijing" />
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

      <XhTransferToTargetTrigger>›</XhTransferToTargetTrigger>
      <XhTransferToSourceTrigger>‹</XhTransferToSourceTrigger>

      <XhTransferTargetPanel>
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>已选城市</XhTransferPanelTitle>
          <XhTransferPanelCount />
          <XhTransferSelectAllTrigger>全选</XhTransferSelectAllTrigger>
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
</template>
`;export{e as default};
