var e=`<!-- 表格排布 | layout="table" 时表头与各行共用一套列宽；columns 定列序与列宽，列头留空即显示这一列的 label -->
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
  XhFieldArrayAddTrigger,
  XhFieldArrayColumnHeader,
  XhFieldArrayHeader,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemCell,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayItemLabel,
  XhFieldArrayRoot,
  XhFieldArrayTable,
  XhNumberFieldControl,
  XhNumberFieldInput,
  XhNumberFieldRoot,
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/vue";

interface Expense {
  date: string;
  category: string;
  amount: string;
  note: string;
}

const columns = [
  { id: "date", label: "日期", width: "10rem" },
  { id: "category", label: "类别", width: "8rem" },
  { id: "amount", label: "金额", width: "8rem" },
  { id: "note", label: "备注" },
];

const categories = [
  { value: "travel", label: "差旅" },
  { value: "meal", label: "餐饮" },
  { value: "office", label: "办公" },
];

const expenses: Expense[] = [
  { date: "2026-10-12", category: "travel", amount: "860", note: "往返高铁" },
  { date: "2026-10-13", category: "meal", amount: "128", note: "" },
];
<\/script>

<template>
  <XhFieldArrayRoot
    v-slot="{ items }"
    layout="table"
    :columns="columns"
    :default-value="expenses"
    :create-item="() => ({ date: '', category: '', amount: '', note: '' })"
    style="inline-size: 100%"
  >
    <XhFieldArrayTable aria-label="费用明细">
      <XhFieldArrayHeader>
        <XhFieldArrayColumnHeader v-for="column in columns" :key="column.id" :value="column.id" />
      </XhFieldArrayHeader>
      <XhFieldArrayItem v-for="row in items" :key="row.key" :index="row.index">
        <XhFieldArrayItemLabel>{{ row.index + 1 }}</XhFieldArrayItemLabel>
        <XhFieldArrayItemCell value="date">
          <XhDateFieldRoot :default-value="row.value.date || undefined" locale="zh-CN">
            <XhDateFieldControl :aria-label="\`第 \${row.index + 1} 笔日期\`">
              <XhDateFieldSegmentGroup>
                <XhDateFieldSegment :index="0" />
                <span>/</span>
                <XhDateFieldSegment :index="1" />
                <span>/</span>
                <XhDateFieldSegment :index="2" />
              </XhDateFieldSegmentGroup>
            </XhDateFieldControl>
          </XhDateFieldRoot>
        </XhFieldArrayItemCell>
        <XhFieldArrayItemCell value="category">
          <XhSelectRoot :default-value="row.value.category ? [row.value.category] : []" placeholder="选择">
            <XhSelectControl>
              <XhSelectTrigger :aria-label="\`第 \${row.index + 1} 笔类别\`">
                <XhSelectValueText />
                <XhSelectIndicator />
              </XhSelectTrigger>
            </XhSelectControl>
            <XhSelectPositioner>
              <XhSelectContent>
                <XhSelectList>
                  <XhSelectItem v-for="c in categories" :key="c.value" :value="c.value">
                    <XhSelectItemText>{{ c.label }}</XhSelectItemText>
                    <XhSelectItemIndicator />
                  </XhSelectItem>
                </XhSelectList>
              </XhSelectContent>
            </XhSelectPositioner>
          </XhSelectRoot>
        </XhFieldArrayItemCell>
        <XhFieldArrayItemCell value="amount">
          <XhNumberFieldRoot :default-value="row.value.amount" :min="0">
            <XhNumberFieldControl>
              <XhNumberFieldInput :aria-label="\`第 \${row.index + 1} 笔金额\`" />
            </XhNumberFieldControl>
          </XhNumberFieldRoot>
        </XhFieldArrayItemCell>
        <XhFieldArrayItemCell value="note">
          <XhTextFieldRoot :default-value="row.value.note">
            <XhTextFieldControl>
              <XhTextFieldInput :aria-label="\`第 \${row.index + 1} 笔备注\`" />
            </XhTextFieldControl>
          </XhTextFieldRoot>
        </XhFieldArrayItemCell>
        <XhFieldArrayItemAction>
          <XhFieldArrayItemDeleteTrigger />
        </XhFieldArrayItemAction>
      </XhFieldArrayItem>
    </XhFieldArrayTable>
    <XhFieldArrayAddTrigger>+ 添加一笔</XhFieldArrayAddTrigger>
  </XhFieldArrayRoot>
</template>
`;export{e as default};