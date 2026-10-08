var e=`<!-- 导出 CSV | 工具条里放一个下载按钮：点击时按当前的排序与列头现拼 CSV，Excel 打开不乱码要带 BOM，字段里的逗号、引号与换行按规则转义 -->
<script setup lang="ts">
import { DownloadIcon } from "@xihan-ui/icons";
import {
  XhDownloadTrigger,
  XhIcon,
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableSortTrigger,
  XhTableToolbar,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

interface Member {
  id: string;
  name: string;
  dept: string;
  note: string;
}

const columns = [
  { id: "name", label: "姓名", width: "7rem", sortable: true },
  { id: "dept", label: "部门", width: "8rem", sortable: true },
  { id: "note", label: "备注" },
];

const members: Member[] = [
  { id: "u1", name: "赵一", dept: "平台研发", note: "负责网关，兼管发布" },
  { id: "u2", name: "钱二", dept: "前端体验", note: "组件库, 设计系统" },
  { id: "u3", name: "孙三", dept: "基础架构", note: "口头禅是\\"先压测\\"" },
  { id: "u4", name: "李四", dept: "前端体验", note: "控制台" },
];

type Sort = { id: string; direction: "asc" | "desc" }[];

function sortMembers(sort: Sort): Member[] {
  if (!sort.length)
    return members;
  return [...members].sort((a, b) => {
    for (const s of sort) {
      const diff = a[s.id as keyof Member].localeCompare(b[s.id as keyof Member], "zh");
      if (diff !== 0)
        return s.direction === "asc" ? diff : -diff;
    }
    return 0;
  });
}

// 含逗号、引号或换行的字段整段加引号，里面的引号写两遍
function field(value: string): string {
  return /[",\\n]/.test(value) ? \`"\${value.replaceAll("\\"", "\\"\\"")}"\` : value;
}

// 列头取 columns 的 label，行序取当前排序；开头的 BOM 让 Excel 按 UTF-8 读
function toCsv(list: Member[]): string {
  const lines = [
    columns.map(col => field(col.label)).join(","),
    ...list.map(m => columns.map(col => field(m[col.id as keyof Member])).join(",")),
  ];
  return \`\\uFEFF\${lines.join("\\r\\n")}\`;
}

const sort = ref<Sort>([]);
const sorted = computed(() => sortMembers(sort.value));
const rows = computed(() => sorted.value.map(m => ({ id: m.id })));
<\/script>

<template>
  <div style="width: 100%; max-width: 560px">
    <XhTableRoot v-model:sort="sort" :columns="columns" :rows="rows">
      <template #toolbar>
        <XhTableToolbar>
          <span>成员 {{ members.length }} 人</span>
          <!-- 点击时才拼：导出的是那一刻的排序结果 -->
          <XhDownloadTrigger
            :data="() => toCsv(sorted)"
            file-name="members.csv"
            mime-type="text/csv"
            size="sm"
          >
            <XhIcon :icon="DownloadIcon" /> 导出 CSV
          </XhDownloadTrigger>
        </XhTableToolbar>
      </template>
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            <XhTableColumnLabel>{{ col.label }}</XhTableColumnLabel>
            <XhTableSortTrigger v-if="col.sortable" />
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="m in sorted" :key="m.id" :value="m.id">
          <XhTableCell value="name">{{ m.name }}</XhTableCell>
          <XhTableCell value="dept">{{ m.dept }}</XhTableCell>
          <XhTableCell value="note">{{ m.note }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
  </div>
</template>
`;export{e as default};