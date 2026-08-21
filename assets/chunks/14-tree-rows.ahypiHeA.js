const n=`<!-- 树形表格 | rows 按契约就是一条已摊平的可见行序列：层级三件套逐行自报，缩进落在首格的内边距上 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";

interface Node {
  id: string;
  label: string;
  owner: string;
  children?: Node[];
}

const columns = [
  { id: "name", label: "组织", width: "13rem" },
  { id: "owner", label: "负责人" },
];

const tree: Node[] = [
  {
    id: "rd",
    label: "研发中心",
    owner: "赵一",
    children: [
      {
        id: "rd-web",
        label: "前端组",
        owner: "钱二",
        children: [
          { id: "rd-web-1", label: "组件库", owner: "孙三" },
          { id: "rd-web-2", label: "控制台", owner: "李四" },
        ],
      },
      { id: "rd-api", label: "服务端组", owner: "周五" },
    ],
  },
  {
    id: "ops",
    label: "运维中心",
    owner: "吴六",
    children: [{ id: "ops-1", label: "值班平台", owner: "郑七" }],
  },
];

const expanded = ref<string[]>(["rd"]);

interface FlatRow {
  id: string;
  label: string;
  owner: string;
  level: number;
  pos: number;
  size: number;
  branch: boolean;
  open: boolean;
}

// 收起分支的子树整段不出现在序列里，行号因此永远连续
const flat = computed<FlatRow[]>(() => {
  const out: FlatRow[] = [];
  const walk = (nodes: Node[], level: number): void => {
    nodes.forEach((node, i) => {
      const branch = !!node.children?.length;
      const open = branch && expanded.value.includes(node.id);
      out.push({
        id: node.id,
        label: node.label,
        owner: node.owner,
        level,
        pos: i + 1,
        size: nodes.length,
        branch,
        open,
      });
      if (open) walk(node.children!, level + 1);
    });
  };
  walk(tree, 1);
  return out;
});

const rows = computed(() => flat.value.map((row) => ({ id: row.id })));

function toggle(id: string): void {
  expanded.value = expanded.value.includes(id)
    ? expanded.value.filter((v) => v !== id)
    : [...expanded.value, id];
}

// 焦点行是父级时左右方向键切换开合；连接层遇到不可展开的行原样放行这两个键
function onBodyKeydown(event: KeyboardEvent, focused: string | null): void {
  if (focused == null) return;
  const row = flat.value.find((r) => r.id === focused);
  if (!row?.branch) return;
  const wantOpen = event.key === "ArrowRight";
  const wantClose = event.key === "ArrowLeft";
  if ((wantOpen && !row.open) || (wantClose && row.open)) {
    event.preventDefault();
    toggle(focused);
  }
}

const twistyStyle = {
  display: "inline-flex",
  flex: "none",
  alignItems: "center",
  justifyContent: "center",
  inlineSize: "1rem",
  blockSize: "1rem",
  cursor: "pointer",
};
<\/script>

<template>
  <div style="width: 100%; max-width: 520px; display: grid; gap: 12px">
    <!-- 行有层级，root 报 treegrid -->
    <XhTableRoot v-slot="{ focusedRow }" :columns="columns" :rows="rows" role="treegrid">
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            {{ col.label }}
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody @keydown="onBodyKeydown($event, focusedRow)">
        <XhTableRow
          v-for="row in flat"
          :key="row.id"
          :value="row.id"
          :aria-level="row.level"
          :aria-posinset="row.pos"
          :aria-setsize="row.size"
          :aria-expanded="row.branch ? String(row.open) : undefined"
        >
          <!-- 缩进是首格的内边距，与层级号同源 -->
          <XhTableCell
            value="name"
            :style="{ paddingInlineStart: \`\${row.level * 16}px\` }"
          >
            <!-- 开合箭头只服务指针，键盘那一路走左右方向键，因此对读屏隐藏 -->
            <span
              v-if="row.branch"
              aria-hidden="true"
              :style="twistyStyle"
              @click="toggle(row.id)"
            >
              {{ row.open ? "▾" : "▸" }}
            </span>
            <span v-else aria-hidden="true" :style="twistyStyle" />
            {{ row.label }}
          </XhTableCell>
          <XhTableCell value="owner">{{ row.owner }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span>展开：{{ expanded.length ? expanded.join("、") : "（无）" }}</span>
  </div>
</template>
`;export{n as default};
