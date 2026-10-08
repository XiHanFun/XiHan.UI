var e=`<!-- 可拖动 | GridList 负责选择和行内按钮，Sortable 负责指针与键盘重排 -->
<script setup lang="ts">
import {
  XhGridListRoot,
  XhGridListRow,
  XhGridListRowActions,
  XhGridListRowContent,
  XhGridListRowText,
  XhSortableDropIndicator,
  XhSortableItem,
  XhSortableItemDragTrigger,
  XhSortableLiveRegion,
  XhSortableRoot,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const source = {
  brief: "需求梳理",
  design: "交互设计",
  build: "开发实现",
};
const ids = ref(["brief", "design", "build"]);
const rows = computed(() => ids.value.map(value => ({ value, label: source[value as keyof typeof source] })));
<\/script>

<template>
  <XhSortableRoot v-model:ids="ids">
    <XhGridListRoot :collection="rows">
      <XhSortableItem v-for="row in rows" :key="row.value" :item-id="row.value">
        <XhGridListRow :value="row.value">
          <XhGridListRowContent><XhGridListRowText>{{ row.label }}</XhGridListRowText></XhGridListRowContent>
          <XhGridListRowActions>
            <XhSortableItemDragTrigger :item-id="row.value" />
          </XhGridListRowActions>
        </XhGridListRow>
      </XhSortableItem>
    </XhGridListRoot>
    <XhSortableDropIndicator />
    <XhSortableLiveRegion />
  </XhSortableRoot>
</template>
`;export{e as default};