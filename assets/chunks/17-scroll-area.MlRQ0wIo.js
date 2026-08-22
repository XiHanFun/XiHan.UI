const l=`<!-- 放进滚动区 | 表格交给滚动区的视口滚，两条自绘滚动条与吸顶表头、吸附列一起工作；表格自己不再定高 -->
<script setup lang="ts">
import {
  XhScrollAreaContent,
  XhScrollAreaCorner,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";

const columns = [
  { id: "name", label: "姓名", width: "7rem", sticky: true },
  { id: "dept", label: "部门", width: "9rem" },
  { id: "city", label: "城市", width: "7rem" },
  { id: "ext", label: "分机", width: "7rem" },
  { id: "mail", label: "邮箱", width: "13rem" },
];

const depts = ["平台研发", "前端体验", "基础架构", "质量保障"];
const cities = ["杭州", "上海", "北京", "成都"];

const members = Array.from({ length: 24 }, (_, i) => ({
  id: \`u\${i + 1}\`,
  name: \`员工 \${i + 1}\`,
  dept: depts[i % depts.length],
  city: cities[i % cities.length],
  ext: \`8\${(100 + i).toString()}\`,
  mail: \`member\${i + 1}@example.com\`,
}));

const rows = members.map((m) => ({ id: m.id }));
<\/script>

<template>
  <!-- 滚动区定高，表格不再自己滚；两条轴各写一条滚动条，交叉口写在竖条里 -->
  <XhScrollAreaRoot type="auto" style="block-size: 260px; inline-size: 100%; max-inline-size: 420px">
    <XhScrollAreaViewport>
      <XhScrollAreaContent>
        <XhTableRoot :columns="columns" :rows="rows" sticky-header>
          <XhTableHeader>
            <XhTableRow>
              <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
                {{ col.label }}
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
        </XhTableRoot>
      </XhScrollAreaContent>
    </XhScrollAreaViewport>
    <XhScrollAreaScrollbar orientation="vertical">
      <XhScrollAreaTrack>
        <XhScrollAreaThumb />
      </XhScrollAreaTrack>
      <XhScrollAreaCorner />
    </XhScrollAreaScrollbar>
    <XhScrollAreaScrollbar orientation="horizontal">
      <XhScrollAreaTrack>
        <XhScrollAreaThumb />
      </XhScrollAreaTrack>
    </XhScrollAreaScrollbar>
  </XhScrollAreaRoot>
</template>
`;export{l as default};
