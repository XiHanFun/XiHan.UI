const e=`<!-- 受控 | 选中值与展开态都由外部持有：组件只发意图，写不写回由你决定 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhButton,
  XhPopselectContent,
  XhPopselectPositioner,
  XhPopselectRoot,
  XhPopselectTrigger,
} from "@xihan-ui/vue";

const levels = [
  { value: "low", label: "低" },
  { value: "normal", label: "中" },
  { value: "high", label: "高" },
];

const picked = ref<string[]>(["normal"]);
const open = ref(false);
const label = computed(() => levels.find((l) => l.value === picked.value[0])?.label ?? "未设置");
<\/script>

<template>
  <XhPopselectRoot
    v-model:value="picked"
    v-model:open="open"
    :collection="levels"
    placement="bottom-start"
  >
    <XhPopselectTrigger>优先级：{{ label }}</XhPopselectTrigger>
    <XhPopselectPositioner>
      <XhPopselectContent />
    </XhPopselectPositioner>
  </XhPopselectRoot>
  <p>
    <XhButton variant="ghost" size="sm" @click="open = !open">从外部开合</XhButton>
    <XhButton variant="ghost" size="sm" @click="picked = ['high']">从外部设为「高」</XhButton>
  </p>
  <p>展开：{{ open ? "是" : "否" }}；当前值：{{ picked.join("、") || "（未选）" }}</p>
</template>
`;export{e as default};
