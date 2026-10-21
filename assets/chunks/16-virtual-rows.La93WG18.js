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
<\/script>

<template>
  <!-- 表格根节点自己滚：虚拟滚动取最近的可滚动祖先（ancestor），吸顶表头、横向溢出与行在同一个滚动面里；视口不定高、不滚动，也不占 Tab 位 -->
  <!-- 行高不写死：estimateFromMeasured 按量到的行高估算还没渲染的行，换尺寸、密度或皮肤都跟得上 -->
  <XhVirtualizerRoot
    v-slot="{ virtualItems, collectionVirtualizer }"
    :count="people.length"
    estimate-from-measured
    scroll-container="ancestor"
    style="inline-size: 100%; max-inline-size: 520px"
  >
    <XhTableRoot
      :columns="columns"
      :rows="rows"
      :virtualizer="collectionVirtualizer"
      sticky-header
    >
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            <XhTableColumnLabel>{{ col.label }}</XhTableColumnLabel>
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhVirtualizerViewport>
          <XhVirtualizerContent>
            <XhVirtualizerItem v-for="item in virtualItems" :key="item.key" :value="item.index" measure>
              <XhTableRow :value="people[item.index]!.id">
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