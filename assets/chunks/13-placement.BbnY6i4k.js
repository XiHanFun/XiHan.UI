const n=`<!-- 标签栏摆在哪一边 | root 按书写顺序渲染子节点：把面板写在 list 前面，标签栏就落到内容之后，基线换到另一边 -->
<script setup lang="ts">
import {
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";

const tabs = [
  { value: "overview", label: "概览" },
  { value: "usage", label: "用法" },
  { value: "api", label: "API" },
];
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px; inline-size: 100%">
    <div>
      <div style="margin-block-end: 8px; font-size: 12px">标签在下</div>
      <XhTabsRoot default-value="overview" style="inline-size: 100%">
        <XhTabsContent v-for="t in tabs" :key="t.value" :value="t.value">
          {{ t.label }} 的面板
        </XhTabsContent>
        <!-- 基线跟着换边：横排的基线在 list 底边，标签在下就把它挪到顶边 -->
        <XhTabsList
          style="
            border-block-end: 0;
            border-block-start: var(--xh-stroke-thin) solid var(--xh-border-default);
          "
        >
          <XhTabsTrigger v-for="t in tabs" :key="t.value" :value="t.value">
            {{ t.label }}
          </XhTabsTrigger>
        </XhTabsList>
      </XhTabsRoot>
    </div>

    <div>
      <div style="margin-block-end: 8px; font-size: 12px">标签在右</div>
      <XhTabsRoot
        default-value="overview"
        orientation="vertical"
        style="inline-size: 100%"
      >
        <XhTabsContent
          v-for="t in tabs"
          :key="t.value"
          :value="t.value"
          style="flex: 1"
        >
          {{ t.label }} 的面板
        </XhTabsContent>
        <XhTabsList
          style="
            border-inline-end: 0;
            border-inline-start: var(--xh-stroke-thin) solid var(--xh-border-default);
          "
        >
          <XhTabsTrigger v-for="t in tabs" :key="t.value" :value="t.value">
            {{ t.label }}
          </XhTabsTrigger>
        </XhTabsList>
      </XhTabsRoot>
    </div>
  </div>
</template>
`;export{n as default};
