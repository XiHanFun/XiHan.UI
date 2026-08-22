<!-- 清空按钮 | 清空钮是触发器的兄弟节点，一起收在 control 里并排（Vue 的 collection 自动渲染加 clearable 即带上它）；有选中才出现、出现即顶替下拉箭头，不占 Tab 位（键盘清空走 Delete / Backspace）；点按清空全部选中、不展开浮层，焦点回到触发器；可及名走 translations.clearTrigger -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhSelectClearTrigger,
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";

const teams = [
  { value: "design", label: "设计组" },
  { value: "frontend", label: "前端组" },
  { value: "server", label: "服务端组" },
];

const picked = ref<string[]>(["design"]);
const auto = ref<string[]>(["frontend"]);
</script>

<template>
  <XhSelectRoot
    v-model:value="picked"
    :translations="{ clearTrigger: '清空所选' }"
    placeholder="选一个组"
    style="inline-size: 240px"
  >
    <XhSelectLabel>所属小组</XhSelectLabel>
    <XhSelectControl>
      <XhSelectTrigger>
        <XhSelectValueText />
        <XhSelectIndicator />
      </XhSelectTrigger>
      <XhSelectClearTrigger />
    </XhSelectControl>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectList>
          <XhSelectItem v-for="t in teams" :key="t.value" :value="t.value">
            <XhSelectItemText>{{ t.label }}</XhSelectItemText>
            <XhSelectItemIndicator />
          </XhSelectItem>
        </XhSelectList>
      </XhSelectContent>
    </XhSelectPositioner>
  </XhSelectRoot>
  <p style="margin: 8px 0 0; font-size: 13px">选中：{{ picked.length ? picked.join(", ") : "（空）" }}</p>
  <XhSelectRoot
    v-model:value="auto"
    :collection="teams"
    :translations="{ clearTrigger: '清空所选' }"
    clearable
    label="所属小组（自动渲染）"
    placeholder="选一个组"
    style="margin-top: 16px; inline-size: 240px"
  />
  <p style="margin: 8px 0 0; font-size: 13px">选中：{{ auto.length ? auto.join(", ") : "（空）" }}</p>
</template>
