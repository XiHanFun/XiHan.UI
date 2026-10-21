var e=`<!-- 表头吸顶、表尾吸底与列吸附 | root 自身就是滚动容器：stickyHeader 固定表头，stickyFooter 固定表尾，列上标注 sticky 的固定该列 -->
<script setup lang="ts">
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableFooter,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";

// 首列吸附，其余列给足宽度让表格横向溢出，滚起来才看得出钉住的效果
const columns = [
  { id: "name", label: "姓名", width: "7rem", sticky: true },
  { id: "dept", label: "部门", width: "9rem" },
  { id: "city", label: "城市", width: "7rem" },
  { id: "ext", label: "分机", width: "7rem" },
  { id: "mail", label: "邮箱", width: "13rem" },
];

const depts = ["平台研发", "前端体验", "基础架构", "质量保障"];
const cities = ["杭州", "上海", "北京", "成都"];

const members = Array.from({ length: 16 }, (_, i) => ({
  id: \`u\${i + 1}\`,
  name: \`员工 \${i + 1}\`,
  dept: depts[i % depts.length],
  city: cities[i % cities.length],
  ext: \`8\${(100 + i).toString()}\`,
  mail: \`member\${i + 1}@example.com\`,
}));

const rows = members.map(m => ({ id: m.id }));
<\/script>

<template>
  <div style="width: 100%; max-width: 420px">
    <XhTableRoot :columns="columns" :rows="rows" sticky-header sticky-footer :footer-rows="1">
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            <XhTableColumnLabel>{{ col.label }}</XhTableColumnLabel>
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="m in members" :key="m.id" :value="m.id">
          <XhTableCell value="name">{{ m.name }}</XhTableCell>
          <XhTableCell value="dept">{{ m.dept }}</XhTableCell>
          <XhTableCell value="city">{{ m.city }}</XhTableCell>
          <XhTableCell value="ext">{{ m.ext }}</XhTableCell>
          <XhTableCell value="mail">{{ m.mail }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
      <XhTableFooter>
        <XhTableRow>
          <XhTableCell value="name">共 {{ members.length }} 人</XhTableCell>
          <XhTableCell value="dept"></XhTableCell>
          <XhTableCell value="city"></XhTableCell>
          <XhTableCell value="ext"></XhTableCell>
          <XhTableCell value="mail"></XhTableCell>
        </XhTableRow>
      </XhTableFooter>
    </XhTableRoot>
  </div>
</template>
`;export{e as default};