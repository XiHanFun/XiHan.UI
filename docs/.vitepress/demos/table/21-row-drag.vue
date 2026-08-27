<!-- 拖拽换行位 | 整行都是拖动源，按住拖到别处松手；也可以 Tab 进表体后按 Alt + 上下键挪。库只报新行序，写回归使用者 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";

const columns = [
  { id: "step", label: "序号", width: "4rem" },
  { id: "name", label: "环节", width: "10rem" },
  { id: "owner", label: "负责人" },
];

const steps = ref([
  { id: "s1", name: "需求评审", owner: "赵一" },
  { id: "s2", name: "方案设计", owner: "钱二" },
  { id: "s3", name: "开发实现", owner: "孙三" },
  { id: "s4", name: "测试验收", owner: "李四" },
  { id: "s5", name: "发布上线", owner: "周五" },
]);

// 行序的主人是这份数组，跟着它走
const rows = computed(() => steps.value.map((s) => ({ id: s.id })));

// details.ids 是已经重排好的整份行序，照它取一遍就是新数组
const onRowMove = (details: { id: string; from: number; to: number; ids: string[] }) => {
  const byId = new Map(steps.value.map((s) => [s.id, s]));
  steps.value = details.ids.flatMap((id) => byId.get(id) ?? []);
};
</script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
    <XhTableRoot
      :columns="columns"
      :rows="rows"
      row-reorderable
      @row-move="onRowMove"
    >
      <XhTableCaption>
        按住任意一行拖动换位，落点画在两行之间；也可以 Tab 进表体，用 Alt + 上下键挪
      </XhTableCaption>
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader value="step">序号</XhTableColumnHeader>
          <XhTableColumnHeader value="name">环节</XhTableColumnHeader>
          <XhTableColumnHeader value="owner">负责人</XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="(s, i) in steps" :key="s.id" :value="s.id">
          <XhTableCell value="step">{{ i + 1 }}</XhTableCell>
          <XhTableCell value="name">{{ s.name }}</XhTableCell>
          <XhTableCell value="owner">{{ s.owner }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span>当前顺序：{{ steps.map((s) => s.name).join(" → ") }}</span>
  </div>
</template>
