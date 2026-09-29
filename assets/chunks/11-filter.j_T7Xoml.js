const e=`<!-- 浮层内搜索 | searchable 在浮层顶部放一个搜索框，展开即落焦；输入即把树裁到只剩命中的那几枝，命中节点的祖先自动展开，没命中的节点带 hidden 收起；Escape 先清空检索词 -->
<script setup lang="ts">
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectEmpty,
  XhTreeSelectIndicator,
  XhTreeSelectInput,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from "@xihan-ui/vue";

const regions = [
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
  {
    value: "south",
    label: "华南",
    children: [
      { value: "gz", label: "广州" },
      { value: "sz", label: "深圳" },
    ],
  },
];
<\/script>

<template>
  <XhTreeSelectRoot :collection="regions" searchable placeholder="选一个城市">
    <XhTreeSelectLabel>投放城市</XhTreeSelectLabel>
    <XhTreeSelectControl>
      <XhTreeSelectTrigger>
        <XhTreeSelectValueText />
        <XhTreeSelectIndicator />
      </XhTreeSelectTrigger>
    </XhTreeSelectControl>
    <XhTreeSelectPositioner>
      <XhTreeSelectContent>
        <XhTreeSelectInput aria-label="搜索城市" placeholder="搜索城市" />
        <XhTreeSelectTree>
          <XhTreeSelectBranch
            v-for="region in regions"
            :key="region.value"
            :value="region.value"
          >
            <XhTreeSelectBranchControl>
              <XhTreeSelectBranchTrigger />
              <XhTreeSelectBranchText>{{ region.label }}</XhTreeSelectBranchText>
              <XhTreeSelectItemIndicator />
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem
                v-for="city in region.children"
                :key="city.value"
                :value="city.value"
              >
                <XhTreeSelectItemIndicator />
                <XhTreeSelectItemText>{{ city.label }}</XhTreeSelectItemText>
              </XhTreeSelectItem>
            </XhTreeSelectBranchContent>
          </XhTreeSelectBranch>
        </XhTreeSelectTree>
        <!-- 一个都没命中时露面 -->
        <XhTreeSelectEmpty>没有匹配的城市</XhTreeSelectEmpty>
      </XhTreeSelectContent>
    </XhTreeSelectPositioner>
  </XhTreeSelectRoot>
</template>
`;export{e as default};
