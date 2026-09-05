<!-- 表格里的单元格 | 一格一个就地编辑：点开就是输入框，收尾即写回行数据；autoResize 让输入框按内容宽窄走，不把列撑变形 -->
<script setup lang="ts">
import { reactive } from "vue";
import {
  XhEditableControl,
  XhEditableInput,
  XhEditablePreview,
  XhEditableRoot,
} from "@xihan-ui/vue";

const rows = reactive([
  { id: "u1", name: "赵一", dept: "平台研发", phone: "13800000001" },
  { id: "u2", name: "钱二", dept: "前端体验", phone: "13800000002" },
  { id: "u3", name: "孙三", dept: "基础架构", phone: "13800000003" },
]);

const cell = "padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)";

const head = `${cell}; text-align: start; font-weight: 500; color: var(--xh-fg-muted)`;
</script>

<template>
  <div style="width: 100%; max-width: 520px; display: grid; gap: 12px">
    <table style="width: 100%; border-collapse: collapse">
      <thead>
        <tr>
          <th :style="head">姓名</th>
          <th :style="head">部门</th>
          <th :style="head">手机号</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td :style="cell">
            <XhEditableRoot v-model:value="row.name" placeholder="未填写" auto-resize>
              <XhEditableControl>
                <XhEditablePreview />
                <XhEditableInput />
              </XhEditableControl>
            </XhEditableRoot>
          </td>
          <td :style="cell">
            <XhEditableRoot v-model:value="row.dept" placeholder="未填写" auto-resize>
              <XhEditableControl>
                <XhEditablePreview />
                <XhEditableInput />
              </XhEditableControl>
            </XhEditableRoot>
          </td>
          <td :style="cell">
            <XhEditableRoot
              v-model:value="row.phone"
              placeholder="未填写"
              :max-length="11"
              auto-resize
            >
              <XhEditableControl>
                <XhEditablePreview />
                <XhEditableInput />
              </XhEditableControl>
            </XhEditableRoot>
          </td>
        </tr>
      </tbody>
    </table>

    <span>数据源：{{ rows.map((row) => `${row.name}/${row.dept}`).join("，") }}</span>
  </div>
</template>
