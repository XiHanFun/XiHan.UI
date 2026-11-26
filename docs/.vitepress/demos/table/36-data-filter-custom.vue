<!-- 自定义筛选面板 | 列写 filterMode: "custom"，列头上筛选那一格交给 filter 插槽：这里放一个气泡卡片，里面的文本框按关键字筛；筛选值仍是字符串数组，命中由列的 filter 判 -->
<script setup lang="ts">
import type { TableColumnDef, TableFilterValue } from "@xihan-ui/headless";
import { FilterIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
  XhTableRoot,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

interface Member {
  id: string;
  name: string;
  city: string;
}

// 筛选值是这一列的关键字（至多一项），命中由 filter 判：名字里含有它
const columns: TableColumnDef<Member>[] = [
  { id: "name", label: "姓名", filterMode: "custom", filter: (record, values) => record.name.includes(values[0] ?? "") },
  { id: "city", label: "城市", width: "7rem" },
];

const members: Member[] = [
  { id: "u1", name: "赵一帆", city: "杭州" },
  { id: "u2", name: "钱二宁", city: "上海" },
  { id: "u3", name: "孙一鸣", city: "北京" },
  { id: "u4", name: "李四海", city: "杭州" },
  { id: "u5", name: "周五洲", city: "成都" },
];

const filterValue = ref<TableFilterValue>({});
</script>

<template>
  <div style="width: 100%; max-width: 480px; display: grid; gap: 12px">
    <XhTableRoot v-model:filter-value="filterValue" :columns="columns" :data="members" aria-label="成员">
      <template #filter="{ value, setValue, label }">
        <XhPopoverRoot placement="bottom-end" size="sm">
          <!-- 名字取插槽给的 label，与内建筛选钮同一句 -->
          <XhPopoverTrigger :aria-label="label" :style="value.length ? { color: 'var(--xh-fg-brand)' } : undefined">
            <XhIcon :icon="FilterIcon" />
          </XhPopoverTrigger>
          <XhPopoverPositioner>
            <XhPopoverContent>
              <XhPopoverTitle>按关键字筛选</XhPopoverTitle>
              <XhTextFieldRoot
                aria-label="姓名关键字"
                placeholder="输入姓名里的字"
                clearable
                :value="value[0] ?? ''"
                @value-change="(details) => setValue(details.value ? [details.value] : [])"
              />
            </XhPopoverContent>
          </XhPopoverPositioner>
        </XhPopoverRoot>
      </template>
    </XhTableRoot>
    <span data-demo-output>关键字：{{ filterValue.name?.[0] ?? "（无）" }}</span>
  </div>
</template>
