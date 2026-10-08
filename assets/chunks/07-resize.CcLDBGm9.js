var e=`<!-- 调整厚度 | resizable 在朝向页面的那条边上放一根把手：拖动或用方向键推，厚度夹在 minPanelSize 与 maxPanelSize 之间；受控的 panelSize 读写当前厚度 -->
<script setup lang="ts">
import {
  XhButton,
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerResizeTrigger,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const panelSize = ref<number>();
<\/script>

<template>
  <XhDrawerRoot
    v-slot="{ setOpen }"
    v-model:panel-size="panelSize"
    resizable
    :min-panel-size="260"
    :max-panel-size="560"
    :translations="{ close: '关闭', resizeTrigger: '调整抽屉宽度' }"
  >
    <XhDrawerTrigger>打开可调宽的抽屉</XhDrawerTrigger>
    <XhDrawerContent>
      <XhDrawerTitle>字段设置</XhDrawerTitle>
      <XhDrawerDescription>拖面板左边缘，或聚焦把手后按方向键；Home / End 推到最窄与最宽。</XhDrawerDescription>
      <p style="margin: 0; color: var(--xh-fg-muted)">当前厚度：{{ panelSize ? \`\${panelSize} px\` : "默认" }}</p>
      <XhButton variant="solid" @click="setOpen(false)">关闭</XhButton>
      <XhDrawerCloseTrigger />
      <XhDrawerResizeTrigger />
    </XhDrawerContent>
  </XhDrawerRoot>
</template>
`;export{e as default};