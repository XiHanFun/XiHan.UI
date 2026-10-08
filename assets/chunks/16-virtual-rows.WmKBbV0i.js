var e=`<!-- 只渲染窗口内的行 | 一万行交给 Virtualizer：表格经 virtualizer 接上它的 collectionVirtualizer，行号与方向键仍按完整行序走，DOM 里只有窗口那十几行 -->
<script setup lang="ts">
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";

const columns = [
  { id: "no", label: "编号", width: "6rem" },
  { id: "name", label: "姓名", width: "8rem" },
  { id: "dept", label: "部门" },
];

const depts = ["平台研发", "前端体验", "基础架构", "质量保障"];

const people = Array.from({ length: 10000 }, (_, i) => ({
  id: \`u\${i + 1}\`,
  no: \`#\${i + 1}\`,
  name: \`员工 \${i + 1}\`,
  dept: depts[i % depts.length],
}));

// 行号与总数按全量算，与挂了哪几行无关
const rows = people.map(p => ({ id: p.id }));

// 行之间的分隔线：每行装在各自的虚拟条目里，彼此不是兄弟节点，分隔线写在行上
const rowStyle = "block-size: 36px; border-block-end: 1px solid var(--xh-border-subtle)";
<\/script>

<template>
  <!-- 表体里的视口负责滚动：表格自己不再定高、不再滚；视口不占 Tab 位，键盘归表体 -->
  <XhVirtualizerRoot
    v-slot="{ virtualItems, collectionVirtualizer }"
    :count="people.length"
    :estimate-size="36"
    :viewport-tab-index="-1"
    style="inline-size: 100%; max-inline-size: 520px"
  >
    <XhTableRoot
      :columns="columns"
      :rows="rows"
      :virtualizer="collectionVirtualizer"
      style="max-block-size: none; overflow: visible"
    >
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            <XhTableColumnLabel>{{ col.label }}</XhTableColumnLabel>
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhVirtualizerViewport style="block-size: 320px">
          <XhVirtualizerContent>
            <XhVirtualizerItem v-for="item in virtualItems" :key="item.key" :value="item.index">
              <XhTableRow :value="people[item.index]!.id" :style="rowStyle">
                <XhTableCell value="no">{{ people[item.index]!.no }}</XhTableCell>
                <XhTableCell value="name">{{ people[item.index]!.name }}</XhTableCell>
                <XhTableCell value="dept">{{ people[item.index]!.dept }}</XhTableCell>
              </XhTableRow>
            </XhVirtualizerItem>
          </XhVirtualizerContent>
        </XhVirtualizerViewport>
      </XhTableBody>
    </XhTableRoot>
  </XhVirtualizerRoot>
</template>
`;export{e as default};