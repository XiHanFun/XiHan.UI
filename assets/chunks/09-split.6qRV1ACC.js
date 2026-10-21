var e=`<!-- 分体按钮 | 主操作旁接一个下拉菜单 -->
<script setup lang="ts">
import { ChevronDownIcon } from "@xihan-ui/icons";
import { XhButton, XhButtonGroup, XhIcon, XhMenuRoot } from "@xihan-ui/vue";

const more = [
  { value: "save-as", label: "另存为" },
  { value: "save-template", label: "存为模板" },
  { value: "save-copy", label: "保存副本" },
];
<\/script>

<template>
  <XhButtonGroup variant="solid">
    <XhButton>保存</XhButton>
    <XhMenuRoot :collection="more" placement="bottom-end" trigger-as-child>
      <template #trigger>
        <XhButton icon-only aria-label="更多保存方式">
          <XhIcon :icon="ChevronDownIcon" />
        </XhButton>
      </template>
    </XhMenuRoot>
  </XhButtonGroup>
</template>
`;export{e as default};