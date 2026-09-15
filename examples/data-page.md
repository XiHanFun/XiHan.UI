来源：https://ui.docs.xihanfun.com/examples/data-page

# 数据页

一张订单列表：搜索、状态、时间粒度三道筛选收窄同一份数据，表格排序与勾选各管各的，筛没了换空态，取数时换加载态。

```vue
<script setup lang="ts">
import type { SelectNode } from "@xihan-ui/headless";
import {
  XhButton,
  XhEmptyStateDescription,
  XhEmptyStateRoot,
  XhEmptyStateTitle,
  XhPageHeaderDescription,
  XhPageHeaderExtra,
  XhPageHeaderRoot,
  XhPageHeaderTitle,
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
  XhPaginationSummary,
  XhSegmentedRoot,
  XhSelectRoot,
  XhSeparator,
  XhSpinner,
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableEmpty,
  XhTableHeader,
  XhTableLoading,
  XhTableRoot,
  XhTableRow,
  XhTableRowSelectTrigger,
  XhTableSelectAllTrigger,
  XhTableSortTrigger,
  XhTagLabel,
  XhTagRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/vue";
import { computed, ref, watch } from "vue";

interface Order {
  id: string;
  no: string;
  customer: string;
  amount: number;
  status: "paid" | "shipping" | "refund";
  days: number;
}

const statusMeta = {
  paid: { label: "已付款", tone: "success" as const },
  shipping: { label: "配送中", tone: "info" as const },
  refund: { label: "退款中", tone: "warning" as const },
};

const columns = [
  { id: "select", width: "3rem" },
  { id: "no", label: "单号", width: "10rem", sortable: true },
  { id: "customer", label: "客户" },
  { id: "amount", label: "金额", width: "7rem", sortable: true },
  { id: "status", label: "状态", width: "6rem" },
];

const source: Order[] = [
  { id: "o1", no: "SO-2041", customer: "远岫科技", amount: 1280, status: "paid", days: 1 },
  { id: "o2", no: "SO-2042", customer: "青川物流", amount: 640, status: "shipping", days: 2 },
  { id: "o3", no: "SO-2043", customer: "海塘制造", amount: 3990, status: "refund", days: 5 },
  { id: "o4", no: "SO-2044", customer: "远岫科技", amount: 210, status: "paid", days: 9 },
  { id: "o5", no: "SO-2045", customer: "临江商贸", amount: 1750, status: "shipping", days: 12 },
  { id: "o6", no: "SO-2046", customer: "海塘制造", amount: 880, status: "paid", days: 20 },
];

const statuses: SelectNode[] = [
  { value: "all", label: "全部状态" },
  { value: "paid", label: "已付款" },
  { value: "shipping", label: "配送中" },
  { value: "refund", label: "退款中" },
];

const ranges = [
  { value: "7", label: "近 7 天" },
  { value: "14", label: "近 14 天" },
  { value: "30", label: "近 30 天" },
];

const keyword = ref("");
const status = ref<string[]>(["all"]);
const range = ref("30");
const sort = ref<{ id: string; direction: "asc" | "desc" }[]>([]);
const selection = ref<string[] | "all">([]);
const page = ref(1);
const pageSize = 4;
const loading = ref(false);

// 四道筛选依次收窄：时间粒度、状态、关键词，最后按排序链排一遍
const filtered = computed(() => {
  const days = Number(range.value);
  const wanted = status.value[0] ?? "all";
  const text = keyword.value.trim();
  const rows = source.filter(
    order =>
      order.days <= days
      && (wanted === "all" || order.status === wanted)
      && (text === "" || order.no.includes(text) || order.customer.includes(text)),
  );
  if (sort.value.length === 0)
    return rows;
  return [...rows].sort((a, b) => {
    for (const rule of sort.value) {
      const diff = rule.id === "amount"
        ? a.amount - b.amount
        : a.no.localeCompare(b.no, "zh");
      if (diff !== 0)
        return rule.direction === "asc" ? diff : -diff;
    }
    return 0;
  });
});

const paged = computed(() =>
  filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize),
);

const rows = computed(() => paged.value.map(order => ({ id: order.id })));

// 筛选条件一动就退回第一页，否则会停在一页不存在的页码上
watch([keyword, status, range], () => {
  page.value = 1;
});

function resetFilters(): void {
  keyword.value = "";
  status.value = ["all"];
  range.value = "30";
  sort.value = [];
  selection.value = [];
}

// 取数用定时器代替真实请求，露一下加载态
let timer = 0;
function refresh(): void {
  window.clearTimeout(timer);
  loading.value = true;
  timer = window.setTimeout(() => {
    loading.value = false;
  }, 900);
}
</script>

<template>
  <div class="data-page">
    <XhPageHeaderRoot>
      <XhPageHeaderTitle>订单列表</XhPageHeaderTitle>
      <XhPageHeaderDescription>共 {{ source.length }} 条，筛选后 {{ filtered.length }} 条</XhPageHeaderDescription>
      <XhPageHeaderExtra>
        <XhButton variant="ghost" size="sm" @click="refresh">刷新</XhButton>
        <XhButton variant="solid" size="sm">导出</XhButton>
      </XhPageHeaderExtra>
    </XhPageHeaderRoot>

    <div class="data-page__filters">
      <XhTextFieldRoot v-model:value="keyword" placeholder="搜单号或客户">
        <XhTextFieldLabel>关键词</XhTextFieldLabel>
        <XhTextFieldControl class="data-page__search">
          <XhTextFieldInput />
        </XhTextFieldControl>
      </XhTextFieldRoot>

      <XhSelectRoot
        v-model:value="status"
        :collection="statuses"
        label="状态"
        placeholder="全部状态"
      />

      <XhSegmentedRoot v-model:value="range" :collection="ranges" aria-label="时间粒度" />

      <XhSeparator orientation="vertical" class="data-page__divider" />

      <!-- 触发器本身就是那颗按钮：提示只补一句说明，不另起一个控件 -->
      <XhTooltipRoot>
        <XhTooltipTrigger @click="resetFilters">清空条件</XhTooltipTrigger>
        <XhTooltipPositioner>
          <XhTooltipContent>
            关键词、状态、粒度、排序链与勾选一起清空
            <XhTooltipArrow />
          </XhTooltipContent>
        </XhTooltipPositioner>
      </XhTooltipRoot>
    </div>

    <XhTableRoot
      v-model:sort="sort"
      v-model:selection="selection"
      :columns="columns"
      :rows="rows"
      :loading="loading"
      selection-mode="multiple"
    >
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader value="select">
            <XhTableSelectAllTrigger />
          </XhTableColumnHeader>
          <XhTableColumnHeader value="no">
            <XhTableSortTrigger>单号</XhTableSortTrigger>
          </XhTableColumnHeader>
          <XhTableColumnHeader value="customer">客户</XhTableColumnHeader>
          <XhTableColumnHeader value="amount">
            <XhTableSortTrigger>金额</XhTableSortTrigger>
          </XhTableColumnHeader>
          <XhTableColumnHeader value="status">状态</XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>

      <XhTableBody>
        <XhTableRow v-for="order in paged" :key="order.id" :value="order.id">
          <XhTableCell value="select">
            <XhTableRowSelectTrigger />
          </XhTableCell>
          <XhTableCell value="no">{{ order.no }}</XhTableCell>
          <XhTableCell value="customer">{{ order.customer }}</XhTableCell>
          <XhTableCell value="amount">{{ order.amount.toLocaleString("zh-CN") }}</XhTableCell>
          <XhTableCell value="status">
            <!-- 状态列是一枚标签：语气跟着状态走，颜色不在这里手写 -->
            <XhTagRoot :tone="statusMeta[order.status].tone" size="sm">
              <XhTagLabel>{{ statusMeta[order.status].label }}</XhTagLabel>
            </XhTagRoot>
          </XhTableCell>
        </XhTableRow>
      </XhTableBody>

      <XhTableLoading>
        <span class="data-page__loading">
          <XhSpinner size="sm" />
          正在取数…
        </span>
      </XhTableLoading>

      <!-- 空态槽里放的就是空态组件，表格不必自己再造一套 -->
      <XhTableEmpty>
        <XhEmptyStateRoot>
          <XhEmptyStateTitle>这一组条件下没有订单</XhEmptyStateTitle>
          <XhEmptyStateDescription>放宽时间粒度，或者清空条件重来。</XhEmptyStateDescription>
        </XhEmptyStateRoot>
      </XhTableEmpty>
    </XhTableRoot>

    <XhPaginationRoot
      v-slot="{ pages }"
      v-model:page="page"
      class="data-page__pager"
      :count="filtered.length"
      :page-size="pageSize"
    >
      <XhPaginationSummary />
      <XhPaginationPrevTrigger />
      <template v-for="(item, index) in pages" :key="`${item}-${index}`">
        <XhPaginationEllipsisTrigger v-if="item === 'ellipsis'">…</XhPaginationEllipsisTrigger>
        <XhPaginationItem v-else :value="item">{{ item }}</XhPaginationItem>
      </template>
      <XhPaginationNextTrigger />
    </XhPaginationRoot>
  </div>
</template>

<style scoped>
.data-page {
  display: flex;
  flex-direction: column;
  gap: var(--xh-space-4);
  inline-size: 100%;
}

/* 各控件自带标题，按底边对齐，输入区才在一条线上 */
.data-page__filters {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: var(--xh-space-3);
}

.data-page__search {
  inline-size: 200px;
}

/* 竖线要有确定高度才画得出来，取控件行高那一档 */
.data-page__divider {
  block-size: var(--xh-control-h-md);
}

.data-page__loading {
  display: inline-flex;
  align-items: center;
  gap: var(--xh-space-2);
}

.data-page__pager {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--xh-space-2);
}
</style>
```

```html
<div
  id="data-page"
  style="display: flex; flex-direction: column; gap: var(--xh-space-4); inline-size: 100%"
>
  <xh-page-header>
    <div data-xh-part="root">
      <div data-xh-part="title">订单列表</div>
      <div data-xh-part="description">共 6 条，筛选后 6 条</div>
      <div data-xh-part="extra">
        <xh-button id="data-page-refresh" variant="ghost" size="sm">
          <button data-xh-part="root">刷新</button>
        </xh-button>
        <xh-button variant="solid" size="sm">
          <button data-xh-part="root">导出</button>
        </xh-button>
      </div>
    </div>
  </xh-page-header>

  <!-- 各控件自带标题，按底边对齐，输入区才在一条线上 -->
  <div style="display: flex; flex-wrap: wrap; align-items: end; gap: var(--xh-space-3)">
    <xh-text-field id="data-page-keyword" value="" placeholder="搜单号或客户">
      <div data-xh-part="root">
        <label data-xh-part="label">关键词</label>
        <div data-xh-part="control" style="inline-size: 200px">
          <input data-xh-part="input" />
        </div>
      </div>
    </xh-text-field>

    <xh-select id="data-page-status" value="all" placeholder="全部状态">
      <div data-xh-part="root">
        <span data-xh-part="label">状态</span>
        <div data-xh-part="control">
          <button data-xh-part="trigger">
            <span data-xh-part="value-text"></span>
            <span data-xh-part="indicator"></span>
          </button>
        </div>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <div data-xh-part="list">
              <div data-xh-part="item" value="all">
                <span data-xh-part="item-text">全部状态</span>
                <span data-xh-part="item-indicator"></span>
              </div>
              <div data-xh-part="item" value="paid">
                <span data-xh-part="item-text">已付款</span>
                <span data-xh-part="item-indicator"></span>
              </div>
              <div data-xh-part="item" value="shipping">
                <span data-xh-part="item-text">配送中</span>
                <span data-xh-part="item-indicator"></span>
              </div>
              <div data-xh-part="item" value="refund">
                <span data-xh-part="item-text">退款中</span>
                <span data-xh-part="item-indicator"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </xh-select>

    <xh-segmented id="data-page-range" value="30">
      <div data-xh-part="root" aria-label="时间粒度">
        <span data-xh-part="indicator"></span>
        <button data-xh-part="item" value="7">
          <span data-xh-part="item-text">近 7 天</span>
        </button>
        <button data-xh-part="item" value="14">
          <span data-xh-part="item-text">近 14 天</span>
        </button>
        <button data-xh-part="item" value="30">
          <span data-xh-part="item-text">近 30 天</span>
        </button>
        <input data-xh-part="hidden-input" />
      </div>
    </xh-segmented>

    <xh-separator orientation="vertical" style="display: contents">
      <!-- 竖线要有确定高度才画得出来，取控件行高那一档 -->
      <div data-xh-part="root" style="block-size: var(--xh-control-h-md)"></div>
    </xh-separator>

    <!-- 触发器本身就是那颗按钮：提示只补一句说明，不另起一个控件 -->
    <xh-tooltip id="data-page-reset">
      <button data-xh-part="trigger">清空条件</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          关键词、状态、粒度、排序链与勾选一起清空
          <div data-xh-part="arrow"></div>
        </div>
      </div>
    </xh-tooltip>
  </div>

  <xh-table id="data-page-table" selection-mode="multiple">
    <div data-xh-part="root">
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="select">
            <span data-xh-part="select-all-trigger"></span>
          </div>
          <div data-xh-part="column-header" value="no">
            <span data-xh-part="sort-trigger">单号</span>
          </div>
          <div data-xh-part="column-header" value="customer">客户</div>
          <div data-xh-part="column-header" value="amount">
            <span data-xh-part="sort-trigger">金额</span>
          </div>
          <div data-xh-part="column-header" value="status">状态</div>
        </div>
      </div>
      <div data-xh-part="body"></div>

      <div data-xh-part="loading">
        <span style="display: inline-flex; align-items: center; gap: var(--xh-space-2)">
          <xh-spinner size="sm" label="正在取数">
            <span data-xh-part="root"></span>
          </xh-spinner>
          正在取数…
        </span>
      </div>

      <!-- 空态槽里放的就是空态组件，表格不必自己再造一套 -->
      <div data-xh-part="empty">
        <xh-empty-state>
          <div data-xh-part="root">
            <p data-xh-part="title">这一组条件下没有订单</p>
            <p data-xh-part="description">放宽时间粒度，或者清空条件重来。</p>
          </div>
        </xh-empty-state>
      </div>
    </div>
  </xh-table>

  <xh-pagination id="data-page-pager" count="6" page-size="4" page="1" style="inline-size: 100%">
    <nav
      data-xh-part="root"
      style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--xh-space-2)"
    >
      <span data-xh-part="summary"></span>
      <button data-xh-part="prev-trigger"></button>
      <button data-xh-part="item" value="1">1</button>
      <button data-xh-part="next-trigger"></button>
    </nav>
  </xh-pagination>
</div>

<script type="module">
  const statusMeta = {
    paid: { label: "已付款", tone: "success" },
    shipping: { label: "配送中", tone: "info" },
    refund: { label: "退款中", tone: "warning" },
  };

  const source = [
    { id: "o1", no: "SO-2041", customer: "远岫科技", amount: 1280, status: "paid", days: 1 },
    { id: "o2", no: "SO-2042", customer: "青川物流", amount: 640, status: "shipping", days: 2 },
    { id: "o3", no: "SO-2043", customer: "海塘制造", amount: 3990, status: "refund", days: 5 },
    { id: "o4", no: "SO-2044", customer: "远岫科技", amount: 210, status: "paid", days: 9 },
    { id: "o5", no: "SO-2045", customer: "临江商贸", amount: 1750, status: "shipping", days: 12 },
    { id: "o6", no: "SO-2046", customer: "海塘制造", amount: 880, status: "paid", days: 20 },
  ];

  const stage = document.getElementById("data-page");
  const keywordField = stage.querySelector("#data-page-keyword");
  const statusSelect = stage.querySelector("#data-page-status");
  const rangeGroup = stage.querySelector("#data-page-range");
  const table = stage.querySelector("#data-page-table");
  const body = table.querySelector('[data-xh-part="body"]');
  const pager = stage.querySelector("#data-page-pager");
  const pagerRoot = pager.querySelector('[data-xh-part="root"]');
  const pagerNext = pagerRoot.querySelector('[data-xh-part="next-trigger"]');
  const summary = pagerRoot.querySelector('[data-xh-part="summary"]');
  // 角色节点的 id 归元素所有（可及关系靠它接线），作者要认这些节点只能按部件名取
  const countLine = stage.querySelector('xh-page-header [data-xh-part="description"]');

  // 两份定义都是数组，只能走 property
  table.columns = [
    { id: "select", width: "3rem" },
    { id: "no", label: "单号", width: "10rem", sortable: true },
    { id: "customer", label: "客户" },
    { id: "amount", label: "金额", width: "7rem", sortable: true },
    { id: "status", label: "状态", width: "6rem" },
  ];

  let keyword = "";
  let status = "all";
  let range = "30";
  let sort = [];
  let selection = [];
  let page = 1;

  // 四道筛选依次收窄：时间粒度、状态、关键词，最后按排序链排一遍
  function filtered() {
    const days = Number(range);
    const text = keyword.trim();
    const rows = source.filter(
      (order) =>
        order.days <= days &&
        (status === "all" || order.status === status) &&
        (text === "" || order.no.includes(text) || order.customer.includes(text)),
    );
    if (sort.length === 0) return rows;
    return [...rows].sort((a, b) => {
      for (const rule of sort) {
        const diff =
          rule.id === "amount" ? a.amount - b.amount : a.no.localeCompare(b.no, "zh");
        if (diff !== 0) return rule.direction === "asc" ? diff : -diff;
      }
      return 0;
    });
  }

  function makeCell(id) {
    const cell = document.createElement("div");
    cell.dataset.xhPart = "cell";
    cell.setAttribute("value", id);
    return cell;
  }

  function makeRow(order) {
    const row = document.createElement("div");
    row.dataset.xhPart = "row";
    row.setAttribute("value", order.id);

    const select = makeCell("select");
    const box = document.createElement("span");
    box.dataset.xhPart = "row-select-trigger";
    select.append(box);

    const no = makeCell("no");
    no.textContent = order.no;
    const customer = makeCell("customer");
    customer.textContent = order.customer;
    const amount = makeCell("amount");
    amount.textContent = order.amount.toLocaleString("zh-CN");

    // 状态列是一枚标签：语气跟着状态走，颜色不在这里手写
    const state = makeCell("status");
    const tag = document.createElement("xh-tag");
    tag.setAttribute("tone", statusMeta[order.status].tone);
    tag.setAttribute("size", "sm");
    const tagRoot = document.createElement("span");
    tagRoot.dataset.xhPart = "root";
    const tagLabel = document.createElement("span");
    tagLabel.dataset.xhPart = "label";
    tagLabel.textContent = statusMeta[order.status].label;
    tagRoot.append(tagLabel);
    tag.append(tagRoot);
    state.append(tag);

    row.append(select, no, customer, amount, state);
    return row;
  }

  // 换页与筛选都会重铺页码格子：几号页、哪里出省略号由元素说了算
  function renderPager(total) {
    for (const node of pagerRoot.querySelectorAll(
      '[data-xh-part="item"], [data-xh-part="ellipsis-trigger"]',
    ))
      node.remove();
    // 筛没了是 0 页，序列随之为空；页码格子是必需部件，这时留第 1 格当兜底读数
    const items = pager.pageItems.length > 0 ? pager.pageItems : [{ type: "page", value: 1 }];
    for (const item of items) {
      const el = document.createElement("button");
      if (item.type === "ellipsis") {
        el.dataset.xhPart = "ellipsis-trigger";
        el.setAttribute("side", item.side);
        el.textContent = "…";
      } else {
        el.dataset.xhPart = "item";
        el.setAttribute("value", String(item.value));
        el.textContent = String(item.value);
      }
      pagerRoot.insertBefore(el, pagerNext);
    }
    const { start, end } = pager.pageRange;
    summary.textContent = `第 ${start}-${end} 条，共 ${total} 条`;
  }

  function render() {
    const list = filtered();
    // 受控：总条数与页码都先写回元素，切出来的才是这一页
    pager.count = list.length;
    pager.page = page;
    const shown = pager.slice(list);
    body.replaceChildren(...shown.map(makeRow));
    // 行序的事实源跟着这一页走
    table.rows = shown.map((order) => ({ id: order.id }));
    table.sort = sort;
    table.selection = selection;
    renderPager(list.length);
    countLine.textContent = `共 ${source.length} 条，筛选后 ${list.length} 条`;
  }

  // 筛选条件一动就退回第一页，否则会停在一页不存在的页码上
  function refilter() {
    page = 1;
    render();
  }

  keywordField.addEventListener("value-change", (event) => {
    keyword = event.detail.value;
    keywordField.value = keyword;
    refilter();
  });

  statusSelect.addEventListener("value-change", (event) => {
    statusSelect.value = event.detail.value;
    status = event.detail.value[0] ?? "all";
    refilter();
  });

  rangeGroup.addEventListener("value-change", (event) => {
    rangeGroup.value = event.detail.value ?? "30";
    range = rangeGroup.value;
    refilter();
  });

  table.addEventListener("sort-change", (event) => {
    sort = event.detail.value;
    render();
  });

  table.addEventListener("selection-change", (event) => {
    selection = event.detail.value;
    render();
  });

  pager.addEventListener("page-change", (event) => {
    page = event.detail.page;
    render();
  });

  stage.querySelector("#data-page-reset").addEventListener("click", () => {
    keyword = "";
    keywordField.value = "";
    status = "all";
    statusSelect.value = ["all"];
    range = "30";
    rangeGroup.value = "30";
    sort = [];
    selection = [];
    refilter();
  });

  // 取数用定时器代替真实请求，露一下加载态
  let timer = 0;
  stage.querySelector("#data-page-refresh").addEventListener("click", () => {
    window.clearTimeout(timer);
    table.loading = true;
    timer = window.setTimeout(() => {
      // 元素被移出文档就收手，别让定时器在卸载后继续跑
      if (table.isConnected) table.loading = false;
    }, 900);
  });

  render();
</script>
```

## 这一屏定了什么

- **筛选条是一行，不是一堆。** 文本框、下拉、[分段控件](../components/segmented)与按钮同高对齐，靠的是同一组控件高度令牌；它们之间那道竖线是[分隔线](../components/separator)组件。
- **三种状态各有其位。** 表体有行时渲行，取数中露加载槽，筛完没有行露空态槽——空态槽里放的就是[空态](../components/empty-state)组件，表格不必自己再造一套。
- **状态列是标签不是色块。** 每种状态对应一档[语气](../guide/theme)，颜色由语气派生，页面里一个色值都没写。
- **筛选一动就退回第一页。** 页码是一份独立状态，条件变了不复位就会停在一页不存在的页码上；这条在示例里是三行 `watch`，在你的项目里同样要有。
- **排序链与勾选互不相干。** 排序链是有序数组，下标即优先级；勾选是另一份值，换页与重排都不动它。

## 换成你的项目

- 这里的筛选与分页都在内存里算。换成服务端时，把 `filtered` 换成请求结果、把 `count` 换成后端给的总数即可，其余接线一行不改。
- 列宽与列序的唯一事实源是 `columns`，行序与行号的唯一事实源是 `rows`；标记只管长相，改了标记不会串位。
- 条目上万时把表体换成[虚拟滚动](../components/virtualizer)，或者用[无限滚动](../components/infinite-scroll)换掉分页——两者不要同时上：一个给确定位置，一个给「再来一些」。
