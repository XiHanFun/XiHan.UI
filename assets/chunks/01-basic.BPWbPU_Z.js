const e=`<!-- 基础用法 | 在触发区上右键（触摸端长按），菜单钉在按下去的那一点上 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhContextMenuRoot } from "@xihan-ui/vue";

const commands = [
  { value: "copy", label: "复制" },
  { value: "paste", label: "粘贴", disabled: true },
  { value: "rename", label: "重命名" },
  { value: "delete", label: "删除", separatorBefore: true },
];

const picked = ref("");

function onSelect(details: { value: string }): void {
  picked.value = details.value;
}
<\/script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px">
    <XhContextMenuRoot :collection="commands" @select="onSelect">
      <!-- 触发区的尺寸与排布归作者，皮肤只管它的交互观感 -->
      <template #trigger>
        <span style="display: grid; place-items: center; min-block-size: 120px">
          在这块区域上右键
        </span>
      </template>
    </XhContextMenuRoot>

    <span>最近选中：{{ picked || "（无）" }}</span>
  </div>
</template>
`;export{e as default};
