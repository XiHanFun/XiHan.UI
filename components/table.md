来源：https://ui.docs.xihanfun.com/components/table

# Table `表格`

多行同构记录按列排开，支持排序、选择、展开与吸顶。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/table" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/table.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/table" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/table" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/table.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

columns 是列号与列宽的唯一事实源，rows 是行序与行号的唯一事实源，标记只管长相

```vue
<script setup lang="ts">
import {
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";

const columns = [
  { id: "name", label: "姓名", width: "8rem" },
  { id: "dept", label: "部门" },
  { id: "level", label: "职级", width: "6rem" },
];

const members = [
  { id: "u1", name: "赵一", dept: "平台研发", level: "P6" },
  { id: "u2", name: "钱二", dept: "前端体验", level: "P7" },
  { id: "u3", name: "孙三", dept: "基础架构", level: "P6" },
  { id: "u4", name: "李四", dept: "质量保障", level: "P5" },
];

const rows = members.map(m => ({ id: m.id }));
</script>

<template>
  <div style="width: 100%; max-width: 560px">
    <XhTableRoot :columns="columns" :rows="rows">
      <XhTableCaption>团队成员</XhTableCaption>
      <XhTableHeader>
        <!-- 表头行不给 value，它恒占行号空间的第 1 行 -->
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
          <XhTableCell value="level">{{ m.level }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 560px">
  <xh-table id="table-basic">
    <div data-xh-part="root">
      <div data-xh-part="caption">团队成员</div>
      <div data-xh-part="header">
        <!-- 表头行不给 value，它恒占行号空间的第 1 行 -->
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="name">姓名</div>
          <div data-xh-part="column-header" value="dept">部门</div>
          <div data-xh-part="column-header" value="level">职级</div>
        </div>
      </div>
      <div data-xh-part="body">
        <div data-xh-part="row" value="u1">
          <div data-xh-part="cell" value="name">赵一</div>
          <div data-xh-part="cell" value="dept">平台研发</div>
          <div data-xh-part="cell" value="level">P6</div>
        </div>
        <div data-xh-part="row" value="u2">
          <div data-xh-part="cell" value="name">钱二</div>
          <div data-xh-part="cell" value="dept">前端体验</div>
          <div data-xh-part="cell" value="level">P7</div>
        </div>
        <div data-xh-part="row" value="u3">
          <div data-xh-part="cell" value="name">孙三</div>
          <div data-xh-part="cell" value="dept">基础架构</div>
          <div data-xh-part="cell" value="level">P6</div>
        </div>
        <div data-xh-part="row" value="u4">
          <div data-xh-part="cell" value="name">李四</div>
          <div data-xh-part="cell" value="dept">质量保障</div>
          <div data-xh-part="cell" value="level">P5</div>
        </div>
      </div>
    </div>
  </xh-table>
</div>

<script type="module">
  // 两份定义都是数组，只能走 property
  const table = document.getElementById("table-basic");

  table.columns = [
    { id: "name", label: "姓名", width: "8rem" },
    { id: "dept", label: "部门" },
    { id: "level", label: "职级", width: "6rem" },
  ];
  table.rows = [{ id: "u1" }, { id: "u2" }, { id: "u3" }, { id: "u4" }];
</script>
```

## 示例

### 排序

列上标了 sortable 才认排序把手；按住 Shift 点是追加到排序链，裸点是整条链换成这一列

```vue
<script setup lang="ts">
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableSortTrigger,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

interface Member {
  id: string;
  name: string;
  dept: string;
  level: string;
}

const columns = [
  { id: "name", label: "姓名", width: "8rem", sortable: true },
  { id: "dept", label: "部门", sortable: true },
  { id: "level", label: "职级", width: "6rem" },
];

const members: Member[] = [
  { id: "u1", name: "赵一", dept: "平台研发", level: "P6" },
  { id: "u2", name: "钱二", dept: "前端体验", level: "P7" },
  { id: "u3", name: "孙三", dept: "基础架构", level: "P6" },
  { id: "u4", name: "李四", dept: "前端体验", level: "P5" },
];

// 排序链是有序的：下标即优先级，第一个是主排序字段
const sort = ref<{ id: string; direction: "asc" | "desc" }[]>([]);

const sorted = computed(() => {
  if (!sort.value.length)
    return members;
  return [...members].sort((a, b) => {
    for (const s of sort.value) {
      const diff = String(a[s.id as keyof Member]).localeCompare(
        String(b[s.id as keyof Member]),
        "zh",
      );
      if (diff !== 0)
        return s.direction === "asc" ? diff : -diff;
    }
    return 0;
  });
});

// 行序的事实源跟着排序结果走
const rows = computed(() => sorted.value.map(m => ({ id: m.id })));
</script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
    <XhTableRoot v-model:sort="sort" :columns="columns" :rows="rows">
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            <XhTableSortTrigger v-if="col.sortable">{{ col.label }}</XhTableSortTrigger>
            <template v-else>{{ col.label }}</template>
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="m in sorted" :key="m.id" :value="m.id">
          <XhTableCell value="name">{{ m.name }}</XhTableCell>
          <XhTableCell value="dept">{{ m.dept }}</XhTableCell>
          <XhTableCell value="level">{{ m.level }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span>
      排序链：{{
        sort.length ? sort.map((s) => `${s.id} ${s.direction}`).join(" → ") : "（无）"
      }}
    </span>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
  <xh-table id="table-sort">
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="name">
            <span data-xh-part="sort-trigger">姓名</span>
          </div>
          <div data-xh-part="column-header" value="dept">
            <span data-xh-part="sort-trigger">部门</span>
          </div>
          <div data-xh-part="column-header" value="level">职级</div>
        </div>
      </div>
      <div data-xh-part="body">
        <div data-xh-part="row" value="u1">
          <div data-xh-part="cell" value="name">赵一</div>
          <div data-xh-part="cell" value="dept">平台研发</div>
          <div data-xh-part="cell" value="level">P6</div>
        </div>
        <div data-xh-part="row" value="u2">
          <div data-xh-part="cell" value="name">钱二</div>
          <div data-xh-part="cell" value="dept">前端体验</div>
          <div data-xh-part="cell" value="level">P7</div>
        </div>
        <div data-xh-part="row" value="u3">
          <div data-xh-part="cell" value="name">孙三</div>
          <div data-xh-part="cell" value="dept">基础架构</div>
          <div data-xh-part="cell" value="level">P6</div>
        </div>
        <div data-xh-part="row" value="u4">
          <div data-xh-part="cell" value="name">李四</div>
          <div data-xh-part="cell" value="dept">前端体验</div>
          <div data-xh-part="cell" value="level">P5</div>
        </div>
      </div>
    </div>
  </xh-table>
  <span id="table-sort-value"></span>
</div>

<script type="module">
  const members = [
    { id: "u1", name: "赵一", dept: "平台研发", level: "P6" },
    { id: "u2", name: "钱二", dept: "前端体验", level: "P7" },
    { id: "u3", name: "孙三", dept: "基础架构", level: "P6" },
    { id: "u4", name: "李四", dept: "前端体验", level: "P5" },
  ];

  const table = document.getElementById("table-sort");
  const body = table.querySelector('[data-xh-part="body"]');
  const readout = document.getElementById("table-sort-value");

  table.columns = [
    { id: "name", label: "姓名", width: "8rem", sortable: true },
    { id: "dept", label: "部门", sortable: true },
    { id: "level", label: "职级", width: "6rem" },
  ];

  // 排序链是有序的：下标即优先级，第一个是主排序字段
  let sort = [];

  function sorted() {
    if (!sort.length) return members;
    return [...members].sort((a, b) => {
      for (const s of sort) {
        const diff = String(a[s.id]).localeCompare(String(b[s.id]), "zh");
        if (diff !== 0) return s.direction === "asc" ? diff : -diff;
      }
      return 0;
    });
  }

  function render() {
    const list = sorted();
    // 行序的事实源跟着排序结果走，行节点跟着搬位置
    table.rows = list.map((m) => ({ id: m.id }));
    table.sort = sort;
    for (const m of list)
      body.append(body.querySelector(`[data-xh-part="row"][value="${m.id}"]`));
    readout.textContent = `排序链：${
      sort.length ? sort.map((s) => `${s.id} ${s.direction}`).join(" → ") : "（无）"
    }`;
  }

  render();
  table.addEventListener("sort-change", (event) => {
    sort = event.detail.value;
    render();
  });
</script>
```

### 多选

selectionMode 默认 none，声明 multiple 才有选择机制；选择列也要在 columns 里占一条，否则右侧列号串位

```vue
<script setup lang="ts">
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableRowSelectTrigger,
  XhTableSelectAllTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const columns = [
  { id: "select", width: "3rem" },
  { id: "name", label: "姓名", width: "8rem" },
  { id: "dept", label: "部门" },
];

const members = [
  { id: "u1", name: "赵一", dept: "平台研发" },
  { id: "u2", name: "钱二", dept: "前端体验" },
  { id: "u3", name: "孙三", dept: "基础架构" },
  { id: "u4", name: "李四（禁用）", dept: "质量保障" },
];

// 禁用行选不动，也不算进全选的基数
const rows = [
  { id: "u1" },
  { id: "u2" },
  { id: "u3" },
  { id: "u4", disabled: true },
];

const selection = ref<string[] | "all">(["u2"]);
</script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
    <XhTableRoot
      v-model:selection="selection"
      :columns="columns"
      :rows="rows"
      selection-mode="multiple"
    >
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader value="select">
            <!-- 全选把手是三态的唯一载体，自己占一个 Tab 位 -->
            <XhTableSelectAllTrigger />
          </XhTableColumnHeader>
          <XhTableColumnHeader value="name">姓名</XhTableColumnHeader>
          <XhTableColumnHeader value="dept">部门</XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="m in members" :key="m.id" :value="m.id">
          <XhTableCell value="select">
            <XhTableRowSelectTrigger />
          </XhTableCell>
          <XhTableCell value="name">{{ m.name }}</XhTableCell>
          <XhTableCell value="dept">{{ m.dept }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span>
      选中：{{
        selection === "all"
          ? "全部"
          : selection.length
            ? selection.join("、")
            : "（无）"
      }}
    </span>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
  <xh-table id="table-selection" selection-mode="multiple">
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="select">
            <!-- 全选把手是三态的唯一载体，自己占一个 Tab 位 -->
            <span data-xh-part="select-all-trigger"></span>
          </div>
          <div data-xh-part="column-header" value="name">姓名</div>
          <div data-xh-part="column-header" value="dept">部门</div>
        </div>
      </div>
      <div data-xh-part="body">
        <div data-xh-part="row" value="u1">
          <div data-xh-part="cell" value="select">
            <span data-xh-part="row-select-trigger"></span>
          </div>
          <div data-xh-part="cell" value="name">赵一</div>
          <div data-xh-part="cell" value="dept">平台研发</div>
        </div>
        <div data-xh-part="row" value="u2">
          <div data-xh-part="cell" value="select">
            <span data-xh-part="row-select-trigger"></span>
          </div>
          <div data-xh-part="cell" value="name">钱二</div>
          <div data-xh-part="cell" value="dept">前端体验</div>
        </div>
        <div data-xh-part="row" value="u3">
          <div data-xh-part="cell" value="select">
            <span data-xh-part="row-select-trigger"></span>
          </div>
          <div data-xh-part="cell" value="name">孙三</div>
          <div data-xh-part="cell" value="dept">基础架构</div>
        </div>
        <div data-xh-part="row" value="u4">
          <div data-xh-part="cell" value="select">
            <span data-xh-part="row-select-trigger"></span>
          </div>
          <div data-xh-part="cell" value="name">李四（禁用）</div>
          <div data-xh-part="cell" value="dept">质量保障</div>
        </div>
      </div>
    </div>
  </xh-table>
  <span id="table-selection-value"></span>
</div>

<script type="module">
  const table = document.getElementById("table-selection");
  const readout = document.getElementById("table-selection-value");

  table.columns = [
    { id: "select", width: "3rem" },
    { id: "name", label: "姓名", width: "8rem" },
    { id: "dept", label: "部门" },
  ];
  // 禁用行选不动，也不算进全选的基数
  table.rows = [
    { id: "u1" },
    { id: "u2" },
    { id: "u3" },
    { id: "u4", disabled: true },
  ];

  function apply(selection) {
    table.selection = selection;
    readout.textContent = `选中：${
      selection === "all"
        ? "全部"
        : selection.length
          ? selection.join("、")
          : "（无）"
    }`;
  }

  apply(["u2"]);
  table.addEventListener("selection-change", (event) => apply(event.detail.value));
</script>
```

### 行展开

行上标了 expandable 才认展开把手与左右方向键；详情行占一个真实行号，收起只加 hidden 不卸载内部节点

```vue
<script setup lang="ts">
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableExpandedRow,
  XhTableExpandTrigger,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";
import { ref } from "vue";

const columns = [
  { id: "expand", width: "2.5rem" },
  { id: "order", label: "订单号", width: "9rem" },
  { id: "amount", label: "金额" },
];

const orders = [
  { id: "o1", no: "XH-2026-0001", amount: "¥ 1,280", detail: "键盘 ×1、鼠标 ×2" },
  { id: "o2", no: "XH-2026-0002", amount: "¥ 320", detail: "显示器支架 ×1" },
  { id: "o3", no: "XH-2026-0003", amount: "¥ 96", detail: "线材若干" },
];

const rows = orders.map(o => ({ id: o.id, expandable: true }));

const expanded = ref<string[]>(["o1"]);
</script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
    <XhTableRoot v-model:expanded-value="expanded" :columns="columns" :rows="rows">
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader value="expand" />
          <XhTableColumnHeader value="order">订单号</XhTableColumnHeader>
          <XhTableColumnHeader value="amount">金额</XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <template v-for="o in orders" :key="o.id">
          <XhTableRow :value="o.id">
            <XhTableCell value="expand">
              <XhTableExpandTrigger />
            </XhTableCell>
            <XhTableCell value="order">{{ o.no }}</XhTableCell>
            <XhTableCell value="amount">{{ o.amount }}</XhTableCell>
          </XhTableRow>
          <!-- 详情行紧跟它所属的数据行，整行铺开靠 colspan -->
          <XhTableExpandedRow :value="o.id">
            <XhTableCell value="expand" :colspan="3">明细：{{ o.detail }}</XhTableCell>
          </XhTableExpandedRow>
        </template>
      </XhTableBody>
    </XhTableRoot>
    <span>展开：{{ expanded.length ? expanded.join("、") : "（无）" }}</span>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
  <xh-table id="table-expand">
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="expand"></div>
          <div data-xh-part="column-header" value="order">订单号</div>
          <div data-xh-part="column-header" value="amount">金额</div>
        </div>
      </div>
      <div data-xh-part="body">
        <div data-xh-part="row" value="o1">
          <div data-xh-part="cell" value="expand">
            <span data-xh-part="expand-trigger"></span>
          </div>
          <div data-xh-part="cell" value="order">XH-2026-0001</div>
          <div data-xh-part="cell" value="amount">¥ 1,280</div>
        </div>
        <!-- 详情行紧跟它所属的数据行，整行铺开靠 colspan -->
        <div data-xh-part="expanded-row" value="o1">
          <div data-xh-part="cell" value="expand" colspan="3">
            明细：键盘 ×1、鼠标 ×2
          </div>
        </div>

        <div data-xh-part="row" value="o2">
          <div data-xh-part="cell" value="expand">
            <span data-xh-part="expand-trigger"></span>
          </div>
          <div data-xh-part="cell" value="order">XH-2026-0002</div>
          <div data-xh-part="cell" value="amount">¥ 320</div>
        </div>
        <div data-xh-part="expanded-row" value="o2">
          <div data-xh-part="cell" value="expand" colspan="3">
            明细：显示器支架 ×1
          </div>
        </div>

        <div data-xh-part="row" value="o3">
          <div data-xh-part="cell" value="expand">
            <span data-xh-part="expand-trigger"></span>
          </div>
          <div data-xh-part="cell" value="order">XH-2026-0003</div>
          <div data-xh-part="cell" value="amount">¥ 96</div>
        </div>
        <div data-xh-part="expanded-row" value="o3">
          <div data-xh-part="cell" value="expand" colspan="3">明细：线材若干</div>
        </div>
      </div>
    </div>
  </xh-table>
  <span id="table-expand-value"></span>
</div>

<script type="module">
  const table = document.getElementById("table-expand");
  const readout = document.getElementById("table-expand-value");

  table.columns = [
    { id: "expand", width: "2.5rem" },
    { id: "order", label: "订单号", width: "9rem" },
    { id: "amount", label: "金额" },
  ];
  table.rows = [
    { id: "o1", expandable: true },
    { id: "o2", expandable: true },
    { id: "o3", expandable: true },
  ];

  function apply(expanded) {
    table.expandedValue = expanded;
    readout.textContent = `展开：${expanded.length ? expanded.join("、") : "（无）"}`;
  }

  apply(["o1"]);
  table.addEventListener("expanded-value-change", (event) => apply(event.detail.value));
</script>
```

### 密度

size 只落成 root 的 data-size，换的是单元格纵向内边距与字号；三档并排，差别在行高上

```vue
<script setup lang="ts">
import {
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";

const columns = [
  { id: "name", label: "姓名" },
  { id: "level", label: "职级" },
];

const members = [
  { id: "u1", name: "赵一", level: "P6" },
  { id: "u2", name: "钱二", level: "P7" },
  { id: "u3", name: "孙三", level: "P6" },
  { id: "u4", name: "李四", level: "P5" },
  { id: "u5", name: "周五", level: "P7" },
];

const rows = members.map(m => ({ id: m.id }));

// 中间档不传 size，缺省即中密度
const densities = [
  { key: "sm", size: "sm", label: "sm 紧凑" },
  { key: "md", size: undefined, label: "缺省" },
  { key: "lg", size: "lg", label: "lg 宽松" },
];
</script>

<template>
  <div
    style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start"
  >
    <div
      v-for="d in densities"
      :key="d.key"
      style="flex: 1 1 190px; min-width: 190px"
    >
      <XhTableRoot :columns="columns" :rows="rows" :size="d.size">
        <XhTableCaption>{{ d.label }}</XhTableCaption>
        <XhTableHeader>
          <XhTableRow>
            <XhTableColumnHeader
              v-for="col in columns"
              :key="col.id"
              :value="col.id"
            >
              {{ col.label }}
            </XhTableColumnHeader>
          </XhTableRow>
        </XhTableHeader>
        <XhTableBody>
          <XhTableRow v-for="m in members" :key="m.id" :value="m.id">
            <XhTableCell value="name">{{ m.name }}</XhTableCell>
            <XhTableCell value="level">{{ m.level }}</XhTableCell>
          </XhTableRow>
        </XhTableBody>
      </XhTableRoot>
    </div>
  </div>
</template>
```

```html
<div
  id="table-size"
  style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start"
>
  <div style="flex: 1 1 190px; min-width: 190px">
    <xh-table size="sm">
      <div data-xh-part="root">
        <div data-xh-part="caption">sm 紧凑</div>
        <div data-xh-part="header">
          <div data-xh-part="row">
            <div data-xh-part="column-header" value="name">姓名</div>
            <div data-xh-part="column-header" value="level">职级</div>
          </div>
        </div>
        <div data-xh-part="body">
          <div data-xh-part="row" value="u1">
            <div data-xh-part="cell" value="name">赵一</div>
            <div data-xh-part="cell" value="level">P6</div>
          </div>
          <div data-xh-part="row" value="u2">
            <div data-xh-part="cell" value="name">钱二</div>
            <div data-xh-part="cell" value="level">P7</div>
          </div>
          <div data-xh-part="row" value="u3">
            <div data-xh-part="cell" value="name">孙三</div>
            <div data-xh-part="cell" value="level">P6</div>
          </div>
          <div data-xh-part="row" value="u4">
            <div data-xh-part="cell" value="name">李四</div>
            <div data-xh-part="cell" value="level">P5</div>
          </div>
          <div data-xh-part="row" value="u5">
            <div data-xh-part="cell" value="name">周五</div>
            <div data-xh-part="cell" value="level">P7</div>
          </div>
        </div>
      </div>
    </xh-table>
  </div>

  <!-- 中间档不写 size，缺省即中密度 -->
  <div style="flex: 1 1 190px; min-width: 190px">
    <xh-table>
      <div data-xh-part="root">
        <div data-xh-part="caption">缺省</div>
        <div data-xh-part="header">
          <div data-xh-part="row">
            <div data-xh-part="column-header" value="name">姓名</div>
            <div data-xh-part="column-header" value="level">职级</div>
          </div>
        </div>
        <div data-xh-part="body">
          <div data-xh-part="row" value="u1">
            <div data-xh-part="cell" value="name">赵一</div>
            <div data-xh-part="cell" value="level">P6</div>
          </div>
          <div data-xh-part="row" value="u2">
            <div data-xh-part="cell" value="name">钱二</div>
            <div data-xh-part="cell" value="level">P7</div>
          </div>
          <div data-xh-part="row" value="u3">
            <div data-xh-part="cell" value="name">孙三</div>
            <div data-xh-part="cell" value="level">P6</div>
          </div>
          <div data-xh-part="row" value="u4">
            <div data-xh-part="cell" value="name">李四</div>
            <div data-xh-part="cell" value="level">P5</div>
          </div>
          <div data-xh-part="row" value="u5">
            <div data-xh-part="cell" value="name">周五</div>
            <div data-xh-part="cell" value="level">P7</div>
          </div>
        </div>
      </div>
    </xh-table>
  </div>

  <div style="flex: 1 1 190px; min-width: 190px">
    <xh-table size="lg">
      <div data-xh-part="root">
        <div data-xh-part="caption">lg 宽松</div>
        <div data-xh-part="header">
          <div data-xh-part="row">
            <div data-xh-part="column-header" value="name">姓名</div>
            <div data-xh-part="column-header" value="level">职级</div>
          </div>
        </div>
        <div data-xh-part="body">
          <div data-xh-part="row" value="u1">
            <div data-xh-part="cell" value="name">赵一</div>
            <div data-xh-part="cell" value="level">P6</div>
          </div>
          <div data-xh-part="row" value="u2">
            <div data-xh-part="cell" value="name">钱二</div>
            <div data-xh-part="cell" value="level">P7</div>
          </div>
          <div data-xh-part="row" value="u3">
            <div data-xh-part="cell" value="name">孙三</div>
            <div data-xh-part="cell" value="level">P6</div>
          </div>
          <div data-xh-part="row" value="u4">
            <div data-xh-part="cell" value="name">李四</div>
            <div data-xh-part="cell" value="level">P5</div>
          </div>
          <div data-xh-part="row" value="u5">
            <div data-xh-part="cell" value="name">周五</div>
            <div data-xh-part="cell" value="level">P7</div>
          </div>
        </div>
      </div>
    </xh-table>
  </div>
</div>

<script type="module">
  // 三档摆同一份数据，只有 size 不同
  const stage = document.getElementById("table-size");

  for (const table of stage.querySelectorAll("xh-table")) {
    table.columns = [
      { id: "name", label: "姓名" },
      { id: "level", label: "职级" },
    ];
    table.rows = [
      { id: "u1" },
      { id: "u2" },
      { id: "u3" },
      { id: "u4" },
      { id: "u5" },
    ];
  }
</script>
```

### 空态与加载态

两个状态节点常挂着只靠 hidden 显隐：表体为空且在取数时露加载态，取数完了没有行才露空态

```vue
<script setup lang="ts">
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableEmpty,
  XhTableHeader,
  XhTableLoading,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

interface Task {
  id: string;
  name: string;
  owner: string;
}

const columns = [
  { id: "name", label: "任务", width: "10rem" },
  { id: "owner", label: "负责人" },
];

const source: Task[] = [
  { id: "t1", name: "构建流水线", owner: "赵一" },
  { id: "t2", name: "组件回归", owner: "钱二" },
  { id: "t3", name: "文档校订", owner: "孙三" },
];

const tasks = ref<Task[]>([]);
const loading = ref(false);
let timer = 0;

function load(): void {
  window.clearTimeout(timer);
  tasks.value = [];
  loading.value = true;
  timer = window.setTimeout(() => {
    tasks.value = source;
    loading.value = false;
  }, 1200);
}

function reset(): void {
  window.clearTimeout(timer);
  tasks.value = [];
  loading.value = false;
}

// 表体为空与否按 rows 推导，不必另写 empty
const rows = computed(() => tasks.value.map(t => ({ id: t.id })));
</script>

<template>
  <div style="width: 100%; max-width: 480px; display: grid; gap: 12px">
    <div style="display: flex; gap: 8px">
      <button type="button" @click="load">取数</button>
      <button type="button" @click="reset">清空</button>
    </div>

    <XhTableRoot :columns="columns" :rows="rows" :loading="loading">
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            {{ col.label }}
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="t in tasks" :key="t.id" :value="t.id">
          <XhTableCell value="name">{{ t.name }}</XhTableCell>
          <XhTableCell value="owner">{{ t.owner }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
      <XhTableLoading>正在取数…</XhTableLoading>
      <XhTableEmpty>还没有任务，点「取数」拉一份。</XhTableEmpty>
    </XhTableRoot>
  </div>
</template>
```

```html
<div id="table-states" style="width: 100%; max-width: 480px; display: grid; gap: 12px">
  <div style="display: flex; gap: 8px">
    <button type="button" id="table-states-load">取数</button>
    <button type="button" id="table-states-reset">清空</button>
  </div>

  <xh-table id="table-states-table">
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="name">任务</div>
          <div data-xh-part="column-header" value="owner">负责人</div>
        </div>
      </div>
      <div data-xh-part="body"></div>
      <div data-xh-part="loading">正在取数…</div>
      <div data-xh-part="empty">还没有任务，点「取数」拉一份。</div>
    </div>
  </xh-table>
</div>

<script type="module">
  const source = [
    { id: "t1", name: "构建流水线", owner: "赵一" },
    { id: "t2", name: "组件回归", owner: "钱二" },
    { id: "t3", name: "文档校订", owner: "孙三" },
  ];

  const stage = document.getElementById("table-states");
  const table = stage.querySelector("#table-states-table");
  const body = table.querySelector('[data-xh-part="body"]');

  table.columns = [
    { id: "name", label: "任务", width: "10rem" },
    { id: "owner", label: "负责人" },
  ];

  // 表体为空与否按 rows 推导，不必另写 empty
  function setTasks(tasks) {
    body.replaceChildren(
      ...tasks.map((task) => {
        const row = document.createElement("div");
        row.dataset.xhPart = "row";
        row.setAttribute("value", task.id);
        for (const [id, text] of [
          ["name", task.name],
          ["owner", task.owner],
        ]) {
          const cell = document.createElement("div");
          cell.dataset.xhPart = "cell";
          cell.setAttribute("value", id);
          cell.textContent = text;
          row.append(cell);
        }
        return row;
      }),
    );
    table.rows = tasks.map((task) => ({ id: task.id }));
  }

  let timer = 0;

  stage.querySelector("#table-states-load").addEventListener("click", () => {
    window.clearTimeout(timer);
    setTasks([]);
    table.loading = true;
    timer = window.setTimeout(() => {
      setTasks(source);
      table.loading = false;
    }, 1200);
  });

  stage.querySelector("#table-states-reset").addEventListener("click", () => {
    window.clearTimeout(timer);
    setTasks([]);
    table.loading = false;
  });

  setTasks([]);
</script>
```

### 脚注合计

footer 把行号空间的最后一行留给脚注；脚注单元格不属于任何数据行，也就没有选中与禁用可言

```vue
<script setup lang="ts">
import {
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnHeader,
  XhTableFooter,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";
import { computed } from "vue";

const columns = [
  { id: "item", label: "条目", width: "10rem" },
  { id: "count", label: "数量", width: "5rem" },
  { id: "amount", label: "金额" },
];

const lines = [
  { id: "l1", item: "键盘", count: 2, amount: 1280 },
  { id: "l2", item: "鼠标", count: 3, amount: 447 },
  { id: "l3", item: "显示器支架", count: 1, amount: 320 },
];

const rows = lines.map(l => ({ id: l.id }));

const totalCount = computed(() => lines.reduce((sum, l) => sum + l.count, 0));
const totalAmount = computed(() => lines.reduce((sum, l) => sum + l.amount, 0));
</script>

<template>
  <div style="width: 100%; max-width: 560px">
    <XhTableRoot :columns="columns" :rows="rows" footer>
      <XhTableCaption>采购清单</XhTableCaption>
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            {{ col.label }}
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="l in lines" :key="l.id" :value="l.id">
          <XhTableCell value="item">{{ l.item }}</XhTableCell>
          <XhTableCell value="count">{{ l.count }}</XhTableCell>
          <XhTableCell value="amount">¥ {{ l.amount }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
      <XhTableFooter>
        <!-- 脚注行不给 value：它占的是行号空间的最后一行 -->
        <XhTableRow>
          <XhTableCell value="item">合计</XhTableCell>
          <XhTableCell value="count">{{ totalCount }}</XhTableCell>
          <XhTableCell value="amount">¥ {{ totalAmount }}</XhTableCell>
        </XhTableRow>
      </XhTableFooter>
    </XhTableRoot>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 560px">
  <xh-table id="table-footer" footer>
    <div data-xh-part="root">
      <div data-xh-part="caption">采购清单</div>
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="item">条目</div>
          <div data-xh-part="column-header" value="count">数量</div>
          <div data-xh-part="column-header" value="amount">金额</div>
        </div>
      </div>
      <div data-xh-part="body">
        <div data-xh-part="row" value="l1">
          <div data-xh-part="cell" value="item">键盘</div>
          <div data-xh-part="cell" value="count">2</div>
          <div data-xh-part="cell" value="amount">¥ 1280</div>
        </div>
        <div data-xh-part="row" value="l2">
          <div data-xh-part="cell" value="item">鼠标</div>
          <div data-xh-part="cell" value="count">3</div>
          <div data-xh-part="cell" value="amount">¥ 447</div>
        </div>
        <div data-xh-part="row" value="l3">
          <div data-xh-part="cell" value="item">显示器支架</div>
          <div data-xh-part="cell" value="count">1</div>
          <div data-xh-part="cell" value="amount">¥ 320</div>
        </div>
      </div>
      <div data-xh-part="footer">
        <!-- 脚注行不给 value：它占的是行号空间的最后一行 -->
        <div data-xh-part="row">
          <div data-xh-part="cell" value="item">合计</div>
          <div data-xh-part="cell" value="count">6</div>
          <div data-xh-part="cell" value="amount">¥ 2047</div>
        </div>
      </div>
    </div>
  </xh-table>
</div>

<script type="module">
  const table = document.getElementById("table-footer");

  table.columns = [
    { id: "item", label: "条目", width: "10rem" },
    { id: "count", label: "数量", width: "5rem" },
    { id: "amount", label: "金额" },
  ];
  table.rows = [{ id: "l1" }, { id: "l2" }, { id: "l3" }];
</script>
```

### 表头吸顶与列吸附

root 自己就是那个滚动容器：stickyHeader 钉住表头，列上标 sticky 的钉住那一列

```vue
<script setup lang="ts">
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
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
  id: `u${i + 1}`,
  name: `员工 ${i + 1}`,
  dept: depts[i % depts.length],
  city: cities[i % cities.length],
  ext: `8${(100 + i).toString()}`,
  mail: `member${i + 1}@example.com`,
}));

const rows = members.map(m => ({ id: m.id }));
</script>

<template>
  <div style="width: 100%; max-width: 420px">
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
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 420px">
  <xh-table id="table-sticky" sticky-header>
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="name">姓名</div>
          <div data-xh-part="column-header" value="dept">部门</div>
          <div data-xh-part="column-header" value="city">城市</div>
          <div data-xh-part="column-header" value="ext">分机</div>
          <div data-xh-part="column-header" value="mail">邮箱</div>
        </div>
      </div>
      <div data-xh-part="body"></div>
    </div>
  </xh-table>
</div>

<script type="module">
  const table = document.getElementById("table-sticky");
  const body = table.querySelector('[data-xh-part="body"]');

  // 首列吸附，其余列给足宽度让表格横向溢出，滚起来才看得出钉住的效果
  table.columns = [
    { id: "name", label: "姓名", width: "7rem", sticky: true },
    { id: "dept", label: "部门", width: "9rem" },
    { id: "city", label: "城市", width: "7rem" },
    { id: "ext", label: "分机", width: "7rem" },
    { id: "mail", label: "邮箱", width: "13rem" },
  ];

  const depts = ["平台研发", "前端体验", "基础架构", "质量保障"];
  const cities = ["杭州", "上海", "北京", "成都"];

  const members = Array.from({ length: 16 }, (_, i) => ({
    id: `u${i + 1}`,
    name: `员工 ${i + 1}`,
    dept: depts[i % depts.length],
    city: cities[i % cities.length],
    ext: `8${(100 + i).toString()}`,
    mail: `member${i + 1}@example.com`,
  }));

  // 行数多，行节点由脚本逐条写进表体
  for (const member of members) {
    const row = document.createElement("div");
    row.dataset.xhPart = "row";
    row.setAttribute("value", member.id);
    for (const id of ["name", "dept", "city", "ext", "mail"]) {
      const cell = document.createElement("div");
      cell.dataset.xhPart = "cell";
      cell.setAttribute("value", id);
      cell.textContent = member[id];
      row.append(cell);
    }
    body.append(row);
  }

  table.rows = members.map((m) => ({ id: m.id }));
</script>
```

### 单选

selectionMode 给 single：选中集合最多一个元素，点已选中的那行再点一次就清空，焦点行按空格同理

```vue
<script setup lang="ts">
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableRowSelectTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 单选下全选把手不生效，表头那一格空着即可
const columns = [
  { id: "select", width: "3rem" },
  { id: "plan", label: "套餐", width: "8rem" },
  { id: "price", label: "价格" },
];

const plans = [
  { id: "p1", plan: "入门版", price: "¥ 0 / 月" },
  { id: "p2", plan: "团队版", price: "¥ 99 / 月" },
  { id: "p3", plan: "企业版", price: "¥ 399 / 月" },
];

const rows = plans.map(p => ({ id: p.id }));

const selection = ref<string[]>(["p2"]);
</script>

<template>
  <div style="width: 100%; max-width: 480px; display: grid; gap: 12px">
    <XhTableRoot
      v-model:selection="selection"
      :columns="columns"
      :rows="rows"
      selection-mode="single"
    >
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader value="select" />
          <XhTableColumnHeader value="plan">套餐</XhTableColumnHeader>
          <XhTableColumnHeader value="price">价格</XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="p in plans" :key="p.id" :value="p.id">
          <XhTableCell value="select">
            <XhTableRowSelectTrigger>●</XhTableRowSelectTrigger>
          </XhTableCell>
          <XhTableCell value="plan">{{ p.plan }}</XhTableCell>
          <XhTableCell value="price">{{ p.price }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span>已选：{{ selection.length ? selection.join("、") : "（无）" }}</span>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 480px; display: grid; gap: 12px">
  <xh-table id="table-single" selection-mode="single">
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row">
          <!-- 单选下全选把手不生效，表头那一格空着即可 -->
          <div data-xh-part="column-header" value="select"></div>
          <div data-xh-part="column-header" value="plan">套餐</div>
          <div data-xh-part="column-header" value="price">价格</div>
        </div>
      </div>
      <div data-xh-part="body">
        <div data-xh-part="row" value="p1">
          <div data-xh-part="cell" value="select">
            <span data-xh-part="row-select-trigger">●</span>
          </div>
          <div data-xh-part="cell" value="plan">入门版</div>
          <div data-xh-part="cell" value="price">¥ 0 / 月</div>
        </div>
        <div data-xh-part="row" value="p2">
          <div data-xh-part="cell" value="select">
            <span data-xh-part="row-select-trigger">●</span>
          </div>
          <div data-xh-part="cell" value="plan">团队版</div>
          <div data-xh-part="cell" value="price">¥ 99 / 月</div>
        </div>
        <div data-xh-part="row" value="p3">
          <div data-xh-part="cell" value="select">
            <span data-xh-part="row-select-trigger">●</span>
          </div>
          <div data-xh-part="cell" value="plan">企业版</div>
          <div data-xh-part="cell" value="price">¥ 399 / 月</div>
        </div>
      </div>
    </div>
  </xh-table>
  <span id="table-single-value"></span>
</div>

<script type="module">
  const table = document.getElementById("table-single");
  const readout = document.getElementById("table-single-value");

  table.columns = [
    { id: "select", width: "3rem" },
    { id: "plan", label: "套餐", width: "8rem" },
    { id: "price", label: "价格" },
  ];
  table.rows = [{ id: "p1" }, { id: "p2" }, { id: "p3" }];

  function apply(selection) {
    table.selection = selection;
    readout.textContent = `已选：${selection.length ? selection.join("、") : "（无）"}`;
  }

  apply(["p2"]);
  table.addEventListener("selection-change", (event) => apply(event.detail.value));
</script>
```

### 跨列单元格

colspan 从它自己那一列往后算，报成 aria-colspan；1 与省略同义，所以只在真跨了列时写

```vue
<script setup lang="ts">
import {
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";

const columns = [
  { id: "team", label: "小组", width: "8rem" },
  { id: "h1", label: "上半年" },
  { id: "h2", label: "下半年" },
];

const teams = [
  { id: "t1", team: "平台研发", h1: "42", h2: "51" },
  { id: "t2", team: "前端体验", h1: "36", h2: "39" },
];

// 汇总行也占一个行号，只是它那格横跨了两列
const rows = [...teams.map(t => ({ id: t.id })), { id: "sum" }];
</script>

<template>
  <div style="width: 100%; max-width: 520px">
    <XhTableRoot :columns="columns" :rows="rows">
      <XhTableCaption>交付单量</XhTableCaption>
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            {{ col.label }}
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="t in teams" :key="t.id" :value="t.id">
          <XhTableCell value="team">{{ t.team }}</XhTableCell>
          <XhTableCell value="h1">{{ t.h1 }}</XhTableCell>
          <XhTableCell value="h2">{{ t.h2 }}</XhTableCell>
        </XhTableRow>
        <XhTableRow value="sum">
          <XhTableCell value="team">全年</XhTableCell>
          <!-- 从 h1 起跨两列，这一行因此只写两个格子 -->
          <XhTableCell value="h1" :colspan="2">168</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 520px">
  <xh-table id="table-colspan">
    <div data-xh-part="root">
      <div data-xh-part="caption">交付单量</div>
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="team">小组</div>
          <div data-xh-part="column-header" value="h1">上半年</div>
          <div data-xh-part="column-header" value="h2">下半年</div>
        </div>
      </div>
      <div data-xh-part="body">
        <div data-xh-part="row" value="t1">
          <div data-xh-part="cell" value="team">平台研发</div>
          <div data-xh-part="cell" value="h1">42</div>
          <div data-xh-part="cell" value="h2">51</div>
        </div>
        <div data-xh-part="row" value="t2">
          <div data-xh-part="cell" value="team">前端体验</div>
          <div data-xh-part="cell" value="h1">36</div>
          <div data-xh-part="cell" value="h2">39</div>
        </div>
        <div data-xh-part="row" value="sum">
          <div data-xh-part="cell" value="team">全年</div>
          <!-- 从 h1 起跨两列，这一行因此只写两个格子 -->
          <div data-xh-part="cell" value="h1" colspan="2">168</div>
        </div>
      </div>
    </div>
  </xh-table>
</div>

<script type="module">
  const table = document.getElementById("table-colspan");

  table.columns = [
    { id: "team", label: "小组", width: "8rem" },
    { id: "h1", label: "上半年" },
    { id: "h2", label: "下半年" },
  ];
  // 汇总行也占一个行号，只是它那格横跨了两列
  table.rows = [{ id: "t1" }, { id: "t2" }, { id: "sum" }];
</script>
```

### 单元格就地编辑

表体的方向键与 Home/End 是挂在 body 上的冒泡监听，可编辑控件上掐断冒泡这些键就回归输入框自己

```vue
<script setup lang="ts">
import {
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";
import { ref } from "vue";

const columns = [
  { id: "item", label: "条目", width: "9rem" },
  { id: "count", label: "数量", width: "6rem" },
  { id: "note", label: "备注" },
];

const lines = ref([
  { id: "l1", item: "键盘", count: 2, note: "机械轴" },
  { id: "l2", item: "鼠标", count: 3, note: "无线" },
  { id: "l3", item: "显示器支架", count: 1, note: "" },
]);

// 行序不随编辑变化，rows 取一次即可
const rows = lines.value.map(line => ({ id: line.id }));

// Escape 把焦点交还所在行，表体的方向键随即恢复
function onEditKeydown(event: KeyboardEvent): void {
  if (event.key !== "Escape")
    return;
  const input = event.currentTarget as HTMLElement;
  input.closest<HTMLElement>("[data-part='row']")?.focus();
}
</script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
    <XhTableRoot :columns="columns" :rows="rows">
      <XhTableCaption>采购清单</XhTableCaption>
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            {{ col.label }}
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="line in lines" :key="line.id" :value="line.id">
          <XhTableCell value="item">{{ line.item }}</XhTableCell>
          <XhTableCell value="count">
            <!-- keydown 掐断冒泡：不然上下键与 Home/End 会被表体收走去搬焦点行 -->
            <input
              v-model.number="line.count"
              type="number"
              min="0"
              :aria-label="`${line.item} 数量`"
              style="inline-size: 100%; min-inline-size: 0"
              @keydown.stop="onEditKeydown"
            >
          </XhTableCell>
          <XhTableCell value="note">
            <input
              v-model="line.note"
              type="text"
              placeholder="可以打空格"
              :aria-label="`${line.item} 备注`"
              style="inline-size: 100%; min-inline-size: 0"
              @keydown.stop="onEditKeydown"
            >
          </XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span>
      合计 {{ lines.reduce((sum, line) => sum + (line.count || 0), 0) }} 件
    </span>
  </div>
</template>
```

```html
<div id="table-edit" style="width: 100%; max-width: 560px; display: grid; gap: 12px">
  <xh-table id="table-edit-table">
    <div data-xh-part="root">
      <div data-xh-part="caption">采购清单</div>
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="item">条目</div>
          <div data-xh-part="column-header" value="count">数量</div>
          <div data-xh-part="column-header" value="note">备注</div>
        </div>
      </div>
      <div data-xh-part="body">
        <div data-xh-part="row" value="l1">
          <div data-xh-part="cell" value="item">键盘</div>
          <div data-xh-part="cell" value="count">
            <input
              type="number"
              min="0"
              value="2"
              aria-label="键盘 数量"
              data-count
              style="inline-size: 100%; min-inline-size: 0"
            />
          </div>
          <div data-xh-part="cell" value="note">
            <input
              type="text"
              value="机械轴"
              placeholder="可以打空格"
              aria-label="键盘 备注"
              style="inline-size: 100%; min-inline-size: 0"
            />
          </div>
        </div>
        <div data-xh-part="row" value="l2">
          <div data-xh-part="cell" value="item">鼠标</div>
          <div data-xh-part="cell" value="count">
            <input
              type="number"
              min="0"
              value="3"
              aria-label="鼠标 数量"
              data-count
              style="inline-size: 100%; min-inline-size: 0"
            />
          </div>
          <div data-xh-part="cell" value="note">
            <input
              type="text"
              value="无线"
              placeholder="可以打空格"
              aria-label="鼠标 备注"
              style="inline-size: 100%; min-inline-size: 0"
            />
          </div>
        </div>
        <div data-xh-part="row" value="l3">
          <div data-xh-part="cell" value="item">显示器支架</div>
          <div data-xh-part="cell" value="count">
            <input
              type="number"
              min="0"
              value="1"
              aria-label="显示器支架 数量"
              data-count
              style="inline-size: 100%; min-inline-size: 0"
            />
          </div>
          <div data-xh-part="cell" value="note">
            <input
              type="text"
              value=""
              placeholder="可以打空格"
              aria-label="显示器支架 备注"
              style="inline-size: 100%; min-inline-size: 0"
            />
          </div>
        </div>
      </div>
    </div>
  </xh-table>
  <span id="table-edit-total"></span>
</div>

<script type="module">
  const stage = document.getElementById("table-edit");
  const table = stage.querySelector("#table-edit-table");
  const total = stage.querySelector("#table-edit-total");

  table.columns = [
    { id: "item", label: "条目", width: "9rem" },
    { id: "count", label: "数量", width: "6rem" },
    { id: "note", label: "备注" },
  ];
  // 行序不随编辑变化，rows 给一次即可
  table.rows = [{ id: "l1" }, { id: "l2" }, { id: "l3" }];

  const counts = [...table.querySelectorAll("input[data-count]")];

  function sum() {
    total.textContent = `合计 ${counts.reduce((n, input) => n + (Number(input.value) || 0), 0)} 件`;
  }

  for (const input of table.querySelectorAll("input")) {
    // 掐断冒泡：不然上下键与 Home/End 会被表体收走去搬焦点行
    input.addEventListener("keydown", (event) => {
      event.stopPropagation();
      // Escape 把焦点交还所在行，表体的方向键随即恢复
      if (event.key === "Escape")
        event.currentTarget.closest('[data-xh-part="row"]').focus();
    });
    input.addEventListener("input", sum);
  }

  sum();
</script>
```

### 多行表头与表头分组

表头写几行就是几行；分组格的跨列数与两行表头的行号由标记自报，columns 仍只登记叶子列

```vue
<script setup lang="ts">
import {
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";

// 只有叶子列进 columns：列号与列总数按它算
const columns = [
  { id: "team", label: "小组", width: "8rem" },
  { id: "q1", label: "Q1", width: "5rem" },
  { id: "q2", label: "Q2", width: "5rem" },
  { id: "q3", label: "Q3", width: "5rem" },
  { id: "q4", label: "Q4", width: "5rem" },
];

const teams = [
  { id: "t1", team: "平台研发", q1: 12, q2: 15, q3: 18, q4: 21 },
  { id: "t2", team: "前端体验", q1: 9, q2: 11, q3: 14, q4: 16 },
  { id: "t3", team: "基础架构", q1: 7, q2: 8, q3: 10, q4: 12 },
];

const rows = teams.map(t => ({ id: t.id }));

// 分组格宽度取两列之和，伸缩系数也翻倍，两行表头才对得齐
const groupStyle = { inlineSize: "10rem", flexGrow: 2 };
</script>

<template>
  <div style="width: 100%; max-width: 620px">
    <!-- 表头占两行，行号空间比缺省的多一行，总行数在这里自报 -->
    <XhTableRoot :columns="columns" :rows="rows" :aria-rowcount="teams.length + 2">
      <XhTableCaption>季度交付单量</XhTableCaption>
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader value="team" />
          <XhTableColumnHeader value="q1" :style="groupStyle" :aria-colspan="2">
            上半年
          </XhTableColumnHeader>
          <XhTableColumnHeader value="q3" :style="groupStyle" :aria-colspan="2">
            下半年
          </XhTableColumnHeader>
        </XhTableRow>
        <!-- 第二行表头自报行号：缺省那条恒为 1 -->
        <XhTableRow :aria-rowindex="2">
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            {{ col.label }}
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <!-- 数据行也往后挪一行 -->
        <XhTableRow
          v-for="(t, i) in teams"
          :key="t.id"
          :value="t.id"
          :aria-rowindex="i + 3"
        >
          <XhTableCell value="team">{{ t.team }}</XhTableCell>
          <XhTableCell value="q1">{{ t.q1 }}</XhTableCell>
          <XhTableCell value="q2">{{ t.q2 }}</XhTableCell>
          <XhTableCell value="q3">{{ t.q3 }}</XhTableCell>
          <XhTableCell value="q4">{{ t.q4 }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 620px">
  <xh-table id="table-group-header">
    <div data-xh-part="root">
      <div data-xh-part="caption">季度交付单量</div>
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="team"></div>
          <!-- 分组格不是数据列，不进 columns：跨列数、列号与宽度都写在标记上，
               宽度取两列之和、伸缩系数也翻倍，两行表头才对得齐 -->
          <div
            data-xh-part="column-header"
            value="h1"
            aria-colindex="2"
            aria-colspan="2"
            style="inline-size: 10rem; flex-grow: 2"
          >
            上半年
          </div>
          <div
            data-xh-part="column-header"
            value="h2"
            aria-colindex="4"
            aria-colspan="2"
            style="inline-size: 10rem; flex-grow: 2"
          >
            下半年
          </div>
        </div>
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="team">小组</div>
          <div data-xh-part="column-header" value="q1">Q1</div>
          <div data-xh-part="column-header" value="q2">Q2</div>
          <div data-xh-part="column-header" value="q3">Q3</div>
          <div data-xh-part="column-header" value="q4">Q4</div>
        </div>
      </div>
      <div data-xh-part="body">
        <div data-xh-part="row" value="t1">
          <div data-xh-part="cell" value="team">平台研发</div>
          <div data-xh-part="cell" value="q1">12</div>
          <div data-xh-part="cell" value="q2">15</div>
          <div data-xh-part="cell" value="q3">18</div>
          <div data-xh-part="cell" value="q4">21</div>
        </div>
        <div data-xh-part="row" value="t2">
          <div data-xh-part="cell" value="team">前端体验</div>
          <div data-xh-part="cell" value="q1">9</div>
          <div data-xh-part="cell" value="q2">11</div>
          <div data-xh-part="cell" value="q3">14</div>
          <div data-xh-part="cell" value="q4">16</div>
        </div>
        <div data-xh-part="row" value="t3">
          <div data-xh-part="cell" value="team">基础架构</div>
          <div data-xh-part="cell" value="q1">7</div>
          <div data-xh-part="cell" value="q2">8</div>
          <div data-xh-part="cell" value="q3">10</div>
          <div data-xh-part="cell" value="q4">12</div>
        </div>
      </div>
    </div>
  </xh-table>
</div>

<script type="module">
  // 只有叶子列进 columns：列号与列总数按它算
  const table = document.getElementById("table-group-header");

  table.columns = [
    { id: "team", label: "小组", width: "8rem" },
    { id: "q1", label: "Q1", width: "5rem" },
    { id: "q2", label: "Q2", width: "5rem" },
    { id: "q3", label: "Q3", width: "5rem" },
    { id: "q4", label: "Q4", width: "5rem" },
  ];
  table.rows = [{ id: "t1" }, { id: "t2" }, { id: "t3" }];
</script>
```

### 列过滤

过滤把手是列标题里的一段内容，过滤结果就是宿主算好后传进来的那份 rows；表头是表体的兄弟，把手上的按键不会被表体收走

```vue
<script setup lang="ts">
import { ChevronDownIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableEmpty,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const columns = [
  { id: "name", label: "姓名", width: "7rem" },
  { id: "dept", label: "部门", width: "9rem" },
  { id: "city", label: "城市" },
];

const members = [
  { id: "u1", name: "赵一", dept: "平台研发", city: "杭州" },
  { id: "u2", name: "钱二", dept: "前端体验", city: "上海" },
  { id: "u3", name: "孙三", dept: "基础架构", city: "北京" },
  { id: "u4", name: "李四", dept: "前端体验", city: "杭州" },
  { id: "u5", name: "周五", dept: "质量保障", city: "成都" },
  { id: "u6", name: "吴六", dept: "平台研发", city: "上海" },
];

const deptOptions = [...new Set(members.map(m => m.dept))];
const cityOptions = [...new Set(members.map(m => m.city))];

// 过滤态由宿主持有，一个都没勾就是不过滤
const deptFilter = ref<string[]>([]);
const cityFilter = ref<string[]>([]);

const visible = computed(() =>
  members.filter(
    m =>
      (deptFilter.value.length === 0 || deptFilter.value.includes(m.dept))
      && (cityFilter.value.length === 0 || cityFilter.value.includes(m.city)),
  ),
);

// 行序的事实源跟着过滤结果走
const rows = computed(() => visible.value.map(m => ({ id: m.id })));

const menuStyle = { display: "grid", gap: "6px", minInlineSize: "8rem" };
const optionStyle = { display: "flex", alignItems: "center", gap: "6px" };
</script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
    <XhTableRoot :columns="columns" :rows="rows">
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader value="name">姓名</XhTableColumnHeader>
          <XhTableColumnHeader value="dept">
            部门
            <XhPopoverRoot placement="bottom-start" size="sm">
              <XhPopoverTrigger aria-label="按部门过滤">
                <XhIcon :icon="ChevronDownIcon" />{{ deptFilter.length ? "●" : "" }}
              </XhPopoverTrigger>
              <XhPopoverPositioner>
                <XhPopoverContent>
                  <XhPopoverTitle>按部门过滤</XhPopoverTitle>
                  <div :style="menuStyle">
                    <label v-for="d in deptOptions" :key="d" :style="optionStyle">
                      <input v-model="deptFilter" type="checkbox" :value="d">
                      {{ d }}
                    </label>
                    <button type="button" @click="deptFilter = []">不限</button>
                  </div>
                </XhPopoverContent>
              </XhPopoverPositioner>
            </XhPopoverRoot>
          </XhTableColumnHeader>
          <XhTableColumnHeader value="city">
            城市
            <XhPopoverRoot placement="bottom-start" size="sm">
              <XhPopoverTrigger aria-label="按城市过滤">
                <XhIcon :icon="ChevronDownIcon" />{{ cityFilter.length ? "●" : "" }}
              </XhPopoverTrigger>
              <XhPopoverPositioner>
                <XhPopoverContent>
                  <XhPopoverTitle>按城市过滤</XhPopoverTitle>
                  <div :style="menuStyle">
                    <label v-for="c in cityOptions" :key="c" :style="optionStyle">
                      <input v-model="cityFilter" type="checkbox" :value="c">
                      {{ c }}
                    </label>
                    <button type="button" @click="cityFilter = []">不限</button>
                  </div>
                </XhPopoverContent>
              </XhPopoverPositioner>
            </XhPopoverRoot>
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="m in visible" :key="m.id" :value="m.id">
          <XhTableCell value="name">{{ m.name }}</XhTableCell>
          <XhTableCell value="dept">{{ m.dept }}</XhTableCell>
          <XhTableCell value="city">{{ m.city }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
      <XhTableEmpty>这组条件下没有人。</XhTableEmpty>
    </XhTableRoot>
    <span>
      命中 {{ visible.length }} / {{ members.length }} 人 · 部门：{{
        deptFilter.length ? deptFilter.join("、") : "不限"
      }}
      · 城市：{{ cityFilter.length ? cityFilter.join("、") : "不限" }}
    </span>
  </div>
</template>
```

```html
<div id="table-filter" style="width: 100%; max-width: 560px; display: grid; gap: 12px">
  <xh-table id="table-filter-table">
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="name">姓名</div>
          <div data-xh-part="column-header" value="dept">
            部门
            <xh-popover placement="bottom-start" size="sm">
              <button data-xh-part="trigger" aria-label="按部门过滤" data-mark><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9L12 15L18 9"/></svg></button>
              <div data-xh-part="positioner">
                <div data-xh-part="content">
                  <h2 data-xh-part="title">按部门过滤</h2>
                  <div style="display: grid; gap: 6px; min-inline-size: 8rem">
                    <label style="display: flex; align-items: center; gap: 6px">
                      <input type="checkbox" data-filter="dept" value="平台研发" />
                      平台研发
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px">
                      <input type="checkbox" data-filter="dept" value="前端体验" />
                      前端体验
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px">
                      <input type="checkbox" data-filter="dept" value="基础架构" />
                      基础架构
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px">
                      <input type="checkbox" data-filter="dept" value="质量保障" />
                      质量保障
                    </label>
                    <button type="button" data-clear="dept">不限</button>
                  </div>
                </div>
              </div>
            </xh-popover>
          </div>
          <div data-xh-part="column-header" value="city">
            城市
            <xh-popover placement="bottom-start" size="sm">
              <button data-xh-part="trigger" aria-label="按城市过滤" data-mark></button>
              <div data-xh-part="positioner">
                <div data-xh-part="content">
                  <h2 data-xh-part="title">按城市过滤</h2>
                  <div style="display: grid; gap: 6px; min-inline-size: 8rem">
                    <label style="display: flex; align-items: center; gap: 6px">
                      <input type="checkbox" data-filter="city" value="杭州" />
                      杭州
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px">
                      <input type="checkbox" data-filter="city" value="上海" />
                      上海
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px">
                      <input type="checkbox" data-filter="city" value="北京" />
                      北京
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px">
                      <input type="checkbox" data-filter="city" value="成都" />
                      成都
                    </label>
                    <button type="button" data-clear="city">不限</button>
                  </div>
                </div>
              </div>
            </xh-popover>
          </div>
        </div>
      </div>
      <div data-xh-part="body"></div>
      <div data-xh-part="empty">这组条件下没有人。</div>
    </div>
  </xh-table>
  <span id="table-filter-value"></span>
</div>

<script type="module">
  const members = [
    { id: "u1", name: "赵一", dept: "平台研发", city: "杭州" },
    { id: "u2", name: "钱二", dept: "前端体验", city: "上海" },
    { id: "u3", name: "孙三", dept: "基础架构", city: "北京" },
    { id: "u4", name: "李四", dept: "前端体验", city: "杭州" },
    { id: "u5", name: "周五", dept: "质量保障", city: "成都" },
    { id: "u6", name: "吴六", dept: "平台研发", city: "上海" },
  ];

  const stage = document.getElementById("table-filter");
  const table = stage.querySelector("#table-filter-table");
  const body = table.querySelector('[data-xh-part="body"]');
  const readout = stage.querySelector("#table-filter-value");

  table.columns = [
    { id: "name", label: "姓名", width: "7rem" },
    { id: "dept", label: "部门", width: "9rem" },
    { id: "city", label: "城市" },
  ];

  // 行节点建一次，过滤只决定谁留在表体里
  const nodes = new Map(
    members.map((m) => {
      const row = document.createElement("div");
      row.dataset.xhPart = "row";
      row.setAttribute("value", m.id);
      for (const id of ["name", "dept", "city"]) {
        const cell = document.createElement("div");
        cell.dataset.xhPart = "cell";
        cell.setAttribute("value", id);
        cell.textContent = m[id];
        row.append(cell);
      }
      return [m.id, row];
    }),
  );

  const boxes = [...stage.querySelectorAll("input[data-filter]")];

  // 过滤态由宿主持有，一个都没勾就是不过滤
  function picked(field) {
    return boxes.filter((b) => b.dataset.filter === field && b.checked).map((b) => b.value);
  }

  function render() {
    const dept = picked("dept");
    const city = picked("city");
    const visible = members.filter(
      (m) =>
        (dept.length === 0 || dept.includes(m.dept)) &&
        (city.length === 0 || city.includes(m.city)),
    );

    // 行序的事实源跟着过滤结果走
    table.rows = visible.map((m) => ({ id: m.id }));
    body.replaceChildren(...visible.map((m) => nodes.get(m.id)));

    for (const mark of stage.querySelectorAll("[data-mark]")) {
      const field = mark.closest('[data-xh-part="column-header"]').getAttribute("value");
      mark.innerHTML = `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9L12 15L18 9"/></svg>${picked(field).length ? "●" : ""}`;
    }

    readout.textContent = `命中 ${visible.length} / ${members.length} 人 · 部门：${
      dept.length ? dept.join("、") : "不限"
    } · 城市：${city.length ? city.join("、") : "不限"}`;
  }

  for (const box of boxes) box.addEventListener("change", render);

  for (const clear of stage.querySelectorAll("[data-clear]")) {
    clear.addEventListener("click", () => {
      for (const box of boxes) {
        if (box.dataset.filter === clear.dataset.clear) box.checked = false;
      }
      render();
    });
  }

  render();
</script>
```

### 树形表格

rows 按契约就是一条已摊平的可见行序列：层级三件套逐行自报，缩进落在首格的内边距上

```vue
<script setup lang="ts">
import { ChevronRightIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

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
      if (open)
        walk(node.children!, level + 1);
    });
  };
  walk(tree, 1);
  return out;
});

const rows = computed(() => flat.value.map(row => ({ id: row.id })));

function toggle(id: string): void {
  expanded.value = expanded.value.includes(id)
    ? expanded.value.filter(v => v !== id)
    : [...expanded.value, id];
}

// 焦点行是父级时左右方向键切换开合；连接层遇到不可展开的行原样放行这两个键
function onBodyKeydown(event: KeyboardEvent, focused: string | null): void {
  if (focused == null)
    return;
  const row = flat.value.find(r => r.id === focused);
  if (!row?.branch)
    return;
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
</script>

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
            :style="{ paddingInlineStart: `${row.level * 16}px` }"
          >
            <!-- 开合箭头只服务指针，键盘那一路走左右方向键，因此对读屏隐藏 -->
            <span
              v-if="row.branch"
              aria-hidden="true"
              :style="twistyStyle"
              @click="toggle(row.id)"
            >
              <XhIcon
                :icon="ChevronRightIcon"
                :style="{ rotate: row.open ? '90deg' : '0deg' }"
              />
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
```

```html
<div id="table-tree-rows" style="width: 100%; max-width: 520px; display: grid; gap: 12px">
  <xh-table data-host>
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="name">组织</div>
          <div data-xh-part="column-header" value="owner">负责人</div>
        </div>
      </div>
      <div data-xh-part="body" data-body></div>
    </div>
  </xh-table>
  <span data-readout></span>
</div>

<script type="module">
  const scope = document.getElementById("table-tree-rows");
  const table = scope.querySelector("[data-host]");
  const body = scope.querySelector("[data-body]");
  const readout = scope.querySelector("[data-readout]");

  table.columns = [
    { id: "name", label: "组织", width: "13rem" },
    { id: "owner", label: "负责人" },
  ];

  const tree = [
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

  let expanded = ["rd"];

  // 收起分支的子树整段不出现在序列里，行号因此永远连续
  function flatten() {
    const out = [];
    const walk = (nodes, level) => {
      nodes.forEach((node, i) => {
        const branch = !!node.children?.length;
        const open = branch && expanded.includes(node.id);
        out.push({ ...node, level, pos: i + 1, size: nodes.length, branch, open });
        if (open) walk(node.children, level + 1);
      });
    };
    walk(tree, 1);
    return out;
  }

  const TWISTY_STYLE =
    "display: inline-flex; flex: none; align-items: center; justify-content: center; inline-size: 1rem; block-size: 1rem";
  const CHEVRON = `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6L15 12L9 18"/></svg>`;

  function rowNode(row) {
    const el = document.createElement("div");
    el.dataset.xhPart = "row";
    el.setAttribute("value", row.id);
    // 层级三件套逐行自报：摊平的序列在 DOM 上不嵌套，层级只能这样说出来
    el.setAttribute("aria-level", String(row.level));
    el.setAttribute("aria-posinset", String(row.pos));
    el.setAttribute("aria-setsize", String(row.size));
    if (row.branch) el.setAttribute("aria-expanded", String(row.open));

    const name = document.createElement("div");
    name.dataset.xhPart = "cell";
    name.setAttribute("value", "name");
    // 缩进是首格的内边距，与层级号同源
    name.style.paddingInlineStart = `${row.level * 16}px`;
    // 开合箭头只服务指针，键盘那一路走左右方向键，因此对读屏隐藏
    const twisty = document.createElement("span");
    twisty.setAttribute("aria-hidden", "true");
    twisty.setAttribute("style", TWISTY_STYLE);
    if (row.branch) {
      twisty.dataset.twisty = row.id;
      twisty.style.cursor = "pointer";
      twisty.style.rotate = row.open ? "90deg" : "0deg";
      twisty.innerHTML = CHEVRON;
    }
    name.append(twisty, row.label);

    const owner = document.createElement("div");
    owner.dataset.xhPart = "cell";
    owner.setAttribute("value", "owner");
    owner.textContent = row.owner;

    el.append(name, owner);
    return el;
  }

  function render() {
    const flat = flatten();
    table.rows = flat.map((row) => ({ id: row.id }));
    body.replaceChildren(...flat.map(rowNode));
    readout.textContent = `展开：${expanded.length ? expanded.join("、") : "（无）"}`;
  }

  function toggle(id) {
    expanded = expanded.includes(id)
      ? expanded.filter((value) => value !== id)
      : [...expanded, id];
    render();
  }

  body.addEventListener("click", (event) => {
    const twisty = event.target.closest("[data-twisty]");
    if (twisty) toggle(twisty.dataset.twisty);
  });

  // 焦点行是父级时左右方向键切换开合；连接层遇到不可展开的行原样放行这两个键
  body.addEventListener("keydown", (event) => {
    const el = event.target.closest('[data-xh-part="row"]');
    if (!el) return;
    const id = el.getAttribute("value");
    const row = flatten().find((item) => item.id === id);
    if (!row?.branch) return;
    const wantOpen = event.key === "ArrowRight";
    const wantClose = event.key === "ArrowLeft";
    if ((wantOpen && !row.open) || (wantClose && row.open)) {
      event.preventDefault();
      toggle(id);
    }
  });

  render();
</script>
```

### 拖拽调列宽

列上标了 resizable 才认改宽把手；拖出表头仍跟手，方向键一次 8px、按住 Shift 一次 40px

```vue
<script setup lang="ts">
import {
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnResizeTrigger,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 列宽写成数字即按 px 处理；minWidth / maxWidth 是拖动的上下限
const columns = [
  { id: "name", label: "姓名", width: 120, resizable: true, minWidth: 72 },
  { id: "dept", label: "部门", width: 150, resizable: true, minWidth: 90, maxWidth: 260 },
  { id: "city", label: "城市", width: 120 },
];

const members = [
  { id: "u1", name: "赵一", dept: "平台研发", city: "杭州" },
  { id: "u2", name: "钱二", dept: "前端体验", city: "上海" },
  { id: "u3", name: "孙三", dept: "基础架构", city: "北京" },
  { id: "u4", name: "李四", dept: "质量保障", city: "成都" },
];

const rows = members.map(m => ({ id: m.id }));

// 改宽落在列偏好里，可以直接存起来下次还原
const preference = ref<Record<string, unknown>>({});
</script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
    <XhTableRoot
      v-model:column-preference="preference"
      :columns="columns"
      :rows="rows"
    >
      <XhTableCaption>拖动列标题右侧那条竖线；也可以 Tab 到它用方向键调</XhTableCaption>
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis">
              {{ col.label }}
            </span>
            <!-- 把手压在两列的接缝上；没标 resizable 的列它自己不显示 -->
            <XhTableColumnResizeTrigger />
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="m in members" :key="m.id" :value="m.id">
          <XhTableCell value="name">{{ m.name }}</XhTableCell>
          <XhTableCell value="dept">{{ m.dept }}</XhTableCell>
          <XhTableCell value="city">{{ m.city }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span>列宽偏好：{{ JSON.stringify(preference.widths ?? {}) }}</span>
  </div>
</template>
```

```html
<div id="table-resize" style="width: 100%; max-width: 560px; display: grid; gap: 12px">
  <xh-table id="table-resize-table">
    <div data-xh-part="root">
      <div data-xh-part="caption">拖动列标题右侧那条竖线；也可以 Tab 到它用方向键调</div>
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="name">
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis">姓名</span>
            <!-- 把手压在两列的接缝上；没标 resizable 的列它自己不显示 -->
            <span data-xh-part="column-resize-trigger" value="name"></span>
          </div>
          <div data-xh-part="column-header" value="dept">
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis">部门</span>
            <span data-xh-part="column-resize-trigger" value="dept"></span>
          </div>
          <div data-xh-part="column-header" value="city">
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis">城市</span>
            <span data-xh-part="column-resize-trigger" value="city"></span>
          </div>
        </div>
      </div>
      <div data-xh-part="body">
        <div data-xh-part="row" value="u1">
          <div data-xh-part="cell" value="name">赵一</div>
          <div data-xh-part="cell" value="dept">平台研发</div>
          <div data-xh-part="cell" value="city">杭州</div>
        </div>
        <div data-xh-part="row" value="u2">
          <div data-xh-part="cell" value="name">钱二</div>
          <div data-xh-part="cell" value="dept">前端体验</div>
          <div data-xh-part="cell" value="city">上海</div>
        </div>
        <div data-xh-part="row" value="u3">
          <div data-xh-part="cell" value="name">孙三</div>
          <div data-xh-part="cell" value="dept">基础架构</div>
          <div data-xh-part="cell" value="city">北京</div>
        </div>
        <div data-xh-part="row" value="u4">
          <div data-xh-part="cell" value="name">李四</div>
          <div data-xh-part="cell" value="dept">质量保障</div>
          <div data-xh-part="cell" value="city">成都</div>
        </div>
      </div>
    </div>
  </xh-table>
  <span id="table-resize-value"></span>
</div>

<script type="module">
  const stage = document.getElementById("table-resize");
  const table = stage.querySelector("#table-resize-table");
  const readout = stage.querySelector("#table-resize-value");

  // 列宽写成数字即按 px 处理；minWidth / maxWidth 是拖动的上下限
  table.columns = [
    { id: "name", label: "姓名", width: 120, resizable: true, minWidth: 72 },
    { id: "dept", label: "部门", width: 150, resizable: true, minWidth: 90, maxWidth: 260 },
    { id: "city", label: "城市", width: 120 },
  ];

  table.rows = [{ id: "u1" }, { id: "u2" }, { id: "u3" }, { id: "u4" }];

  // 改宽落在列偏好里，可以直接存起来下次还原
  table.addEventListener("column-preference-change", (event) => {
    readout.textContent = `列宽偏好：${JSON.stringify(event.detail.value.widths ?? {})}`;
  });

  readout.textContent = "列宽偏好：{}";
</script>
```

### 只渲窗口内的行

全量 rows 照常交给 root（那只是行序与行号的元信息，不产生 DOM），标记里只渲可见那一段，首尾用两块空白撑出真实滚动高度

```vue
<script setup lang="ts">
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const columns = [
  { id: "no", label: "编号", width: "6rem" },
  { id: "name", label: "姓名", width: "8rem" },
  { id: "dept", label: "部门" },
];

const depts = ["平台研发", "前端体验", "基础架构", "质量保障"];

const people = Array.from({ length: 2000 }, (_, i) => ({
  id: `u${i + 1}`,
  no: `#${i + 1}`,
  name: `员工 ${i + 1}`,
  dept: depts[i % depts.length],
}));

// 行号与总数按全量算，与渲染了哪几行无关
const rows = people.map(p => ({ id: p.id }));

// 行高写死才算得出窗口；上下各多渲几行做缓冲
const ROW_H = 36;
const WINDOW = 18;
const OVERSCAN = 4;

const start = ref(0);
const end = computed(() => Math.min(people.length, start.value + WINDOW));
const visible = computed(() => people.slice(start.value, end.value));

const bodyStyle = computed(() => ({
  paddingBlockStart: `${start.value * ROW_H}px`,
  paddingBlockEnd: `${(people.length - end.value) * ROW_H}px`,
}));

const rowStyle = { blockSize: `${ROW_H}px` };

function onScroll(event: Event): void {
  const top = (event.target as HTMLElement).scrollTop;
  const first = Math.floor(top / ROW_H) - OVERSCAN;
  start.value = Math.min(Math.max(0, first), Math.max(0, people.length - WINDOW));
}
</script>

<template>
  <div style="width: 100%; max-width: 520px; display: grid; gap: 12px">
    <!-- root 自己就是那个滚动容器，滚动量直接从它身上读 -->
    <XhTableRoot :columns="columns" :rows="rows" sticky-header @scroll="onScroll">
      <XhTableHeader>
        <XhTableRow :style="rowStyle">
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            {{ col.label }}
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody :style="bodyStyle">
        <XhTableRow v-for="p in visible" :key="p.id" :value="p.id" :style="rowStyle">
          <XhTableCell value="no">{{ p.no }}</XhTableCell>
          <XhTableCell value="name">{{ p.name }}</XhTableCell>
          <XhTableCell value="dept">{{ p.dept }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span>
      共 {{ people.length }} 行，此刻在 DOM 里的是第 {{ start + 1 }} –
      {{ end }} 行
    </span>
  </div>
</template>
```

```html
<div id="table-virtual" style="width: 100%; max-width: 520px; display: grid; gap: 12px">
  <xh-table id="table-virtual-table" sticky-header>
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row" style="block-size: 36px">
          <div data-xh-part="column-header" value="no">编号</div>
          <div data-xh-part="column-header" value="name">姓名</div>
          <div data-xh-part="column-header" value="dept">部门</div>
        </div>
      </div>
      <div data-xh-part="body"></div>
    </div>
  </xh-table>
  <span id="table-virtual-value"></span>
</div>

<script type="module">
  const stage = document.getElementById("table-virtual");
  const table = stage.querySelector("#table-virtual-table");
  // root 自己就是那个滚动容器，滚动量直接从它身上读
  const root = table.querySelector('[data-xh-part="root"]');
  const body = table.querySelector('[data-xh-part="body"]');
  const readout = stage.querySelector("#table-virtual-value");

  const depts = ["平台研发", "前端体验", "基础架构", "质量保障"];
  const people = Array.from({ length: 2000 }, (_, i) => ({
    id: `u${i + 1}`,
    no: `#${i + 1}`,
    name: `员工 ${i + 1}`,
    dept: depts[i % depts.length],
  }));

  table.columns = [
    { id: "no", label: "编号", width: "6rem" },
    { id: "name", label: "姓名", width: "8rem" },
    { id: "dept", label: "部门" },
  ];
  // 行号与总数按全量算，与渲染了哪几行无关
  table.rows = people.map((p) => ({ id: p.id }));

  // 行高写死才算得出窗口；上下各多渲几行做缓冲
  const ROW_H = 36;
  const WINDOW = 18;
  const OVERSCAN = 4;

  // 窗口里的行节点只建一次，滚动时改的是身份与文字
  const pool = Array.from({ length: WINDOW }, () => {
    const row = document.createElement("div");
    row.dataset.xhPart = "row";
    row.style.blockSize = `${ROW_H}px`;
    for (const id of ["no", "name", "dept"]) {
      const cell = document.createElement("div");
      cell.dataset.xhPart = "cell";
      cell.setAttribute("value", id);
      row.append(cell);
    }
    return row;
  });
  body.append(...pool);

  let start = 0;

  function render() {
    const end = Math.min(people.length, start + WINDOW);
    // 首尾两块空白撑出真实滚动高度
    body.style.paddingBlockStart = `${start * ROW_H}px`;
    body.style.paddingBlockEnd = `${(people.length - end) * ROW_H}px`;
    pool.forEach((row, i) => {
      const person = people[start + i];
      row.setAttribute("value", person.id);
      const [no, name, dept] = row.children;
      no.textContent = person.no;
      name.textContent = person.name;
      dept.textContent = person.dept;
    });
    readout.textContent = `共 ${people.length} 行，此刻在 DOM 里的是第 ${start + 1} – ${end} 行`;
  }

  root.addEventListener("scroll", () => {
    const first = Math.floor(root.scrollTop / ROW_H) - OVERSCAN;
    const next = Math.min(Math.max(0, first), people.length - WINDOW);
    if (next === start) return;
    start = next;
    render();
  });

  render();
</script>
```

### 放进滚动区

表格交给滚动区的视口滚，两条自绘滚动条与吸顶表头、吸附列一起工作；表格自己不再定高

```vue
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
  id: `u${i + 1}`,
  name: `员工 ${i + 1}`,
  dept: depts[i % depts.length],
  city: cities[i % cities.length],
  ext: `8${(100 + i).toString()}`,
  mail: `member${i + 1}@example.com`,
}));

const rows = members.map(m => ({ id: m.id }));
</script>

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
```

```html
<!-- 滚动区定高，表格不再自己滚；两条轴各写一条滚动条，交叉口写在竖条里。
     嵌套的 xh-* 元素各管各的角色节点：xh-table 的部件不会被 xh-scroll-area 接线 -->
<xh-scroll-area type="auto">
  <div data-xh-part="root" style="block-size: 260px; inline-size: 100%; max-inline-size: 420px">
    <div data-xh-part="viewport">
      <div data-xh-part="content">
        <xh-table id="table-scroll-area" sticky-header>
          <div data-xh-part="root">
            <div data-xh-part="header">
              <div data-xh-part="row">
                <div data-xh-part="column-header" value="name">姓名</div>
                <div data-xh-part="column-header" value="dept">部门</div>
                <div data-xh-part="column-header" value="city">城市</div>
                <div data-xh-part="column-header" value="ext">分机</div>
                <div data-xh-part="column-header" value="mail">邮箱</div>
              </div>
            </div>
            <div data-xh-part="body"></div>
          </div>
        </xh-table>
      </div>
    </div>
    <div data-xh-part="scrollbar" orientation="vertical">
      <div data-xh-part="track">
        <div data-xh-part="thumb"></div>
      </div>
      <div data-xh-part="corner"></div>
    </div>
    <div data-xh-part="scrollbar" orientation="horizontal">
      <div data-xh-part="track">
        <div data-xh-part="thumb"></div>
      </div>
    </div>
  </div>
</xh-scroll-area>

<script type="module">
  const table = document.getElementById("table-scroll-area");
  const body = table.querySelector('[data-xh-part="body"]');

  table.columns = [
    { id: "name", label: "姓名", width: "7rem", sticky: true },
    { id: "dept", label: "部门", width: "9rem" },
    { id: "city", label: "城市", width: "7rem" },
    { id: "ext", label: "分机", width: "7rem" },
    { id: "mail", label: "邮箱", width: "13rem" },
  ];

  const depts = ["平台研发", "前端体验", "基础架构", "质量保障"];
  const cities = ["杭州", "上海", "北京", "成都"];

  const members = Array.from({ length: 24 }, (_, i) => ({
    id: `u${i + 1}`,
    name: `员工 ${i + 1}`,
    dept: depts[i % depts.length],
    city: cities[i % cities.length],
    ext: `8${(100 + i).toString()}`,
    mail: `member${i + 1}@example.com`,
  }));

  for (const member of members) {
    const row = document.createElement("div");
    row.dataset.xhPart = "row";
    row.setAttribute("value", member.id);
    for (const id of ["name", "dept", "city", "ext", "mail"]) {
      const cell = document.createElement("div");
      cell.dataset.xhPart = "cell";
      cell.setAttribute("value", id);
      cell.textContent = member[id];
      row.append(cell);
    }
    body.append(row);
  }

  table.rows = members.map((m) => ({ id: m.id }));
</script>
```

### 前缀列与分页序号

prefix-columns 让库把序号/多选列插在最前面并占住列号；序号是分页全局序号，翻到第二页不会又从 1 开始

```vue
<script setup lang="ts">
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableRowSelectTrigger,
  XhTableSelectAllTrigger,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const columns = [
  { id: "name", label: "名称" },
  { id: "owner", label: "负责人" },
  { id: "status", label: "状态" },
];

const all = Array.from({ length: 43 }, (_, i) => ({
  id: `r${i + 1}`,
  name: `资源 ${i + 1}`,
  owner: ["曦寒", "碧落", "葳蕤"][i % 3],
  status: i % 4 === 0 ? "停用" : "启用",
}));

const page = ref(1);
const pageSize = 10;
// 切片归调用方（或分页组件的 api.slice）：表格只拿 page/pageSize 算序号
const pageRows = computed(() => all.slice((page.value - 1) * pageSize, page.value * pageSize));
const selection = ref<string[]>([]);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <XhTableRoot
      v-slot="{ columns: cols, rowNumber }"
      v-model:selection="selection"
      :columns="columns"
      :rows="pageRows.map((r) => ({ id: r.id }))"
      :prefix-columns="['index', 'select']"
      :page="page"
      :page-size="pageSize"
      selection-mode="multiple"
      striped
    >
      <XhTableHeader>
        <XhTableRow value="__head__">
          <XhTableColumnHeader v-for="c in cols" :key="c.id" :value="c.id">
            <XhTableSelectAllTrigger v-if="c.kind === 'select'" />
            <template v-else-if="c.kind === 'index'">#</template>
            <template v-else>{{ c.label }}</template>
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>

      <XhTableBody>
        <XhTableRow v-for="row in pageRows" :key="row.id" :value="row.id">
          <XhTableCell v-for="c in cols" :key="c.id" :value="c.id" :row="row.id">
            <XhTableRowSelectTrigger v-if="c.kind === 'select'" :value="row.id" />
            <template v-else-if="c.kind === 'index'">{{ rowNumber(row.id) }}</template>
            <template v-else>{{ (row as Record<string, string>)[c.id] }}</template>
          </XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>

    <XhPaginationRoot
      v-slot="{ pages }"
      v-model:page="page"
      :count="all.length"
      :page-size="pageSize"
      style="display: flex; gap: 4px"
    >
      <XhPaginationPrevTrigger />
      <template v-for="(p, i) in pages" :key="`${p}-${i}`">
        <XhPaginationEllipsisTrigger v-if="p === 'ellipsis'" />
        <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
      </template>
      <XhPaginationNextTrigger />
    </XhPaginationRoot>

    <span style="font-size: 13px">已选 {{ selection.length }} 项 · 序号跨页连续</span>
  </div>
</template>
```

```html
<div
  id="table-prefix-columns"
  style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%"
>
  <xh-table data-host selection-mode="multiple" page="1" page-size="10" striped>
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row" value="__head__">
          <!-- 前缀列的列 id 由库定，两侧带下划线，与作者自己的列 id 分得开 -->
          <div data-xh-part="column-header" value="__index__">#</div>
          <div data-xh-part="column-header" value="__select__">
            <span data-xh-part="select-all-trigger"></span>
          </div>
          <div data-xh-part="column-header" value="name">名称</div>
          <div data-xh-part="column-header" value="owner">负责人</div>
          <div data-xh-part="column-header" value="status">状态</div>
        </div>
      </div>
      <div data-xh-part="body" data-body></div>
    </div>
  </xh-table>

  <xh-pagination data-pagination count="43" page-size="10">
    <nav data-xh-part="root">
      <button data-xh-part="prev-trigger"></button>
      <button data-xh-part="item" value="1">1</button>
      <button data-xh-part="item" value="2">2</button>
      <button data-xh-part="item" value="3">3</button>
      <button data-xh-part="item" value="4">4</button>
      <button data-xh-part="item" value="5">5</button>
      <button data-xh-part="next-trigger"></button>
    </nav>
  </xh-pagination>

  <span data-readout style="font-size: 13px"></span>
</div>

<script type="module">
  const scope = document.getElementById("table-prefix-columns");
  const table = scope.querySelector("[data-host]");
  const pagination = scope.querySelector("[data-pagination]");
  const body = scope.querySelector("[data-body]");
  const readout = scope.querySelector("[data-readout]");

  const PAGE_SIZE = 10;

  const all = Array.from({ length: 43 }, (_, i) => ({
    id: `r${i + 1}`,
    name: `资源 ${i + 1}`,
    owner: ["曦寒", "碧落", "葳蕤"][i % 3],
    status: i % 4 === 0 ? "停用" : "启用",
  }));

  // 序号与多选两列由库插在最前面，作者只管照这个顺序渲格子。数组只走属性
  table.prefixColumns = ["index", "select"];
  table.columns = [
    { id: "name", label: "名称" },
    { id: "owner", label: "负责人" },
    { id: "status", label: "状态" },
  ];

  let page = 1;
  let selection = [];

  function cell(id, content) {
    const el = document.createElement("div");
    el.dataset.xhPart = "cell";
    el.setAttribute("value", id);
    if (typeof content === "string") el.textContent = content;
    else el.append(content);
    return el;
  }

  function renderReadout() {
    readout.textContent = `已选 ${selection.length} 项 · 序号跨页连续`;
  }

  function render() {
    // 切片归调用方：表格只拿 page/pageSize 算序号
    const pageRows = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    table.page = page;
    table.selection = selection;
    table.rows = pageRows.map((row) => ({ id: row.id }));

    body.replaceChildren(
      ...pageRows.map((row, i) => {
        const el = document.createElement("div");
        el.dataset.xhPart = "row";
        el.setAttribute("value", row.id);
        const mark = document.createElement("span");
        mark.dataset.xhPart = "row-select-trigger";
        el.append(
          // 序号是分页全局序号：前面几页的条数照样算进去
          cell("__index__", String((page - 1) * PAGE_SIZE + i + 1)),
          cell("__select__", mark),
          cell("name", row.name),
          cell("owner", row.owner),
          cell("status", row.status),
        );
        return el;
      }),
    );

    renderReadout();
  }

  // 选中集合只改回显，行不必重建
  table.addEventListener("selection-change", (event) => {
    selection = event.detail.value;
    table.selection = selection;
    renderReadout();
  });

  pagination.addEventListener("page-change", (event) => {
    page = event.detail.page;
    render();
  });

  render();
</script>
```

### 范围选

按住 Shift 点勾选框选中一段；焦点落在表体里按 Ctrl/Cmd + A 全选。禁用行占着顺序位置但不被选进去

```vue
<script setup lang="ts">
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableRowSelectTrigger,
  XhTableSelectAllTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const columns = [
  { id: "select", width: "3rem" },
  { id: "name", label: "文件名", width: "10rem" },
  { id: "size", label: "大小" },
];

const files = [
  { id: "f1", name: "报告.docx", size: "1.2 MB" },
  { id: "f2", name: "预算.xlsx", size: "480 KB" },
  { id: "f3", name: "会议纪要.md", size: "12 KB" },
  { id: "f4", name: "归档.zip（禁用）", size: "88 MB" },
  { id: "f5", name: "封面.png", size: "2.4 MB" },
  { id: "f6", name: "演示.pptx", size: "5.1 MB" },
];

// 禁用行选不动，也不算进全选的基数
const rows = files.map(f => ({ id: f.id, ...(f.id === "f4" ? { disabled: true } : {}) }));

const selection = ref<string[] | "all">([]);
</script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
    <p style="color: var(--xh-fg-muted)">
      点第一行的勾选框，再<strong>按住 Shift</strong> 点第五行 —— 中间整段一起选上（禁用那行跳过）。
      再按住 Shift 点第三行，选区会往回收，起点不变。
      焦点落在表体里按 <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>A</kbd> 全选。
    </p>
    <XhTableRoot
      v-model:selection="selection"
      :columns="columns"
      :rows="rows"
      selection-mode="multiple"
    >
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader value="select">
            <XhTableSelectAllTrigger />
          </XhTableColumnHeader>
          <XhTableColumnHeader value="name">文件名</XhTableColumnHeader>
          <XhTableColumnHeader value="size">大小</XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="f in files" :key="f.id" :value="f.id">
          <XhTableCell value="select">
            <XhTableRowSelectTrigger />
          </XhTableCell>
          <XhTableCell value="name">{{ f.name }}</XhTableCell>
          <XhTableCell value="size">{{ f.size }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span>
      选中：{{
        selection === "all"
          ? "全部"
          : selection.length
            ? selection.join("、")
            : "（无）"
      }}
    </span>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
  <p style="color: var(--xh-fg-muted)">
    点第一行的勾选框，再<strong>按住 Shift</strong> 点第五行 ——
    中间整段一起选上（禁用那行跳过）。 再按住 Shift 点第三行，选区会往回收，起点不变。
    焦点落在表体里按 <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>A</kbd> 全选。
  </p>
  <xh-table id="table-range" selection-mode="multiple">
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="select">
            <span data-xh-part="select-all-trigger"></span>
          </div>
          <div data-xh-part="column-header" value="name">文件名</div>
          <div data-xh-part="column-header" value="size">大小</div>
        </div>
      </div>
      <div data-xh-part="body">
        <div data-xh-part="row" value="f1">
          <div data-xh-part="cell" value="select">
            <span data-xh-part="row-select-trigger"></span>
          </div>
          <div data-xh-part="cell" value="name">报告.docx</div>
          <div data-xh-part="cell" value="size">1.2 MB</div>
        </div>
        <div data-xh-part="row" value="f2">
          <div data-xh-part="cell" value="select">
            <span data-xh-part="row-select-trigger"></span>
          </div>
          <div data-xh-part="cell" value="name">预算.xlsx</div>
          <div data-xh-part="cell" value="size">480 KB</div>
        </div>
        <div data-xh-part="row" value="f3">
          <div data-xh-part="cell" value="select">
            <span data-xh-part="row-select-trigger"></span>
          </div>
          <div data-xh-part="cell" value="name">会议纪要.md</div>
          <div data-xh-part="cell" value="size">12 KB</div>
        </div>
        <div data-xh-part="row" value="f4">
          <div data-xh-part="cell" value="select">
            <span data-xh-part="row-select-trigger"></span>
          </div>
          <div data-xh-part="cell" value="name">归档.zip（禁用）</div>
          <div data-xh-part="cell" value="size">88 MB</div>
        </div>
        <div data-xh-part="row" value="f5">
          <div data-xh-part="cell" value="select">
            <span data-xh-part="row-select-trigger"></span>
          </div>
          <div data-xh-part="cell" value="name">封面.png</div>
          <div data-xh-part="cell" value="size">2.4 MB</div>
        </div>
        <div data-xh-part="row" value="f6">
          <div data-xh-part="cell" value="select">
            <span data-xh-part="row-select-trigger"></span>
          </div>
          <div data-xh-part="cell" value="name">演示.pptx</div>
          <div data-xh-part="cell" value="size">5.1 MB</div>
        </div>
      </div>
    </div>
  </xh-table>
  <span id="table-range-value"></span>
</div>

<script type="module">
  const table = document.getElementById("table-range");
  const readout = document.getElementById("table-range-value");

  table.columns = [
    { id: "select", width: "3rem" },
    { id: "name", label: "文件名", width: "10rem" },
    { id: "size", label: "大小" },
  ];
  // 禁用行选不动，也不算进全选的基数
  table.rows = [
    { id: "f1" },
    { id: "f2" },
    { id: "f3" },
    { id: "f4", disabled: true },
    { id: "f5" },
    { id: "f6" },
  ];

  function apply(selection) {
    table.selection = selection;
    readout.textContent = `选中：${
      selection === "all"
        ? "全部"
        : selection.length
          ? selection.join("、")
          : "（无）"
    }`;
  }

  apply([]);
  table.addEventListener("selection-change", (event) => apply(event.detail.value));
</script>
```

### 拖拽换列位

列上标了 reorderable 才认拖拽把手；也可以 Tab 到它用方向键挪，Home / End 到两头

```vue
<script setup lang="ts">
import {
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnDragTrigger,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 标了 reorderable 的列才产出把手。没标的列是屏障：拖不过去，也落不到它身上
const columns = [
  { id: "name", label: "姓名", width: 120, reorderable: true },
  { id: "dept", label: "部门", width: 150, reorderable: true },
  { id: "city", label: "城市", width: 120, reorderable: true },
  { id: "ops", label: "操作", width: 100 },
];

const members = [
  { id: "u1", name: "赵一", dept: "平台研发", city: "杭州" },
  { id: "u2", name: "钱二", dept: "前端体验", city: "上海" },
  { id: "u3", name: "孙三", dept: "基础架构", city: "北京" },
];

const rows = members.map(m => ({ id: m.id }));

// 换位落在列偏好的 order 里，可以直接存起来下次还原
const preference = ref<Record<string, unknown>>({});

// 列序由偏好决定，渲染顺序读 api.columns；这里照它取每行的格子
function cell(m: (typeof members)[number], id: string): string {
  return ({ name: m.name, dept: m.dept, city: m.city, ops: "编辑" })[id] ?? "";
}
</script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
    <XhTableRoot
      v-slot="{ columns: effective }"
      v-model:column-preference="preference"
      :columns="columns"
      :rows="rows"
    >
      <XhTableCaption>拖列标题左侧的抓手换位；「操作」列没标 reorderable，拖不动也拖不过去</XhTableCaption>
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader v-for="col in effective" :key="col.id" :value="col.id">
            <!-- 把手在标题之前；不可拖的列它自己报不可用 -->
            <XhTableColumnDragTrigger />
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis">
              {{ col.label }}
            </span>
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="m in members" :key="m.id" :value="m.id">
          <XhTableCell v-for="col in effective" :key="col.id" :value="col.id" :row="m.id">
            {{ cell(m, col.id) }}
          </XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span>列序：{{ (preference.order as string[] | undefined)?.join(" → ") ?? "（还没改过）" }}</span>
  </div>
</template>
```

```html
<div id="table-column-drag" style="width: 100%; max-width: 560px; display: grid; gap: 12px">
  <xh-table data-host>
    <div data-xh-part="root">
      <div data-xh-part="caption">
        拖列标题左侧的抓手换位；「操作」列没标 reorderable，拖不动也拖不过去
      </div>
      <div data-xh-part="header">
        <div data-xh-part="row">
          <!-- 把手在标题之前；不可拖的列它自己报不可用 -->
          <div data-xh-part="column-header" value="name">
            <span data-xh-part="column-drag-trigger"></span>
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis">姓名</span>
          </div>
          <div data-xh-part="column-header" value="dept">
            <span data-xh-part="column-drag-trigger"></span>
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis">部门</span>
          </div>
          <div data-xh-part="column-header" value="city">
            <span data-xh-part="column-drag-trigger"></span>
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis">城市</span>
          </div>
          <div data-xh-part="column-header" value="ops">
            <span data-xh-part="column-drag-trigger"></span>
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis">操作</span>
          </div>
        </div>
      </div>
      <div data-xh-part="body">
        <div data-xh-part="row" value="u1">
          <div data-xh-part="cell" value="name">赵一</div>
          <div data-xh-part="cell" value="dept">平台研发</div>
          <div data-xh-part="cell" value="city">杭州</div>
          <div data-xh-part="cell" value="ops">编辑</div>
        </div>
        <div data-xh-part="row" value="u2">
          <div data-xh-part="cell" value="name">钱二</div>
          <div data-xh-part="cell" value="dept">前端体验</div>
          <div data-xh-part="cell" value="city">上海</div>
          <div data-xh-part="cell" value="ops">编辑</div>
        </div>
        <div data-xh-part="row" value="u3">
          <div data-xh-part="cell" value="name">孙三</div>
          <div data-xh-part="cell" value="dept">基础架构</div>
          <div data-xh-part="cell" value="city">北京</div>
          <div data-xh-part="cell" value="ops">编辑</div>
        </div>
      </div>
    </div>
  </xh-table>
  <span data-readout></span>
</div>

<script type="module">
  const scope = document.getElementById("table-column-drag");
  const table = scope.querySelector("[data-host]");
  const readout = scope.querySelector("[data-readout]");

  // 标了 reorderable 的列才产出把手。没标的列是屏障：拖不过去，也落不到它身上
  const columns = [
    { id: "name", label: "姓名", width: 120, reorderable: true },
    { id: "dept", label: "部门", width: 150, reorderable: true },
    { id: "city", label: "城市", width: 120, reorderable: true },
    { id: "ops", label: "操作", width: 100 },
  ];

  table.columns = columns;
  table.rows = [{ id: "u1" }, { id: "u2" }, { id: "u3" }];

  // 偏好里的 order 只列了一部分时，没列到的按原顺序跟在后面
  function effectiveOrder(preference) {
    const ids = columns.map((column) => column.id);
    const order = (preference.order ?? []).filter((id) => ids.includes(id));
    return [...order, ...ids.filter((id) => !order.includes(id))];
  }

  // 库只算生效列序，格子的先后归标记：表头与每一行都照这份顺序重排一遍
  table.addEventListener("column-preference-change", (event) => {
    const preference = event.detail.value;
    table.columnPreference = preference;
    const order = effectiveOrder(preference);
    for (const row of scope.querySelectorAll('[data-xh-part="row"]')) {
      row.append(...order.map((id) => row.querySelector(`[value="${id}"]`)));
    }
    readout.textContent = `列序：${order.join(" → ")}`;
  });

  // 换位落在列偏好的 order 里，可以直接存起来下次还原
  readout.textContent = "列序：（还没改过）";
</script>
```

### 拖拽换行位

整行都是拖动源，按住拖到别处松手；也可以 Tab 进表体后按 Alt + 上下键挪。库只报新行序，写回归使用者

```vue
<script setup lang="ts">
import {
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const columns = [
  { id: "step", label: "序号", width: "4rem" },
  { id: "name", label: "环节", width: "10rem" },
  { id: "owner", label: "负责人" },
];

const steps = ref([
  { id: "s1", name: "需求评审", owner: "赵一" },
  { id: "s2", name: "方案设计", owner: "钱二" },
  { id: "s3", name: "开发实现", owner: "孙三" },
  { id: "s4", name: "测试验收", owner: "李四" },
  { id: "s5", name: "发布上线", owner: "周五" },
]);

// 行序的主人是这份数组，跟着它走
const rows = computed(() => steps.value.map(s => ({ id: s.id })));

// details.ids 是已经重排好的整份行序，照它取一遍就是新数组。
// 平表没有层级，details.parent 恒为 null、index 就是搬完之后的第几行
function onRowMove(details: {
  id: string;
  parent: string | null;
  index: number;
  ids: string[];
}) {
  const byId = new Map(steps.value.map(s => [s.id, s]));
  steps.value = details.ids.flatMap(id => byId.get(id) ?? []);
}
</script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
    <XhTableRoot
      :columns="columns"
      :rows="rows"
      row-reorderable
      @row-move="onRowMove"
    >
      <XhTableCaption>
        按住任意一行拖动换位，落点画在两行之间；也可以 Tab 进表体，用 Alt + 上下键挪
      </XhTableCaption>
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader value="step">序号</XhTableColumnHeader>
          <XhTableColumnHeader value="name">环节</XhTableColumnHeader>
          <XhTableColumnHeader value="owner">负责人</XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="(s, i) in steps" :key="s.id" :value="s.id">
          <XhTableCell value="step">{{ i + 1 }}</XhTableCell>
          <XhTableCell value="name">{{ s.name }}</XhTableCell>
          <XhTableCell value="owner">{{ s.owner }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span>当前顺序：{{ steps.map((s) => s.name).join(" → ") }}</span>
  </div>
</template>
```

```html
<div id="table-row-drag" style="width: 100%; max-width: 560px; display: grid; gap: 12px">
  <xh-table data-host row-reorderable>
    <div data-xh-part="root">
      <div data-xh-part="caption">
        按住任意一行拖动换位，落点画在两行之间；也可以 Tab 进表体，用 Alt + 上下键挪
      </div>
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="step">序号</div>
          <div data-xh-part="column-header" value="name">环节</div>
          <div data-xh-part="column-header" value="owner">负责人</div>
        </div>
      </div>
      <div data-xh-part="body" data-body>
        <div data-xh-part="row" value="s1">
          <div data-xh-part="cell" value="step">1</div>
          <div data-xh-part="cell" value="name">需求评审</div>
          <div data-xh-part="cell" value="owner">赵一</div>
        </div>
        <div data-xh-part="row" value="s2">
          <div data-xh-part="cell" value="step">2</div>
          <div data-xh-part="cell" value="name">方案设计</div>
          <div data-xh-part="cell" value="owner">钱二</div>
        </div>
        <div data-xh-part="row" value="s3">
          <div data-xh-part="cell" value="step">3</div>
          <div data-xh-part="cell" value="name">开发实现</div>
          <div data-xh-part="cell" value="owner">孙三</div>
        </div>
        <div data-xh-part="row" value="s4">
          <div data-xh-part="cell" value="step">4</div>
          <div data-xh-part="cell" value="name">测试验收</div>
          <div data-xh-part="cell" value="owner">李四</div>
        </div>
        <div data-xh-part="row" value="s5">
          <div data-xh-part="cell" value="step">5</div>
          <div data-xh-part="cell" value="name">发布上线</div>
          <div data-xh-part="cell" value="owner">周五</div>
        </div>
      </div>
    </div>
  </xh-table>
  <span data-readout></span>
</div>

<script type="module">
  const scope = document.getElementById("table-row-drag");
  const table = scope.querySelector("[data-host]");
  const body = scope.querySelector("[data-body]");
  const readout = scope.querySelector("[data-readout]");

  table.columns = [
    { id: "step", label: "序号", width: "4rem" },
    { id: "name", label: "环节", width: "10rem" },
    { id: "owner", label: "负责人" },
  ];

  // 行序的主人是这份数组，跟着它走
  let steps = [
    { id: "s1", name: "需求评审" },
    { id: "s2", name: "方案设计" },
    { id: "s3", name: "开发实现" },
    { id: "s4", name: "测试验收" },
    { id: "s5", name: "发布上线" },
  ];

  const nodeOf = new Map(
    [...body.children].map((row) => [row.getAttribute("value"), row]),
  );

  // 行序变了要动三处：rows 定义、表体里的节点次序、序号那一列
  function render() {
    table.rows = steps.map((step) => ({ id: step.id }));
    body.append(...steps.map((step) => nodeOf.get(step.id)));
    steps.forEach((step, i) => {
      nodeOf.get(step.id).querySelector('[value="step"]').textContent = String(i + 1);
    });
    readout.textContent = `当前顺序：${steps.map((step) => step.name).join(" → ")}`;
  }

  // detail.ids 是已经重排好的整份行序，照它取一遍就是新数组。
  // 平表没有层级，detail.parent 恒为 null、index 就是搬完之后的第几行
  table.addEventListener("row-move", (event) => {
    const byId = new Map(steps.map((step) => [step.id, step]));
    steps = event.detail.ids.flatMap((id) => byId.get(id) ?? []);
    render();
  });

  render();
</script>
```

### 触屏拖动把手

整行起手只认鼠标与笔；触屏要按住行首那个把手才拖得动，代价是那一小块地方不再跟着表格滚。键盘那一路照旧：Tab 进表体后 Alt + 上下键

```vue
<script setup lang="ts">
import {
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableRowDragTrigger,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const columns = [
  { id: "step", label: "序号", width: "4rem" },
  { id: "name", label: "环节", width: "10rem" },
  { id: "owner", label: "负责人" },
];

const steps = ref([
  { id: "s1", name: "需求评审", owner: "赵一" },
  { id: "s2", name: "方案设计", owner: "钱二" },
  { id: "s3", name: "开发实现", owner: "孙三" },
  { id: "s4", name: "测试验收", owner: "李四" },
  { id: "s5", name: "发布上线", owner: "周五" },
]);

// 行序的主人是这份数组，跟着它走
const rows = computed(() => steps.value.map(s => ({ id: s.id })));

// details.ids 是已经重排好的整份行序，照它取一遍就是新数组。
// 平表没有层级，details.parent 恒为 null、index 就是搬完之后的第几行
function onRowMove(details: {
  id: string;
  parent: string | null;
  index: number;
  ids: string[];
}) {
  const byId = new Map(steps.value.map(s => [s.id, s]));
  steps.value = details.ids.flatMap(id => byId.get(id) ?? []);
}

// 表头没有把手，补一块同宽的空位，列标题才和下面的格子对得上
const spacerStyle = "flex: none; inline-size: var(--xh-table-row-drag-size, var(--xh-control-indicator-size))";
</script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
    <XhTableRoot :columns="columns" :rows="rows" row-reorderable @row-move="onRowMove">
      <XhTableCaption>
        鼠标按住整行就能拖；手机上按住行首的抓手拖，按下即走，不用先拖一段距离
      </XhTableCaption>
      <XhTableHeader>
        <XhTableRow>
          <span aria-hidden="true" :style="spacerStyle" />
          <XhTableColumnHeader value="step">序号</XhTableColumnHeader>
          <XhTableColumnHeader value="name">环节</XhTableColumnHeader>
          <XhTableColumnHeader value="owner">负责人</XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="(s, i) in steps" :key="s.id" :value="s.id">
          <!-- 把手排在所有格子之前；它对读屏隐藏也不占 Tab 位，键盘换位走表体上的 Alt + 上下键 -->
          <XhTableRowDragTrigger />
          <XhTableCell value="step">{{ i + 1 }}</XhTableCell>
          <XhTableCell value="name">{{ s.name }}</XhTableCell>
          <XhTableCell value="owner">{{ s.owner }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span>当前顺序：{{ steps.map((s) => s.name).join(" → ") }}</span>
  </div>
</template>
```

```html
<div
  id="table-row-drag-handle"
  style="width: 100%; max-width: 560px; display: grid; gap: 12px"
>
  <xh-table data-host row-reorderable>
    <div data-xh-part="root">
      <div data-xh-part="caption">
        鼠标按住整行就能拖；手机上按住行首的抓手拖，按下即走，不用先拖一段距离
      </div>
      <div data-xh-part="header">
        <div data-xh-part="row">
          <!-- 表头没有把手，补一块同宽的空位，列标题才和下面的格子对得上 -->
          <span
            aria-hidden="true"
            style="
              flex: none;
              inline-size: var(--xh-table-row-drag-size, var(--xh-control-indicator-size));
            "
          ></span>
          <div data-xh-part="column-header" value="step">序号</div>
          <div data-xh-part="column-header" value="name">环节</div>
          <div data-xh-part="column-header" value="owner">负责人</div>
        </div>
      </div>
      <div data-xh-part="body" data-body>
        <div data-xh-part="row" value="s1">
          <!-- 把手排在所有格子之前；它对读屏隐藏也不占 Tab 位，键盘换位走表体上的 Alt + 上下键 -->
          <span data-xh-part="row-drag-trigger"></span>
          <div data-xh-part="cell" value="step">1</div>
          <div data-xh-part="cell" value="name">需求评审</div>
          <div data-xh-part="cell" value="owner">赵一</div>
        </div>
        <div data-xh-part="row" value="s2">
          <span data-xh-part="row-drag-trigger"></span>
          <div data-xh-part="cell" value="step">2</div>
          <div data-xh-part="cell" value="name">方案设计</div>
          <div data-xh-part="cell" value="owner">钱二</div>
        </div>
        <div data-xh-part="row" value="s3">
          <span data-xh-part="row-drag-trigger"></span>
          <div data-xh-part="cell" value="step">3</div>
          <div data-xh-part="cell" value="name">开发实现</div>
          <div data-xh-part="cell" value="owner">孙三</div>
        </div>
        <div data-xh-part="row" value="s4">
          <span data-xh-part="row-drag-trigger"></span>
          <div data-xh-part="cell" value="step">4</div>
          <div data-xh-part="cell" value="name">测试验收</div>
          <div data-xh-part="cell" value="owner">李四</div>
        </div>
        <div data-xh-part="row" value="s5">
          <span data-xh-part="row-drag-trigger"></span>
          <div data-xh-part="cell" value="step">5</div>
          <div data-xh-part="cell" value="name">发布上线</div>
          <div data-xh-part="cell" value="owner">周五</div>
        </div>
      </div>
    </div>
  </xh-table>
  <span data-readout></span>
</div>

<script type="module">
  const scope = document.getElementById("table-row-drag-handle");
  const table = scope.querySelector("[data-host]");
  const body = scope.querySelector("[data-body]");
  const readout = scope.querySelector("[data-readout]");

  table.columns = [
    { id: "step", label: "序号", width: "4rem" },
    { id: "name", label: "环节", width: "10rem" },
    { id: "owner", label: "负责人" },
  ];

  // 行序的主人是这份数组，跟着它走
  let steps = [
    { id: "s1", name: "需求评审" },
    { id: "s2", name: "方案设计" },
    { id: "s3", name: "开发实现" },
    { id: "s4", name: "测试验收" },
    { id: "s5", name: "发布上线" },
  ];

  const nodeOf = new Map(
    [...body.children].map((row) => [row.getAttribute("value"), row]),
  );

  // 行序变了要动三处：rows 定义、表体里的节点次序、序号那一列
  function render() {
    table.rows = steps.map((step) => ({ id: step.id }));
    body.append(...steps.map((step) => nodeOf.get(step.id)));
    steps.forEach((step, i) => {
      nodeOf.get(step.id).querySelector('[value="step"]').textContent = String(i + 1);
    });
    readout.textContent = `当前顺序：${steps.map((step) => step.name).join(" → ")}`;
  }

  // detail.ids 是已经重排好的整份行序，照它取一遍就是新数组。
  // 平表没有层级，detail.parent 恒为 null、index 就是搬完之后的第几行
  table.addEventListener("row-move", (event) => {
    const byId = new Map(steps.map((step) => [step.id, step]));
    steps = event.detail.ids.flatMap((id) => byId.get(id) ?? []);
    render();
  });

  render();
</script>
```

### 树形表拖拽

行声明了 parentId 就是树：拖到一行中段是放进这一行（换个父），拖到上下两端仍是插在它前后；键盘走 Alt + 上下键同层挪、Alt + 左右键改缩进。库报的是「搬到哪个父下面的第几位」外加重排好的整份行序，写回归宿主——按 ids 重排、再把那一行的 parentId 设成 parent，两件都做才对得上。许不许搬那一句归 allowRowDrop

```vue
<script setup lang="ts">
import {
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnHeader,
  XhTableExpandTrigger,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

/** 库报的落点：把 id 那一行搬到 parent 下面的第 index 位；parent 为 null 即根层。 */
interface RowMove {
  id: string;
  parent: string | null;
  index: number;
  /** 已经算好的整份行序，直接拿去重排。 */
  ids: string[];
}

interface Task {
  id: string;
  label: string;
  owner: string;
  /** 父行 id，根层为 null。 */
  parentId: string | null;
  /** 分组行：收得下子行，被搬空了也还收得下。 */
  group?: boolean;
}

const columns = [
  { id: "name", label: "任务", width: "14rem" },
  { id: "owner", label: "负责人" },
];

// 表格的树是一份带 parentId 的扁平数组：父子归属由 parentId 定，同层次序由数组里的先后定
const tasks = ref<Task[]>([
  { id: "client", label: "客户端", owner: "赵一", parentId: null, group: true },
  { id: "t1", label: "登录页改版", owner: "钱二", parentId: "client" },
  { id: "t2", label: "离线缓存", owner: "孙三", parentId: "client" },
  { id: "server", label: "服务端", owner: "李四", parentId: null, group: true },
  { id: "t3", label: "限流中间件", owner: "周五", parentId: "server" },
  { id: "archive", label: "已归档", owner: "吴六", parentId: null, group: true },
  { id: "t4", label: "旧版导出", owner: "郑七", parentId: "archive" },
]);

const byId = computed(() => new Map(tasks.value.map(task => [task.id, task])));

// 行序与父子归属的事实源就是这份数组。分组行标上 expandable：
// 有子行的行本来就展得开，标了它的分组被搬空之后也仍收得下东西
const rows = computed(() =>
  tasks.value.map(task => ({
    id: task.id,
    parentId: task.parentId ?? undefined,
    expandable: task.group,
  })),
);

const expanded = ref(["client", "server", "archive"]);

const log = ref("按住任意一行拖走，或 Tab 进表体按 Alt + 方向键搬");

// 这一次搬家许不许。库自己兜住「落在自己身上 / 落进自己的后代 / 算下来还是原位」，
// 「落进普通数据行」也早被挡掉——只有可展开或已经有子行的行才给中段那一档。
// 剩下的是这份数据的规矩：已归档那一组只出不进
const allowRowDrop = (move: RowMove): boolean => move.parent !== "archive";

// 写回是两件事：按 ids 重排，再把搬走那一行的 parentId 换成 parent。
// 只重排它会留在原来的父下面，只换父则同层次序对不上，缺一件都是错的
function onRowMove(move: RowMove): void {
  const known = byId.value;
  tasks.value = move.ids.flatMap((id) => {
    const task = known.get(id);
    if (!task)
      return [];
    return [id === move.id ? { ...task, parentId: move.parent } : task];
  });
  const where = move.parent == null ? "根层" : (known.get(move.parent)?.label ?? move.parent);
  log.value = `${known.get(move.id)?.label ?? move.id} 搬到了${where}第 ${move.index + 1} 位`;
}

// 叶子行没有开合把手，补一块同宽的空位，两种行的文字才起在同一处
const twistySpacer
  = "display: inline-flex; flex: none; inline-size: var(--xh-table-trigger-size, var(--xh-control-indicator-size))";
</script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
    <XhTableRoot
      v-slot="{ visibleRows }"
      v-model:expanded-value="expanded"
      :columns="columns"
      :rows="rows"
      :allow-row-drop="allowRowDrop"
      row-reorderable
      @row-move="onRowMove"
    >
      <XhTableCaption>
        拖到一行中段是放进这一行，拖到上下两端是插在它前后；也可以 Tab
        进表体，用「Alt + 上下键」同层挪、「Alt + 左右键」改缩进。已归档那一组只出不进
      </XhTableCaption>
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            {{ col.label }}
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <!-- 收起的分组连着它的子行整段不出现；摊平、层级号与 aria 三件套都归库，这里只管渲 -->
        <XhTableRow
          v-for="row in visibleRows.filter((item) => item.kind === 'data')"
          :key="row.id"
          :value="row.id"
        >
          <!-- 缩进是首格的内边距，与库报的层级号同源 -->
          <XhTableCell value="name" :style="{ paddingInlineStart: `${row.level * 16}px` }">
            <!-- 把手只服务指针，键盘那一路走裸左右方向键，因此它对读屏隐藏也不占 Tab 位 -->
            <XhTableExpandTrigger v-if="row.expandable" />
            <span v-else aria-hidden="true" :style="twistySpacer" />
            {{ byId.get(row.id)?.label }}
          </XhTableCell>
          <XhTableCell value="owner">{{ byId.get(row.id)?.owner }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span>{{ log }}</span>
  </div>
</template>
```

```html
<div id="table-tree-drag" style="width: 100%; max-width: 560px; display: grid; gap: 12px">
  <xh-table data-host row-reorderable>
    <div data-xh-part="root">
      <div data-xh-part="caption">
        拖到一行中段是放进这一行，拖到上下两端是插在它前后；也可以 Tab 进表体，用「Alt +
        上下键」同层挪、「Alt + 左右键」改缩进。已归档那一组只出不进
      </div>
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="name">任务</div>
          <div data-xh-part="column-header" value="owner">负责人</div>
        </div>
      </div>
      <div data-xh-part="body" data-body></div>
    </div>
  </xh-table>
  <span data-log>按住任意一行拖走，或 Tab 进表体按 Alt + 方向键搬</span>
</div>

<script type="module">
  const scope = document.getElementById("table-tree-drag");
  const table = scope.querySelector("[data-host]");
  const body = scope.querySelector("[data-body]");
  const log = scope.querySelector("[data-log]");

  table.columns = [
    { id: "name", label: "任务", width: "14rem" },
    { id: "owner", label: "负责人" },
  ];

  // 表格的树是一份带 parentId 的扁平数组：父子归属由 parentId 定，同层次序由数组里的先后定
  let tasks = [
    { id: "client", label: "客户端", owner: "赵一", parentId: null, group: true },
    { id: "t1", label: "登录页改版", owner: "钱二", parentId: "client" },
    { id: "t2", label: "离线缓存", owner: "孙三", parentId: "client" },
    { id: "server", label: "服务端", owner: "李四", parentId: null, group: true },
    { id: "t3", label: "限流中间件", owner: "周五", parentId: "server" },
    { id: "archive", label: "已归档", owner: "吴六", parentId: null, group: true },
    { id: "t4", label: "旧版导出", owner: "郑七", parentId: "archive" },
  ];

  let expanded = ["client", "server", "archive"];

  // 叶子行没有开合把手，补一块同宽的空位，两种行的文字才起在同一处
  const SPACER_STYLE =
    "display: inline-flex; flex: none; inline-size: var(--xh-table-trigger-size, var(--xh-control-indicator-size))";

  const byId = () => new Map(tasks.map((task) => [task.id, task]));

  // 收起的分组连着它的子行整段不出现；这份摊平与库算行号用的是同一条口径：
  // 根行按数组先后，子行紧跟各自的父
  function visible() {
    const children = new Map();
    for (const task of tasks) {
      const list = children.get(task.parentId) ?? [];
      list.push(task);
      children.set(task.parentId, list);
    }
    const out = [];
    const walk = (parentId, level) => {
      for (const task of children.get(parentId) ?? []) {
        const kids = children.get(task.id) ?? [];
        const expandable = kids.length > 0 || !!task.group;
        out.push({ task, level, expandable });
        if (expandable && expanded.includes(task.id)) walk(task.id, level + 1);
      }
    };
    walk(null, 1);
    return out;
  }

  function rowNode(entry) {
    const el = document.createElement("div");
    el.dataset.xhPart = "row";
    el.setAttribute("value", entry.task.id);

    const name = document.createElement("div");
    name.dataset.xhPart = "cell";
    name.setAttribute("value", "name");
    // 缩进是首格的内边距，与库报的层级号同源
    name.style.paddingInlineStart = `${entry.level * 16}px`;
    const twisty = document.createElement("span");
    if (entry.expandable) {
      // 把手只服务指针，键盘那一路走裸左右方向键，因此它对读屏隐藏也不占 Tab 位
      twisty.dataset.xhPart = "expand-trigger";
    } else {
      twisty.setAttribute("aria-hidden", "true");
      twisty.setAttribute("style", SPACER_STYLE);
    }
    name.append(twisty, entry.task.label);

    const owner = document.createElement("div");
    owner.dataset.xhPart = "cell";
    owner.setAttribute("value", "owner");
    owner.textContent = entry.task.owner;

    el.append(name, owner);
    return el;
  }

  // 行序与父子归属的事实源就是这份数组。分组行标上 expandable：
  // 有子行的行本来就展得开，标了它的分组被搬空之后也仍收得下东西
  function render() {
    table.expandedValue = expanded;
    table.rows = tasks.map((task) => ({
      id: task.id,
      parentId: task.parentId ?? undefined,
      expandable: task.group,
    }));
    body.replaceChildren(...visible().map(rowNode));
  }

  // 这一次搬家许不许。库自己兜住「落在自己身上 / 落进自己的后代 / 算下来还是原位」，
  // 「落进普通数据行」也早被挡掉——只有可展开或已经有子行的行才给中段那一档。
  // 剩下的是这份数据的规矩：已归档那一组只出不进。它是函数，只走属性
  table.allowRowDrop = (move) => move.parent !== "archive";

  table.addEventListener("expanded-value-change", (event) => {
    expanded = event.detail.value;
    render();
  });

  // 写回是两件事：按 ids 重排，再把搬走那一行的 parentId 换成 parent。
  // 只重排它会留在原来的父下面，只换父则同层次序对不上，缺一件都是错的
  table.addEventListener("row-move", (event) => {
    const move = event.detail;
    const known = byId();
    tasks = move.ids.flatMap((id) => {
      const task = known.get(id);
      if (!task) return [];
      return [id === move.id ? { ...task, parentId: move.parent } : task];
    });
    render();
    const where = move.parent == null ? "根层" : (known.get(move.parent)?.label ?? move.parent);
    log.textContent = `${known.get(move.id)?.label ?? move.id} 搬到了${where}第 ${
      move.index + 1
    } 位`;
  });

  render();
</script>
```

### 列设置与工具条

工具条渲成表的兄弟排在表前（root 是 grid，工具条进不去它里面）；列设置区照 columnSettings 渲，藏起来的列也在其中，只剩最后一列显示着时那颗把手转禁用

```vue
<script setup lang="ts">
import {
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnList,
  XhTableColumnVisibilityTrigger,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableToolbar,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

interface Member {
  id: string;
  name: string;
  dept: string;
  city: string;
  level: string;
}

const columns = [
  { id: "name", label: "姓名", width: "7rem" },
  { id: "dept", label: "部门", width: "9rem" },
  { id: "city", label: "城市", width: "7rem" },
  { id: "level", label: "职级" },
];

const members: Member[] = [
  { id: "u1", name: "赵一", dept: "平台研发", city: "杭州", level: "P6" },
  { id: "u2", name: "钱二", dept: "前端体验", city: "上海", level: "P7" },
  { id: "u3", name: "孙三", dept: "基础架构", city: "北京", level: "P6" },
  { id: "u4", name: "李四", dept: "前端体验", city: "杭州", level: "P5" },
];

const rows = members.map(m => ({ id: m.id }));

// 偏好存哪儿归使用者：这里只把它显示出来，存 localStorage 还是存后端都是应用的事
const saved = ref<string>("尚未改过");
const rowStyle = { display: "flex", alignItems: "center", gap: "8px" };
const nameStyle = { cursor: "pointer" };
const cell = (m: Member, id: string) => m[id as keyof Member];
const toolbarTitle = computed(() => `成员 ${members.length} 人`);
</script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
    <XhTableRoot
      :columns="columns"
      :rows="rows"
      @column-preference-change="saved = JSON.stringify($event.value)"
    >
      <template #toolbar="{ columnSettings, setColumnHidden }">
        <XhTableToolbar>
          <span>{{ toolbarTitle }}</span>
          <XhPopoverRoot placement="bottom-end" size="sm">
            <XhPopoverTrigger aria-label="列设置">列设置</XhPopoverTrigger>
            <XhPopoverPositioner>
              <XhPopoverContent>
                <XhPopoverTitle>列设置</XhPopoverTitle>
                <XhTableColumnList>
                  <div v-for="col in columnSettings" :key="col.id" :style="rowStyle">
                    <XhTableColumnVisibilityTrigger :value="col.id" />
                    <span
                      :style="nameStyle"
                      @click="col.toggleable && setColumnHidden(col.id, !col.hidden)"
                    >
                      {{ col.label }}
                    </span>
                  </div>
                </XhTableColumnList>
              </XhPopoverContent>
            </XhPopoverPositioner>
          </XhPopoverRoot>
        </XhTableToolbar>
      </template>
      <template #default="{ columns: shown }">
        <XhTableHeader>
          <XhTableRow>
            <XhTableColumnHeader v-for="col in shown" :key="col.id" :value="col.id">
              {{ col.label }}
            </XhTableColumnHeader>
          </XhTableRow>
        </XhTableHeader>
        <XhTableBody>
          <XhTableRow v-for="m in members" :key="m.id" :value="m.id">
            <XhTableCell v-for="col in shown" :key="col.id" :value="col.id">
              {{ cell(m, col.id) }}
            </XhTableCell>
          </XhTableRow>
        </XhTableBody>
      </template>
    </XhTableRoot>
    <span>存下来的列偏好：{{ saved }}</span>
  </div>
</template>
```

```html
<div id="table-settings" style="width: 100%; max-width: 560px; display: grid; gap: 12px">
  <xh-table id="table-settings-table">
    <div data-xh-part="toolbar">
      <span>成员 4 人</span>
      <!-- 设置区直接摆在工具条里：角色节点归它外面最近的那个 xh-* 元素，
           套进另一个自定义元素（比如浮层）里就不再是这张表的部件了 -->
      <div data-xh-part="column-list" id="table-settings-list"></div>
    </div>
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="name">姓名</div>
          <div data-xh-part="column-header" value="dept">部门</div>
          <div data-xh-part="column-header" value="city">城市</div>
          <div data-xh-part="column-header" value="level">职级</div>
        </div>
      </div>
      <div data-xh-part="body" id="table-settings-body"></div>
    </div>
  </xh-table>
  <span id="table-settings-readout">存下来的列偏好：尚未改过</span>
</div>

<script type="module">
  const stage = document.getElementById("table-settings");
  const table = document.getElementById("table-settings-table");
  const list = document.getElementById("table-settings-list");
  const body = document.getElementById("table-settings-body");
  const readout = document.getElementById("table-settings-readout");

  const columns = [
    { id: "name", label: "姓名", width: "7rem" },
    { id: "dept", label: "部门", width: "9rem" },
    { id: "city", label: "城市", width: "7rem" },
    { id: "level", label: "职级" },
  ];
  const members = [
    { id: "u1", name: "赵一", dept: "平台研发", city: "杭州", level: "P6" },
    { id: "u2", name: "钱二", dept: "前端体验", city: "上海", level: "P7" },
    { id: "u3", name: "孙三", dept: "基础架构", city: "北京", level: "P6" },
    { id: "u4", name: "李四", dept: "前端体验", city: "杭州", level: "P5" },
  ];

  table.columns = columns;
  table.rows = members.map((m) => ({ id: m.id }));

  // 行与格子是作者写的：这里一次建好，之后只改显隐
  body.replaceChildren(
    ...members.map((m) => {
      const row = document.createElement("div");
      row.setAttribute("data-xh-part", "row");
      row.setAttribute("value", m.id);
      for (const col of columns) {
        const cell = document.createElement("div");
        cell.setAttribute("data-xh-part", "cell");
        cell.setAttribute("value", col.id);
        cell.textContent = m[col.id];
        row.append(cell);
      }
      return row;
    }),
  );

  // 设置区一列一行：一颗显隐把手加一段列名
  list.replaceChildren(
    ...columns.map((col) => {
      const line = document.createElement("div");
      line.style.cssText = "display: flex; align-items: center; gap: 8px";
      const trigger = document.createElement("span");
      trigger.setAttribute("data-xh-part", "column-visibility-trigger");
      trigger.setAttribute("value", col.id);
      const name = document.createElement("span");
      name.textContent = col.label;
      line.append(trigger, name);
      return line;
    }),
  );

  // WC 这一侧标记归作者：藏起来的列，它的表头格与单元格由作者自己收起
  function syncColumns() {
    const hidden = new Set(table.columnSettings.filter((c) => c.hidden).map((c) => c.id));
    for (const el of stage.querySelectorAll('[data-xh-part="column-header"], [data-xh-part="cell"]')) {
      el.hidden = hidden.has(el.getAttribute("value"));
    }
  }

  table.addEventListener("column-preference-change", (event) => {
    readout.textContent = `存下来的列偏好：${JSON.stringify(event.detail.value)}`;
    syncColumns();
  });

  syncColumns();
</script>
```

## 设计指引

### 何时使用

- 每条记录有多个字段需要按列对照。
- 需要排序、筛选、批量选择。

### 何时不用

- 每条只有标题和一句描述：用[列表](./list)，表格的列头是额外负担。
- 移动端窄屏：横滚的表格很难用，考虑换成卡片列表。

### 特性

- 排序、选择、展开三套状态各自可受控。
- 表头吸顶与列吸附、条纹、密度、边框都是开关。
- 支持多行表头与表头分组、跨列单元格、树形表格、单元格就地编辑、列过滤、拖拽调列宽。
- 行数很大时只渲窗口内的行。
- 工具条（`toolbar`）与列设置区（`column-list` + `column-visibility-trigger`）把排序、列宽与显隐三样接出来：设置区照 `columnSettings` 渲，藏起来的列也在其中。两块都摆在 `root` 之外——`root` 是 grid 系角色，子节点只能是行与行组。
- 三种非条目相位各有部件：空（`empty`）、在途（`loading`）、还有更多（`load-more-trigger`）。取下一页的按钮点了做什么归作者，取数在途时自动停用。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-table>` |
| Vue 组件 | `XhTableBody` `XhTableCaption` `XhTableCell` `XhTableColumnDragTrigger` `XhTableColumnHeader` `XhTableColumnList` `XhTableColumnResizeTrigger` `XhTableColumnVisibilityTrigger` `XhTableEmpty` `XhTableExpandTrigger` `XhTableExpandedRow` `XhTableFooter` `XhTableHeader` `XhTableLoadMoreTrigger` `XhTableLoading` `XhTableRoot` `XhTableRow` `XhTableRowDragTrigger` `XhTableRowSelectTrigger` `XhTableSelectAllTrigger` `XhTableSortTrigger` `XhTableToolbar` |
| 组合式函数 | `useTable` |
| 状态机 | `tableMachine` |
| 皮肤 | `@xihan-ui/styles/table.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="table"`：**`root`** · `header` · **`body`** · `footer` · `row` · `column-header` · `cell` · `caption` · `toolbar` · `column-list` · `column-visibility-trigger` · `select-all-trigger` · `row-select-trigger` · `sort-trigger` · `column-resize-trigger` · `column-drag-trigger` · `row-drag-trigger` · `expand-trigger` · `expanded-row` · `empty` · `loading` · `load-more-trigger` · `live-region`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `columns` | `TableColumnDef[]` |  | 列定义，列号与列总数的唯一事实源。缺省为空表。 |
| `rows` | `TableRowDef[]` |  | 行定义，行序与行号的唯一事实源。缺省为空表。 |
| `sort` | `TableSortDescriptor[]` |  | 排序链。给定即受控：cell 直读 prop，写只发 onSortChange 不落内部值。 |
| `defaultSort` | `TableSortDescriptor[]` |  |  |
| `selection` | `TableSelection` |  | 选中集合。给定即受控，语义同上。 |
| `defaultSelection` | `TableSelection` |  |  |
| `expandedValue` | `string[]` |  | 展开集合。给定即受控，语义同上。 |
| `defaultExpandedValue` | `string[]` |  |  |
| `selectionMode` | `TableSelectionMode` |  | 默认 none：不声明则没有选择机制，行也不报 aria-selected。 |
| `prefixColumns` | `TableColumnKind[]` |  | 要哪几列前缀列，按给定顺序插在最前面，默认一列都不插。 它们由库插入并**占住列号**——不占的话右侧所有列的 aria-colindex 会整体串位， 而这正是使用者手工往 columns 里塞假列的原因。作者照 `api.columns` 渲染即可， 每一项都自报 `kind`。 |
| `columnPreference` | `TableColumnPreference` |  | 列偏好。给定即受控：内部不自改，写只发 onColumnPreferenceChange。 持久化归使用者——库只负责把它算进生效列。 |
| `defaultColumnPreference` | `TableColumnPreference` |  |  |
| `page` | `number` |  | 当前页码与每页条数，只用来算序号，不参与切片——切片归调用方 （或分页组件的 `api.slice`）。都不给时序号退回可见序。 |
| `pageSize` | `number` |  |  |
| `loading` | `boolean` |  | 数据在路上：root 报 aria-busy，表体为空时加载态节点显形。 |
| `empty` | `boolean` |  | 显式声明表体为空；缺省按 rows 是否为空推导。 |
| `stickyHeader` | `boolean` |  | 表头吸顶：只落 data-fixed（布尔），钉住的实现归皮肤。列冻结走 data-frozen，两者不同名。 |
| `striped` | `boolean` |  | 斑马纹：表体偶数行换一层浅底。 |
| `borderless` | `boolean` |  | 去掉外框，只留行间横线：root 上的 data-bordered 随之缺席。 |
| `ruled` | `boolean` |  | 列与列之间加竖分隔线，落成 root 上的 data-split。 |
| `footer` | `boolean` |  | 表格带脚注行。行号空间的最后一行留给它，aria-rowcount 也把它算进去。 |
| `loop` | `boolean` |  | 上下键走到首尾是否回绕，默认 false。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只对调左右方向键的「展开/收起」语义。 |
| `size` | `Size` |  | 密度：sm / md / lg。只换单元格的纵向内边距与字号，列宽算法不受影响。 |
| `translations` | `Partial<TableTranslations>` |  |  |
| `rowReorderable` | `boolean` |  | 行可以拖着换位。整行都是拖动源；另有一个不占 Tab 位的拖动把手， 触屏那一路只走它（见 getRowDragTriggerProps）。 |
| `onRowMove` | `(details: TableRowMoveDetails) => void` |  |  |
| `allowRowDrop` | `(move: TableRowMoveDetails) => boolean` |  | 这一次搬家许不许。收到的是折算好的落点。 不给即都许——「落进自己的后代」与「落在禁用行上」两条库自己会拦。 |
| `onColumnPreferenceChange` | `(details: TableColumnPreferenceChangeDetails) => void` |  |  |
| `onSortChange` | `(details: TableSortChangeDetails) => void` |  |  |
| `onSelectionChange` | `(details: TableSelectionChangeDetails) => void` |  |  |
| `onExpandedValueChange` | `(details: TableExpandedValueChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `sort-change` | `TableSortChangeDetails` | 排序链变化；detail 为 `{ value: { id, direction }[] }` |
| `column-preference-change` | `` | 列偏好变化；detail 为 `{ value: TableColumnPreference }` |
| `selection-change` | `TableSelectionChangeDetails` | 选中集合变化；detail 为 `{ value: string[] \| 'all' }` |
| `expanded-value-change` | `TableExpandedValueChangeDetails` | 展开集合变化；detail 为 `{ value: string[] }` |
| `row-move` | `TableRowMoveDetails` | 行换了位置；detail 为 `{ id, parent, index, ids }`，parent 为 null 即根层，index 是在那一层的落位（已算过先摘后插），ids 是重排好的整份行序 |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTableRoot` | `default` | `TableRootSlotProps` |  |
| `XhTableRoot` | `toolbar` | `TableToolbarSlotProps` | 工具条槽：搜索、筛选、密度与列设置这些对整张表下手的控件写在这儿。 它渲成 root 的兄弟排在表前——root 是 grid 系角色，子节点只能是 row 与 rowgroup。 |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `column-visibility-trigger` | 'unchecked' \| 'checked' |
| `select-all-trigger` | tableSelectionState(selection, selectableIds) |
| `expanded-row` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `resizing` · `columnDragging` · `rowDragging`

**事件**：`SORT.SET` · `SORT.TOGGLE` · `COLUMN_PREF.SET` · `COLUMN_RESIZE.START` · `COLUMN_RESIZE.MOVE` · `COLUMN_RESIZE.END` · `COLUMN_RESIZE.CANCEL` · `COLUMN_RESIZE.STEP` · `COLUMN_DRAG.START` · `COLUMN_DRAG.MOVE` · `COLUMN_DRAG.END` · `COLUMN_DRAG.CANCEL` · `COLUMN.MOVE_BY` · `ROW_DRAG.START` · `ROW_DRAG.MOVE` · `ROW_DRAG.END` · `ROW_DRAG.CANCEL` · `ROW.MOVE_BY` · `ROW.REORDER_BLOCKED` · `COLUMN_PREF.PATCH` · `SELECTION.SET` · `ROW.SELECT` · `SELECTION.ALL_TOGGLE` · `EXPANDED.SET` · `ROW.EXPAND` · `ROW.COLLAPSE` · `ROW.EXPAND_TOGGLE` · `ROW.FOCUS` · `TABLE.BLUR`

## connect API

`useTable` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `columns` | `readonly TableColumn[]` | 生效的列：前缀列在前、数据列在后，各自自报 kind。 列号、渲染顺序都以它为准；不要前缀列时它与作者给的那份一模一样。 |
| `draggableColumns` | `readonly string[]` | 可以拖着换位的那一段列 id。声明了 `reorderable`、不是冻结列、且彼此相连。 冻结列与不可拖的列是屏障，把可拖范围切成段；这里给的是最长的那一段。 拿它决定渲不渲把手，与库内部判「能不能落」的口径是同一份。 |
| `rowReorderDisabledReason` | `TableRowReorderReason \| null` | 行拖不动的原因，能拖时是 null。声明了 rowReorderable 才可能非空。 库不自己弹提示——要不要把原因显示给用户是使用者的事。 |
| `dropTarget` | `TableDropTarget \| null` | 此刻的落点；松手就落在这儿。没有合法落点时是 null，指示线跟着消失。 |
| `announcement` | `string` | 读屏播报文本。渲进 live-region，不进视觉版面。 |
| `rows` | `readonly TableRowDef[]` | 作者给的行定义。 |
| `visibleRows` | `readonly TableVisibleRow[]` | 展开摊平后的可见行序列（详情行插在它所属数据行之后）。 |
| `sort` | `TableSortDescriptor[]` |  |
| `selection` | `TableSelection` |  |
| `selectionState` | `TableSelectionState` | 全选把手的三态，只按**可选行**（未禁用）算。 |
| `selectionMode` | `TableSelectionMode` |  |
| `expandedValue` | `string[]` |  |
| `focusedRow` | `string \| null` | 焦点锚点；焦点不在表体里时为 null。 |
| `loading` | `boolean` |  |
| `empty` | `boolean` | 表体为空（显式声明或 rows 为空）。 |
| `rowCount` | `number` | aria-rowcount：表头行 + 可见行 + 脚注行。 |
| `columnCount` | `number` | aria-colcount：列定义的条数。 |
| `isSelected` | `(value: string) => boolean` |  |
| `isExpanded` | `(value: string) => boolean` |  |
| `sortDirection` | `(value: string) => TableSortDirection \| null` | 该列当前的排序方向；不参与排序时为 null。 |
| `sortPriority` | `(value: string) => number` | 该列在排序链里的优先级，1 起算；不参与排序时为 0。 |
| `setSort` | `(next: TableSortDescriptor[]) => void` |  |
| `toggleSort` | `(value: string, options?: { append?: boolean }) => void` |  |
| `setSelection` | `(next: TableSelection) => void` |  |
| `selectRow` | `(value: string, options?: { extend?: boolean }) => void` | 选中某一行。extend 为真时选中锚点到这一行那一段（仅复选）。 |
| `toggleSelectAll` | `() => void` |  |
| `setExpandedValue` | `(next: string[]) => void` |  |
| `expandRow` | `(value: string) => void` |  |
| `collapseRow` | `(value: string) => void` |  |
| `toggleExpandRow` | `(value: string) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getCaptionProps` | `() => T['element']` |  |
| `getToolbarProps` | `() => T['element']` | 工具条：搜索、筛选、密度与列设置这些**对整张表下手**的控件摆在这儿。 它是 root 的兄弟不是子节点——root 是 grid 系角色，子节点只能是 row 与 rowgroup。 不给 role：一条控件带要不要 role=toolbar（连同那套方向键 roving）归作者， 要就往里放一个 Toolbar 组件。 |
| `getColumnListProps` | `() => T['element']` | 列设置区：一列一行，行里放显隐把手、列名与作者自己的宽 / 冻结 / 排序控件。 渲什么照 `columnSettings` 走。 |
| `getColumnVisibilityTriggerProps` | `(props: TableColumnProps) => T['element']` | 一列的显隐把手（复选形态）。最后一列显示着时它转 aria-disabled。 |
| `getHeaderProps` | `() => T['element']` |  |
| `getBodyProps` | `() => T['element']` |  |
| `getFooterProps` | `() => T['element']` |  |
| `getHeaderRowProps` | `() => T['element']` | 表头那一行：恒占行号空间的第 1 行。 |
| `getFooterRowProps` | `() => T['element']` | 脚注那一行：占行号空间的最后一行。 |
| `rowNumber` | `(rowId: string) => string` | 这一行显示什么序号。平表是分页全局序号，树形是大纲编号。 不出序号列时仍可调用——它是纯计算，不看要不要那一列。 |
| `columnPreference` | `TableColumnPreference` | 当下的列偏好。原样交出去即可存盘。 |
| `columnSettings` | `readonly TableColumnSetting[]` | 列设置区照它渲：作者定义的那些列，按偏好排过序，**藏起来的也在其中**。 每条自带显隐、冻结、宽与排序，够渲一整行设置项而不必回去比对两份数组。 |
| `setColumnHidden` | `(columnId: string, hidden: boolean) => void` | 藏起 / 放出一列。 |
| `setColumnSticky` | `(columnId: string, sticky: boolean \| 'start' \| 'end') => void` | 改一列的冻结档。false 是不冻结，true 等于 'start'。 |
| `moveColumn` | `(columnId: string, toIndex: number) => void` | 把一列挪到第几位（只在作者定义的那些列之间算，0 起算）。 |
| `setColumnWidth` | `(columnId: string, width: number \| string) => void` | 改一列的宽。 |
| `setColumnPreference` | `(next?: TableColumnPreference) => void` | 整份偏好换掉；不给即清空，回到作者定义的原样。 |
| `getRowProps` | `(props: TableRowProps) => T['element']` |  |
| `getColumnHeaderProps` | `(props: TableColumnProps) => T['element']` |  |
| `getCellProps` | `(props: TableCellProps) => T['element']` |  |
| `getSelectAllTriggerProps` | `() => T['element']` |  |
| `getRowSelectTriggerProps` | `(props: TableRowProps) => T['element']` |  |
| `getSortTriggerProps` | `(props: TableColumnProps) => T['element']` |  |
| `getColumnResizeTriggerProps` | `(props: TableColumnProps) => T['element']` | 列宽把手。只有 resizable 的列才渲它。 |
| `getColumnDragTriggerProps` | `(props: TableColumnProps) => T['element']` | 列拖拽把手。只有 reorderable 的列才渲它。 |
| `getRowDragTriggerProps` | `(props: TableRowProps) => T['element']` | 行拖动把手。触屏那一路唯一的入口，不占 Tab 位。 常挂即可：rowReorderable 关着或这张表拖不动时它自报 data-disabled、也不再让出滚动， 渲了不会错。按拖不拖得动来决定渲不渲，会让 DOM 结构随状态变。 |
| `getExpandTriggerProps` | `(props: TableRowProps) => T['element']` |  |
| `getExpandedRowProps` | `(props: TableRowProps) => T['element']` |  |
| `getEmptyProps` | `() => T['element']` |  |
| `getLoadingProps` | `() => T['element']` |  |
| `getLoadMoreTriggerProps` | `() => T['element']` | 取下一页的入口：还有没有下一页、点了做什么都归作者， 连接层只保证取数在途那一段点不动。 |
| `getLiveRegionProps` | `() => T['element']` | 拖动过程的读屏播报区。视觉隐藏，文本从 `announcement` 取。 它必须在拖动开始之前就在 DOM 上——读屏不播报后插入的节点。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/grid/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the table body | 表体只占一个 Tab 位：焦点进入锚点行，无锚点时先落 body 再由它转投；再按一次 Tab 整体离开表体 |
| `ArrowDown` | focus in table body | 焦点移到下一个可见数据行（禁用行跳过；详情行不是落点；loop 默认关，末行不回绕） |
| `ArrowUp` | focus in table body | 焦点移到上一个可见数据行（禁用行跳过；loop 默认关，首行不回绕） |
| `Home` | focus in table body | 焦点移到首个可见数据行 |
| `End` | focus in table body | 焦点移到末个可见数据行 |
| `Space` | focus on row, selectionMode 非 none 且该行未禁用 | 切换焦点行的选中（单选替换、复选增删）；选不动时不吞这个键，页面照常滚动 |
| `ArrowRight` | focus on 可展开且收起的行（dir=rtl 时改由 ArrowLeft 承担） | 就地展开当前行，焦点不动；不可展开、已展开或禁用的行上什么都不做且不吞键 |
| `ArrowLeft` | focus on 可展开且已展开的行（dir=rtl 时改由 ArrowRight 承担） | 就地收起当前行，焦点不动；其余情形什么都不做且不吞键 |
| `Enter` / `Space` | focus on sort-trigger, 该列 sortable | 排序方向按 升序 → 降序 → 不排序 循环；按住 Shift 是追加到排序链而不是替换整条链 |
| `Enter` / `Space` | focus on select-all-trigger, selectionMode=multiple | 当前可选行全选中就整段清空，否则整段选上；三态由 aria-checked 报出（半选为 mixed） |
| `Enter` / `Space` | focus on column-visibility-trigger | 藏起 / 放出这一列；设置区不是 roving 集合，一列一个 Tab 位，Tab 一路走下去即可逐列开关。只剩最后一列显示着时它转 aria-disabled，按了不动 |
| `Ctrl+A` / `Cmd+A` | focus in table body, selectionMode=multiple | 与全选把手同义：当前可选行全选中就整段清空，否则整段选上（禁用行不算进基数）。单选与不可选的表格不吞这个键，交还浏览器的整页全选；按住不放的连发只算一次 |
| `ArrowLeft` / `ArrowRight` | focus in column-resize-trigger，该列 resizable | 把这一列按 8px 收窄 / 加宽；往行尾侧推是加宽，rtl 下左右两键对调，语义恒是「加宽 / 收窄」 |
| `Shift+ArrowLeft` / `Shift+ArrowRight` | focus in column-resize-trigger，该列 resizable | 按 40px 收窄 / 加宽，方向规则同上 |
| `ArrowLeft` / `ArrowRight` | focus in column-drag-trigger，该列在可拖的那一段里 | 把这一列往前 / 往后挪一位，按一下就是一次完整提交；往行首侧挪是往前，rtl 下左右两键对调，语义恒是「往前 / 往后」；已在段首 / 段末就不动，也不回绕 |
| `Home` / `End` | focus in column-drag-trigger，该列在可拖的那一段里 | 把这一列挪到可拖那一段的段首 / 段末；rtl 下两键对调，语义恒是「段首 / 段末」；已经在那儿就不动 |
| `Alt+ArrowUp` / `Alt+ArrowDown` | focus in table body，rowReorderable 且行拖拽没有被阻断的原因 | 把焦点行往前 / 往后挪一位，按一下就是一次完整提交，不进拖动态；纵轴与文字方向无关，rtl 下两键不对调；已在首行 / 末行就不动，也不回绕；焦点锚点跟着搬走的那一行，连按几下能一路挪到位。裸方向键仍是导航、Space 仍是选中、左右键仍是展开收起 |
| `Alt+ArrowLeft` / `Alt+ArrowRight` | focus in table body，rows 里有行声明了 parentId，rowReorderable 且行拖拽没有被阻断的原因 | 把焦点行改一层缩进：往里是认上一个兄弟当爹，往外是变成父行的下一个兄弟；按一下就是一次完整提交，不进拖动态；横轴跟着文字方向翻，rtl 下两键对调，语义恒是「往里 / 往外」；没有上一个兄弟就缩不进去、已在根层就退不出来，两种情形都不动。rows 里一行都不带 parentId 时这两个键不归表格管，放行给页面 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `root` | `aria-colcount` | columns.length \|\| undefined |
| `root` | `aria-labelledby` | `caption` 部件的 id |
| `root` | `aria-multiselectable` | 'true' \| 'false' |
| `root` | `aria-rowcount` | HEADER_ROW_COUNT + visibleRows.length + (hasFooter ? … |
| `root` | `role` | 'treegrid' \| 'grid' |
| `header` | `role` | 'rowgroup' |
| `body` | `role` | 'rowgroup' |
| `footer` | `role` | 'rowgroup' |
| `row` | `aria-controls` | `detail` 部件的 id \| undefined |
| `row` | `aria-disabled` | 'true' \| 'false' |
| `row` | `aria-expanded` | 'true' \| 'false' \| undefined |
| `row` | `aria-level` | metaIndex.get(row.value)?.level \| undefined |
| `row` | `aria-posinset` | metaIndex.get(row.value)?.posInSet \| undefined |
| `row` | `aria-rowindex` | dataRowIndex.get(row.value) |
| `row` | `aria-selected` | 'true' \| 'false' \| undefined |
| `row` | `aria-setsize` | metaIndex.get(row.value)?.setSize \| undefined |
| `row` | `role` | 'row' |
| `column-header` | `aria-colindex` | columnIndex.get(column.value) |
| `column-header` | `aria-sort` | 'ascending' \| 'descending' \| 'none' \| undefined |
| `column-header` | `role` | 'columnheader' |
| `cell` | `aria-colindex` | columnIndex.get(cell.value) |
| `cell` | `aria-colspan` | cell.colSpan \| undefined |
| `cell` | `role` | 'gridcell' |
| `toolbar` | `aria-label` | label.toolbar |
| `column-list` | `aria-label` | label.columnList |
| `column-list` | `role` | 'group' |
| `column-visibility-trigger` | `aria-checked` | 'false' \| 'true' |
| `column-visibility-trigger` | `aria-disabled` | 'false' \| 'true' |
| `column-visibility-trigger` | `aria-label` | label.columnVisibility(def?.label ?? column.value) |
| `column-visibility-trigger` | `role` | 'checkbox' |
| `select-all-trigger` | `aria-checked` | 'true' \| 'mixed' \| 'false' |
| `select-all-trigger` | `aria-disabled` | 'false' \| 'true' |
| `select-all-trigger` | `aria-label` | label.selectAll |
| `select-all-trigger` | `role` | 'checkbox' |
| `row-select-trigger` | `aria-hidden` | 'true' |
| `sort-trigger` | `aria-disabled` | 'false' \| 'true' |
| `sort-trigger` | `role` | 'button' |
| `column-resize-trigger` | `aria-disabled` | 'false' \| 'true' |
| `column-resize-trigger` | `aria-label` | label.columnResize(def?.label ?? column.value) |
| `column-resize-trigger` | `aria-orientation` | 'vertical' |
| `column-resize-trigger` | `aria-valuemax` | def?.maxWidth \| undefined |
| `column-resize-trigger` | `aria-valuemin` | def?.minWidth \| undefined |
| `column-resize-trigger` | `aria-valuenow` | columnNumericWidth(context.get('columnPreference').wi… |
| `column-resize-trigger` | `role` | 'separator' |
| `column-drag-trigger` | `aria-disabled` | 'false' \| 'true' |
| `column-drag-trigger` | `aria-label` | label.columnDrag(def?.label ?? column.value) |
| `column-drag-trigger` | `aria-roledescription` | 'draggable column' |
| `column-drag-trigger` | `role` | 'button' |
| `row-drag-trigger` | `aria-hidden` | 'true' |
| `expand-trigger` | `aria-hidden` | 'true' |
| `expanded-row` | `aria-level` | (metaIndex.get(row.value)?.level ?? 1) + 1 \| undefined |
| `expanded-row` | `aria-posinset` | 1 \| undefined |
| `expanded-row` | `aria-rowindex` | detailRowIndex.get(row.value) |
| `expanded-row` | `aria-setsize` | 1 \| undefined |
| `expanded-row` | `role` | 'row' |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |
| `live-region` | `role` | 'status' |
| `header-row` | `aria-rowindex` | 1 |
| `footer-row` | `aria-rowindex` | HEADER_ROW_COUNT + visibleRows.length + (hasFooter ? … \| undefined |
| `header-row` | `role` | 'row' |
| `footer-row` | `role` | 'row' |

## 样式

默认皮肤 `@xihan-ui/styles/table.css` 按部件选择：`[data-scope="table"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-bordered` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-fixed` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-split` | ''（条件成立时才出现） |
| `root` | `data-striped` | ''（条件成立时才出现） |
| `header` | `data-fixed` | ''（条件成立时才出现） |
| `body` | `data-empty` | ''（条件成立时才出现） |
| `row` | `data-draggable` | ''（条件成立时才出现） |
| `row` | `data-dragging` | ''（条件成立时才出现） |
| `row` | `data-drop` | 'before' \| 'after' \| 'inside' |
| `row` | `data-section` | 'body' |
| `column-header` | `data-dragging` | ''（条件成立时才出现） |
| `column-header` | `data-drop` | 'before' \| 'after' |
| `column-header` | `data-sortable` | ''（条件成立时才出现） |
| `cell` | `data-disabled` | ''（条件成立时才出现） \| undefined |
| `cell` | `data-dragging` | ''（条件成立时才出现） |
| `cell` | `data-drop` | 'before' \| 'after' |
| `cell` | `data-selected` | ''（条件成立时才出现） \| undefined |
| `toolbar` | `data-size` | props.size |
| `column-list` | `data-size` | props.size |
| `column-visibility-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `column-visibility-trigger` | `data-state` | 'unchecked' \| 'checked' |
| `select-all-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `select-all-trigger` | `data-state` | tableSelectionState(selection, selectableIds) |
| `sort-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `column-resize-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `column-resize-trigger` | `data-resizing` | ''（条件成立时才出现） |
| `column-drag-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `column-drag-trigger` | `data-dragging` | ''（条件成立时才出现） |
| `row-drag-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `row-drag-trigger` | `data-dragging` | ''（条件成立时才出现） |
| `expanded-row` | `data-dragging` | ''（条件成立时才出现） |
| `expanded-row` | `data-state` | 'open' \| 'closed' |
| `load-more-trigger` | `data-loading` | ''（条件成立时才出现） |
| `header-row` | `data-section` | 'header' |
| `footer-row` | `data-section` | 'footer' |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-table-bg` | `root` | `background` | `default` | `--xh-bg-surface` | table 的 root 部件 background 覆盖槽。 |
| `--xh-table-border` | `footer`<br>`header`<br>`root` | `border`<br>`border-block-end`<br>`border-block-start` | `bordered`<br>`default` | `--xh-border-default` | table 的 footer、header、root 部件 border、border-block-end、border-block-start 覆盖槽。 |
| `--xh-table-caption-fg` | `caption` | `color` | `default` | `--xh-fg-muted` | table 的 caption 部件 color 覆盖槽。 |
| `--xh-table-caption-font-size` | `caption` | `font-size` | `default` | `--xh-text-label-size` | table 的 caption 部件 font-size 覆盖槽。 |
| `--xh-table-caption-font-weight` | `caption` | `font-weight` | `default` | `--xh-text-label-weight` | table 的 caption 部件 font-weight 覆盖槽。 |
| `--xh-table-caption-px` | `caption` | `padding-inline` | `default` | `--xh-space-3` | table 的 caption 部件 padding-inline 覆盖槽。 |
| `--xh-table-caption-py` | `caption` | `padding-block` | `default` | `--xh-space-2` | table 的 caption 部件 padding-block 覆盖槽。 |
| `--xh-table-cell-gap` | `cell`<br>`column-header` | `gap` | `default` | `--xh-control-gap-md` | table 的 cell、column-header 部件 gap 覆盖槽。 |
| `--xh-table-cell-min-w` | `cell`<br>`column-header` | `min-inline-size` | `default` | `3rem` | table 的 cell、column-header 部件 min-inline-size 覆盖槽。 |
| `--xh-table-cell-px` | `cell`<br>`column-header` | `padding-inline` | `default` | `--xh-control-px-sm` | table 的 cell、column-header 部件 padding-inline 覆盖槽。 |
| `--xh-table-cell-py` | `cell`<br>`column-header` | `padding-block` | `default` | `--xh-_table-cell-py` | table 的 cell、column-header 部件 padding-block 覆盖槽。 |
| `--xh-table-column-fg` | `column-header` | `color` | `default` | `--xh-fg-muted` | table 的 column-header 部件 color 覆盖槽。 |
| `--xh-table-column-font-weight` | `column-header` | `font-weight` | `default` | `--xh-text-label-weight` | table 的 column-header 部件 font-weight 覆盖槽。 |
| `--xh-table-column-list-fg` | `column-list` | `color` | `default` | `--xh-fg-default` | table 的 column-list 部件 color 覆盖槽。 |
| `--xh-table-column-list-font-size` | `column-list` | `font-size` | `default` | `--xh-text-secondary-size` | table 的 column-list 部件 font-size 覆盖槽。 |
| `--xh-table-column-list-gap` | `column-list` | `gap` | `default` | `--xh-_table-column-list-gap` | table 的 column-list 部件 gap 覆盖槽。 |
| `--xh-table-detail-bg` | `expanded-row` | `background` | `default` | `--xh-bg-subtle` | table 的 expanded-row 部件 background 覆盖槽。 |
| `--xh-table-detail-px` | `cell`<br>`expanded-row` | `padding-inline` | `default` | `--xh-space-4` | table 的 cell、expanded-row 部件 padding-inline 覆盖槽。 |
| `--xh-table-detail-py` | `cell`<br>`expanded-row` | `padding-block` | `default` | `--xh-space-3` | table 的 cell、expanded-row 部件 padding-block 覆盖槽。 |
| `--xh-table-drag-fg` | `column-drag-trigger` | `color` | `default` | `--xh-fg-subtle` | table 的 column-drag-trigger 部件 color 覆盖槽。 |
| `--xh-table-drag-fg-active` | `column-drag-trigger` | `color` | `disabled`<br>`dragging`<br>`hover`<br>`not([data-disabled])` | `--xh-fg-default` | table 的 column-drag-trigger 部件 color 覆盖槽。 |
| `--xh-table-drag-fg-disabled` | `column-drag-trigger` | `color` | `disabled` | `--xh-fg-disabled` | table 的 column-drag-trigger 部件 color 覆盖槽。 |
| `--xh-table-drag-grip-h` | `column-drag-trigger` | `block-size` | `empty` | `--xh-space-2` | table 的 column-drag-trigger 部件 block-size 覆盖槽。 |
| `--xh-table-drag-grip-w` | `column-drag-trigger` | `inline-size` | `empty` | `--xh-space-1` | table 的 column-drag-trigger 部件 inline-size 覆盖槽。 |
| `--xh-table-drag-size` | `column-drag-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | table 的 column-drag-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-table-dragging-opacity` | `cell`<br>`column-header`<br>`expanded-row`<br>`row` | `opacity` | `dragging` | `--xh-state-dragging-opacity` | table 的 cell、column-header、expanded-row、row 部件 opacity 覆盖槽。 |
| `--xh-table-drop-fg` | `cell`<br>`column-header`<br>`row` | `background`<br>`box-shadow` | `drop`<br>`drop=after`<br>`drop=before`<br>`drop=inside`<br>`frozen`<br>`is([data-drop='before'], [data-drop='after'])`<br>`not([data-frozen])` | `--xh-bg-brand` | table 的 cell、column-header、row 部件 background、box-shadow 覆盖槽。 |
| `--xh-table-drop-inside-bg` | `body`<br>`root`<br>`row` | `background` | `disabled`<br>`drop=inside`<br>`not([data-disabled])` | `--xh-bg-brand-subtle` | table 的 body、root、row 部件 background 覆盖槽。 |
| `--xh-table-drop-line` | `cell`<br>`column-header`<br>`row` | `block-size`<br>`box-shadow`<br>`inline-size` | `drop`<br>`drop=after`<br>`drop=before`<br>`drop=inside`<br>`frozen`<br>`is([data-drop='before'], [data-drop='after'])`<br>`not([data-frozen])` | `--xh-stroke-thick` | table 的 cell、column-header、row 部件 block-size、box-shadow、inline-size 覆盖槽。 |
| `--xh-table-expand-fg` | `expand-trigger` | `color` | `default` | `--xh-fg-subtle` | table 的 expand-trigger 部件 color 覆盖槽。 |
| `--xh-table-fg` | `root` | `color` | `default` | `--xh-fg-default` | table 的 root 部件 color 覆盖槽。 |
| `--xh-table-font-size` | `root` | `font-size` | `default` | `--xh-_table-font-size` | table 的 root 部件 font-size 覆盖槽。 |
| `--xh-table-footer-bg` | `footer` | `background` | `default` | `--xh-bg-subtle` | table 的 footer 部件 background 覆盖槽。 |
| `--xh-table-footer-font-weight` | `footer` | `font-weight` | `default` | `--xh-font-weight-medium` | table 的 footer 部件 font-weight 覆盖槽。 |
| `--xh-table-header-bg` | `column-header`<br>`header` | `background` | `default`<br>`frozen` | `--xh-bg-subtle` | table 的 column-header、header 部件 background 覆盖槽。 |
| `--xh-table-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | table 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-table-load-more-trigger-bg-hover` | `load-more-trigger` | `background-color` | `hover` | `--xh-bg-subtle` | table 的 load-more-trigger 部件 background-color 覆盖槽。 |
| `--xh-table-load-more-trigger-fg` | `load-more-trigger` | `color` | `default` | `--xh-fg-brand-strong` | table 的 load-more-trigger 部件 color 覆盖槽。 |
| `--xh-table-load-more-trigger-font-size` | `load-more-trigger` | `font-size` | `default` | `--xh-_table-font-size` | table 的 load-more-trigger 部件 font-size 覆盖槽。 |
| `--xh-table-load-more-trigger-gap` | `load-more-trigger` | `gap` | `default` | `--xh-space-2` | table 的 load-more-trigger 部件 gap 覆盖槽。 |
| `--xh-table-load-more-trigger-px` | `load-more-trigger` | `padding-inline` | `default` | `--xh-space-4` | table 的 load-more-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-table-load-more-trigger-py` | `load-more-trigger` | `padding-block` | `default` | `--xh-space-3` | table 的 load-more-trigger 部件 padding-block 覆盖槽。 |
| `--xh-table-load-more-trigger-radius` | `load-more-trigger` | `border-radius` | `default` | `--xh-shape-control` | table 的 load-more-trigger 部件 border-radius 覆盖槽。 |
| `--xh-table-loading-duration` | `loading` | `animation` | `default` | `--xh-shimmer-duration` | table 的 loading 部件 animation 覆盖槽。 |
| `--xh-table-max-h` | `root` | `max-block-size` | `default` | `--xh-viewport-h-lg` | table 的 root 部件 max-block-size 覆盖槽。 |
| `--xh-table-radius` | `root` | `border-radius` | `bordered` | `--xh-shape-surface` | table 的 root 部件 border-radius 覆盖槽。 |
| `--xh-table-resize-fg` | `column-resize-trigger` | `background` | `default` | `--xh-border-default` | table 的 column-resize-trigger 部件 background 覆盖槽。 |
| `--xh-table-resize-fg-active` | `column-resize-trigger` | `background` | `hover`<br>`resizing` | `--xh-bg-brand` | table 的 column-resize-trigger 部件 background 覆盖槽。 |
| `--xh-table-resize-line` | `column-resize-trigger` | `inline-size` | `default` | `--xh-stroke-thin` | table 的 column-resize-trigger 部件 inline-size 覆盖槽。 |
| `--xh-table-resize-line-length` | `column-resize-trigger` | `block-size` | `default` | `60%` | table 的 column-resize-trigger 部件 block-size 覆盖槽。 |
| `--xh-table-resize-radius` | `column-resize-trigger` | `border-radius` | `default` | `--xh-shape-pill` | table 的 column-resize-trigger 部件 border-radius 覆盖槽。 |
| `--xh-table-resize-width` | `column-resize-trigger` | `inline-size` | `default` | `--xh-space-2` | table 的 column-resize-trigger 部件 inline-size 覆盖槽。 |
| `--xh-table-row-bg` | `row` | `background` | `default` | `--xh-bg-surface` | table 的 row 部件 background 覆盖槽。 |
| `--xh-table-row-bg-hover` | `body`<br>`row` | `background` | `disabled`<br>`highlighted`<br>`is(:hover, [data-highlighted])`<br>`not([data-disabled])` | `--xh-bg-subtle` | table 的 body、row 部件 background 覆盖槽。 |
| `--xh-table-row-bg-selected` | `row` | `background` | `selected` | `--xh-bg-subtle-active` | table 的 row 部件 background 覆盖槽。 |
| `--xh-table-row-bg-striped` | `body`<br>`root`<br>`row` | `background` | `striped`<br>`where(:nth-of-type(even)`<br>`where([data-scope='table'][data-part='root'][data-striped] [data-scope='table'][data-part='body'])` | `--xh-bg-subtle` | table 的 body、root、row 部件 background 覆盖槽。 |
| `--xh-table-row-border` | `body`<br>`cell`<br>`column-header`<br>`expanded-row`<br>`footer`<br>`header`<br>`root`<br>`row` | `border-block-start`<br>`border-inline-end` | `is([data-part='header'], [data-part='body'], [data-part='footer'])`<br>`is([data-part='row'], [data-part='expanded-row'])`<br>`not(:last-child)`<br>`not([hidden])`<br>`split` | `--xh-border-subtle` | table 的 body、cell、column-header、expanded-row、footer、header、root、row 部件 border-block-start、border-inline-end 覆盖槽。 |
| `--xh-table-row-drag-fg` | `row-drag-trigger` | `color` | `default` | `--xh-fg-subtle` | table 的 row-drag-trigger 部件 color 覆盖槽。 |
| `--xh-table-row-drag-fg-active` | `row-drag-trigger` | `color` | `disabled`<br>`dragging`<br>`hover`<br>`not([data-disabled])` | `--xh-fg-default` | table 的 row-drag-trigger 部件 color 覆盖槽。 |
| `--xh-table-row-drag-fg-disabled` | `row-drag-trigger` | `color` | `disabled` | `--xh-fg-disabled` | table 的 row-drag-trigger 部件 color 覆盖槽。 |
| `--xh-table-row-drag-grip-long` | `row-drag-trigger` | `inline-size` | `empty` | `--xh-space-2` | table 的 row-drag-trigger 部件 inline-size 覆盖槽。 |
| `--xh-table-row-drag-grip-short` | `row-drag-trigger` | `block-size` | `empty` | `--xh-space-1` | table 的 row-drag-trigger 部件 block-size 覆盖槽。 |
| `--xh-table-row-drag-size` | `row-drag-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | table 的 row-drag-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-table-sort-fg` | `sort-trigger` | `color` | `default` | `--xh-fg-subtle` | table 的 sort-trigger 部件 color 覆盖槽。 |
| `--xh-table-sort-fg-active` | `sort-trigger` | `color` | `sort-index`<br>`sort=asc`<br>`sort=desc` | `--xh-fg-default` | table 的 sort-trigger 部件 color 覆盖槽。 |
| `--xh-table-sort-gap` | `sort-trigger` | `gap` | `default` | `--xh-space-1` | table 的 sort-trigger 部件 gap 覆盖槽。 |
| `--xh-table-state-fg` | `empty`<br>`loading` | `color` | `default` | `--xh-fg-muted` | table 的 empty、loading 部件 color 覆盖槽。 |
| `--xh-table-state-gap` | `empty`<br>`loading` | `gap` | `default` | `--xh-space-2` | table 的 empty、loading 部件 gap 覆盖槽。 |
| `--xh-table-state-min-h` | `empty`<br>`loading` | `min-block-size` | `default` | `8rem` | table 的 empty、loading 部件 min-block-size 覆盖槽。 |
| `--xh-table-state-px` | `empty`<br>`loading` | `padding-inline` | `default` | `--xh-space-4` | table 的 empty、loading 部件 padding-inline 覆盖槽。 |
| `--xh-table-state-py` | `empty`<br>`loading` | `padding-block` | `default` | `--xh-space-6` | table 的 empty、loading 部件 padding-block 覆盖槽。 |
| `--xh-table-sticky-column-layer` | `cell`<br>`column-header`<br>`row` | `z-index` | `drop=after`<br>`drop=before`<br>`drop=inside`<br>`frozen`<br>`is([data-drop='before'], [data-drop='after'])` | `1` | table 的 cell、column-header、row 部件 z-index 覆盖槽。 |
| `--xh-table-sticky-header-layer` | `header` | `z-index` | `fixed` | `--xh-layer-sticky` | table 的 header 部件 z-index 覆盖槽。 |
| `--xh-table-sticky-inset` | `cell`<br>`column-header` | `inset-inline-end`<br>`inset-inline-start` | `frozen=end`<br>`frozen=start` | `0` | table 的 cell、column-header 部件 inset-inline-end、inset-inline-start 覆盖槽。 |
| `--xh-table-toolbar-fg` | `toolbar` | `color` | `default` | `--xh-fg-default` | table 的 toolbar 部件 color 覆盖槽。 |
| `--xh-table-toolbar-gap` | `toolbar` | `gap` | `default` | `--xh-_table-toolbar-gap` | table 的 toolbar 部件 gap 覆盖槽。 |
| `--xh-table-toolbar-py` | `toolbar` | `padding-block` | `default` | `--xh-space-2` | table 的 toolbar 部件 padding-block 覆盖槽。 |
| `--xh-table-trigger-bg-checked` | `column-visibility-trigger`<br>`row-select-trigger`<br>`select-all-trigger` | `background`<br>`border-color` | `is([data-state='checked'], [data-state='indeterminate'])`<br>`selected`<br>`state=checked`<br>`state=indeterminate` | `--xh-bg-brand` | table 的 column-visibility-trigger、row-select-trigger、select-all-trigger 部件 background、border-color 覆盖槽。 |
| `--xh-table-trigger-border` | `column-visibility-trigger`<br>`row-select-trigger`<br>`select-all-trigger` | `border` | `default` | `--xh-border-control` | table 的 column-visibility-trigger、row-select-trigger、select-all-trigger 部件 border 覆盖槽。 |
| `--xh-table-trigger-border-checked` | `column-visibility-trigger`<br>`row-select-trigger`<br>`select-all-trigger` | `border-color` | `is([data-state='checked'], [data-state='indeterminate'])`<br>`selected`<br>`state=checked`<br>`state=indeterminate` | `--xh-table-trigger-bg-checked` | table 的 column-visibility-trigger、row-select-trigger、select-all-trigger 部件 border-color 覆盖槽。 |
| `--xh-table-trigger-fg` | `column-visibility-trigger`<br>`row-select-trigger`<br>`select-all-trigger` | `--xh-_ring-color`<br>`background-color`<br>`color` | `default`<br>`disabled`<br>`focus-visible`<br>`not([data-disabled])`<br>`state=indeterminate` | `--xh-fg-on-brand` | table 的 column-visibility-trigger、row-select-trigger、select-all-trigger 部件 --xh-_ring-color、background-color、color 覆盖槽。 |
| `--xh-table-trigger-radius` | `column-drag-trigger`<br>`column-visibility-trigger`<br>`expand-trigger`<br>`row-drag-trigger`<br>`row-select-trigger`<br>`select-all-trigger`<br>`sort-trigger` | `border-radius` | `default` | `--xh-shape-control` | table 的 column-drag-trigger、column-visibility-trigger、expand-trigger、row-drag-trigger、row-select-trigger、select-all-trigger、sort-trigger 部件 border-radius 覆盖槽。 |
| `--xh-table-trigger-size` | `column-visibility-trigger`<br>`expand-trigger`<br>`row-select-trigger`<br>`select-all-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | table 的 column-visibility-trigger、expand-trigger、row-select-trigger、select-all-trigger 部件 block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

关键帧 `xh-table-loading-pulse` 随皮肤自带，不引用别处文件里的名字；`background-color` · `rotate` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 单元格里放[就地编辑](./editable)、[徽标](./badge)、[头像](./avatar)；下面接[分页](./pagination)；空态用[空状态](./empty-state)。

## 最佳实践

- 列宽尽量固定，别让内容长度决定列宽——翻页时整张表会重排。
- 批量选择要显示已选条数，并在跨页时说明选中范围。

## 反模式

- 列多到必须横滚却不吸附首列：滚过去就不知道哪一行是哪一行。
- 用表格做页面布局。
