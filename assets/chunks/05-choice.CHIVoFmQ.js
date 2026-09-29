const e=`<!-- 菜单栏设置 | checkbox 与 radio 的值独立于当前展开菜单 -->
<script setup lang="ts">
import type { MenubarNode } from "@xihan-ui/headless";
import { XhMenubarRoot } from "@xihan-ui/vue";

const collection: MenubarNode[] = [{
  value: "view",
  label: "视图",
  items: [
    { value: "status", label: "状态栏", kind: "checkbox" },
    { value: "comfortable", label: "宽松", kind: "radio", group: "density", groupLabel: "密度" },
    { value: "compact", label: "紧凑", kind: "radio", group: "density" },
  ],
}];
<\/script>

<template>
  <XhMenubarRoot
    :collection="collection"
    :default-checkbox-value="['status']"
    :default-radio-value="{ density: 'comfortable' }"
  />
</template>
`;export{e as default};
