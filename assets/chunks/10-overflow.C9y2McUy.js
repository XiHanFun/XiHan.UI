var e=`<!-- 更多下拉 | 标签带放不下时，行尾的更多按钮列出可见区外的标签，选中即切过去 -->
<script setup lang="ts">
import {
  XhTabsContent,
  XhTabsIndicator,
  XhTabsList,
  XhTabsOverflowTrigger,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";

const branches = [
  "北京",
  "上海",
  "广州",
  "深圳",
  "杭州",
  "成都",
  "武汉",
  "西安",
  "南京",
  "重庆",
];
<\/script>

<template>
  <XhTabsRoot default-value="北京" style="inline-size: 360px; max-inline-size: 100%">
    <XhTabsList aria-label="分公司">
      <XhTabsTrigger v-for="branch in branches" :key="branch" :value="branch">{{ branch }}分公司</XhTabsTrigger>
      <XhTabsIndicator />
    </XhTabsList>
    <XhTabsOverflowTrigger />

    <XhTabsContent v-for="branch in branches" :key="branch" :value="branch">{{ branch }}分公司的本月业绩。</XhTabsContent>
  </XhTabsRoot>
</template>
`;export{e as default};