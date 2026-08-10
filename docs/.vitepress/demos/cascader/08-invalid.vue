<!-- 校验状态 | invalid 让 trigger 报 aria-invalid、描边换成错误色；浮层照常展开，判定归宿主，这里是没选就报错 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhCascaderClearTrigger,
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderIndicator,
  XhCascaderItem,
  XhCascaderItemIndicator,
  XhCascaderItemText,
  XhCascaderLabel,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTrigger,
  XhCascaderValueText,
} from "@xihan-ui/vue";

const departments = [
  {
    value: "product",
    label: "产品线",
    children: [
      { value: "design", label: "设计组" },
      { value: "research", label: "用研组" },
    ],
  },
  {
    value: "tech",
    label: "技术线",
    children: [
      { value: "web", label: "前端组" },
      { value: "server", label: "服务端组" },
    ],
  },
];

const dept = ref<string[][]>([]);
// 校验归宿主，组件只负责把这个结论铺成属性
const invalid = computed(() => dept.value.length === 0);
</script>

<template>
  <XhCascaderRoot
    v-slot="{ levels }"
    v-model:value="dept"
    :collection="departments"
    :invalid="invalid"
    placeholder="请选到具体的组"
  >
    <XhCascaderLabel>所属部门</XhCascaderLabel>
    <XhCascaderTrigger>
      <XhCascaderValueText />
      <XhCascaderIndicator>▾</XhCascaderIndicator>
    </XhCascaderTrigger>
    <XhCascaderClearTrigger>✕</XhCascaderClearTrigger>
    <XhCascaderPositioner>
      <XhCascaderContent>
        <XhCascaderColumn v-for="lv in levels" :key="lv.level" :level="lv.level">
          <XhCascaderItem v-for="node in lv.items" :key="node.value" :value="node.value">
            <XhCascaderItemText>{{ node.label }}</XhCascaderItemText>
            <XhCascaderItemIndicator>✓</XhCascaderItemIndicator>
          </XhCascaderItem>
        </XhCascaderColumn>
      </XhCascaderContent>
    </XhCascaderPositioner>
  </XhCascaderRoot>
  <p v-if="invalid" style="color: var(--xh-fg-danger)">这一项必填</p>
</template>
