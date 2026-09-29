来源：https://ui.docs.xihanfun.com/components/sortable

# Sortable 排序

通过拖拽或键盘重新排列内容，或在一组列表之间移动条目。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/sortable" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/sortable.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/sortable" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/sortable" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/sortable.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

拖动任务调整顺序

```vue
<script setup lang="ts">
import { XhSortableDropIndicator, XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const ids = ref(["规划", "设计", "实现", "发布"]);
const tones = ["brand", "info", "success", "warning"] as const;
</script>

<template>
  <XhSortableRoot v-model:ids="ids" style="inline-size: min(360px, 100%)">
    <XhSortableItem
      v-for="(id, index) in ids"
      :key="id"
      :item-id="id"
      :aria-label="id"
      style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
    >
      <XhSortableItemDragTrigger :item-id="id" />
      <span data-demo-block="line" :data-tone="tones[index]" />
    </XhSortableItem>
    <XhSortableDropIndicator />
    <XhSortableLiveRegion />
  </XhSortableRoot>
</template>
```

```html
<style>
  #sortable-basic [data-xh-part="item"] { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); }
</style>
<xh-sortable id="sortable-basic" ids="规划,设计,实现,发布" style="display: contents">
  <div data-xh-part="root" style="inline-size: min(360px, 100%)">
    <div data-xh-part="item" item-id="规划" aria-label="规划"><button data-xh-part="item-drag-trigger" item-id="规划"></button><span data-demo-block="line" data-tone="brand"></span></div>
    <div data-xh-part="item" item-id="设计" aria-label="设计"><button data-xh-part="item-drag-trigger" item-id="设计"></button><span data-demo-block="line" data-tone="info"></span></div>
    <div data-xh-part="item" item-id="实现" aria-label="实现"><button data-xh-part="item-drag-trigger" item-id="实现"></button><span data-demo-block="line" data-tone="success"></span></div>
    <div data-xh-part="item" item-id="发布" aria-label="发布"><button data-xh-part="item-drag-trigger" item-id="发布"></button><span data-demo-block="line" data-tone="warning"></span></div>
    <div data-xh-part="drop-indicator"></div>
    <div data-xh-part="live-region"></div>
  </div>
</xh-sortable>
<script type="module">
  const host = document.getElementById("sortable-basic");
  const root = host.querySelector('[data-xh-part="root"]');
  host.addEventListener("sort", (event) => {
    host.ids = event.detail.ids;
    for (const id of event.detail.ids) root.insertBefore(root.querySelector(`[item-id="${id}"]`), root.querySelector('[data-xh-part="drop-indicator"]'));
  });
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="sortable"`：**`root`** · **`item`** · `item-drag-trigger` · `drop-indicator` · `live-region`

## 示例

### 水平排序

调整标签顺序

```vue
<script setup lang="ts">
import { XhSortableDropIndicator, XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const ids = ref(["概览", "订单", "库存", "报表"]);
const tones = ["brand", "info", "success", "warning"] as const;
</script>

<template>
  <XhSortableRoot v-model:ids="ids" orientation="horizontal">
    <XhSortableItem
      v-for="(id, index) in ids"
      :key="id"
      :item-id="id"
      :aria-label="id"
      style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: var(--xh-shape-pill); background: var(--xh-bg-subtle)"
    >
      <XhSortableItemDragTrigger :item-id="id" />
      <span data-demo-block="line" :data-tone="tones[index]" style="--xh-demo-block-inline-size: 48px" />
    </XhSortableItem>
    <XhSortableDropIndicator />
    <XhSortableLiveRegion />
  </XhSortableRoot>
</template>
```

```html
<style>
  #sortable-horizontal [data-xh-part="item"] { display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: var(--xh-shape-pill); background: var(--xh-bg-subtle); }
</style>
<xh-sortable id="sortable-horizontal" ids="概览,订单,库存,报表" orientation="horizontal" style="display: contents">
  <div data-xh-part="root">
    <div data-xh-part="item" item-id="概览" aria-label="概览"><button data-xh-part="item-drag-trigger" item-id="概览"></button><span data-demo-block="line" data-tone="brand" style="--xh-demo-block-inline-size: 48px"></span></div>
    <div data-xh-part="item" item-id="订单" aria-label="订单"><button data-xh-part="item-drag-trigger" item-id="订单"></button><span data-demo-block="line" data-tone="info" style="--xh-demo-block-inline-size: 48px"></span></div>
    <div data-xh-part="item" item-id="库存" aria-label="库存"><button data-xh-part="item-drag-trigger" item-id="库存"></button><span data-demo-block="line" data-tone="success" style="--xh-demo-block-inline-size: 48px"></span></div>
    <div data-xh-part="item" item-id="报表" aria-label="报表"><button data-xh-part="item-drag-trigger" item-id="报表"></button><span data-demo-block="line" data-tone="warning" style="--xh-demo-block-inline-size: 48px"></span></div>
    <div data-xh-part="drop-indicator"></div><div data-xh-part="live-region"></div>
  </div>
</xh-sortable>
<script type="module">
  const host = document.getElementById("sortable-horizontal");
  const root = host.querySelector('[data-xh-part="root"]');
  host.addEventListener("sort", (event) => {
    host.ids = event.detail.ids;
    for (const id of event.detail.ids) root.insertBefore(root.querySelector(`[data-xh-part="item"][item-id="${id}"]`), root.querySelector('[data-xh-part="drop-indicator"]'));
  });
</script>
```

### 网格排序

在换行布局中排序

```vue
<script setup lang="ts">
import { XhSortableDropIndicator, XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const ids = ref(["颜色", "排版", "间距", "圆角", "阴影", "动效"]);
const tones = ["brand", "info", "success", "warning", "danger", "neutral"] as const;
</script>

<template>
  <XhSortableRoot v-model:ids="ids" orientation="both" style="max-inline-size: 340px">
    <XhSortableItem
      v-for="(id, index) in ids"
      :key="id"
      :item-id="id"
      :aria-label="id"
      style="display: flex; align-items: center; gap: 6px; inline-size: 104px; block-size: 72px; padding: 10px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
    >
      <XhSortableItemDragTrigger :item-id="id" />
      <span data-demo-block :data-tone="tones[index]" style="--xh-demo-block-block-size: 40px" />
    </XhSortableItem>
    <XhSortableDropIndicator />
    <XhSortableLiveRegion />
  </XhSortableRoot>
</template>
```

```html
<style>
  #sortable-grid [data-xh-part="item"] { display: flex; align-items: center; gap: 6px; inline-size: 104px; block-size: 72px; padding: 10px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); }
</style>
<xh-sortable id="sortable-grid" ids="颜色,排版,间距,圆角,阴影,动效" orientation="both" style="display: contents">
  <div data-xh-part="root" style="max-inline-size: 340px">
    <div data-xh-part="item" item-id="颜色" aria-label="颜色"><button data-xh-part="item-drag-trigger" item-id="颜色"></button><span data-demo-block data-tone="brand" style="--xh-demo-block-block-size: 40px"></span></div>
    <div data-xh-part="item" item-id="排版" aria-label="排版"><button data-xh-part="item-drag-trigger" item-id="排版"></button><span data-demo-block data-tone="info" style="--xh-demo-block-block-size: 40px"></span></div>
    <div data-xh-part="item" item-id="间距" aria-label="间距"><button data-xh-part="item-drag-trigger" item-id="间距"></button><span data-demo-block data-tone="success" style="--xh-demo-block-block-size: 40px"></span></div>
    <div data-xh-part="item" item-id="圆角" aria-label="圆角"><button data-xh-part="item-drag-trigger" item-id="圆角"></button><span data-demo-block data-tone="warning" style="--xh-demo-block-block-size: 40px"></span></div>
    <div data-xh-part="item" item-id="阴影" aria-label="阴影"><button data-xh-part="item-drag-trigger" item-id="阴影"></button><span data-demo-block data-tone="danger" style="--xh-demo-block-block-size: 40px"></span></div>
    <div data-xh-part="item" item-id="动效" aria-label="动效"><button data-xh-part="item-drag-trigger" item-id="动效"></button><span data-demo-block data-tone="neutral" style="--xh-demo-block-block-size: 40px"></span></div>
    <div data-xh-part="drop-indicator"></div><div data-xh-part="live-region"></div>
  </div>
</xh-sortable>
<script type="module">
  const host = document.getElementById("sortable-grid");
  const root = host.querySelector('[data-xh-part="root"]');
  host.addEventListener("sort", (event) => {
    host.ids = event.detail.ids;
    for (const id of event.detail.ids) root.insertBefore(root.querySelector(`[data-xh-part="item"][item-id="${id}"]`), root.querySelector('[data-xh-part="drop-indicator"]'));
  });
</script>
```

### 禁用项目

固定单个项目的位置

```vue
<script setup lang="ts">
import { XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const ids = ref(["固定项", "设计", "实现", "发布"]);
const tones = ["neutral", "info", "success", "warning"] as const;
</script>

<template>
  <XhSortableRoot v-model:ids="ids" style="inline-size: min(360px, 100%)">
    <XhSortableItem
      v-for="(id, index) in ids"
      :key="id"
      :item-id="id"
      :disabled="id === '固定项'"
      :aria-label="id"
      style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
    >
      <XhSortableItemDragTrigger :item-id="id" :disabled="id === '固定项'" />
      <span data-demo-block="line" :data-tone="tones[index]" />
    </XhSortableItem>
    <XhSortableLiveRegion />
  </XhSortableRoot>
</template>
```

```html
<style>
  #sortable-disabled [data-xh-part="item"] { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); }
</style>
<xh-sortable id="sortable-disabled" ids="固定项,设计,实现,发布" style="display: contents">
  <div data-xh-part="root" style="inline-size: min(360px, 100%)">
    <div data-xh-part="item" item-id="固定项" disabled aria-label="固定项"><button data-xh-part="item-drag-trigger" item-id="固定项" disabled></button><span data-demo-block="line" data-tone="neutral"></span></div>
    <div data-xh-part="item" item-id="设计" aria-label="设计"><button data-xh-part="item-drag-trigger" item-id="设计"></button><span data-demo-block="line" data-tone="info"></span></div>
    <div data-xh-part="item" item-id="实现" aria-label="实现"><button data-xh-part="item-drag-trigger" item-id="实现"></button><span data-demo-block="line" data-tone="success"></span></div>
    <div data-xh-part="item" item-id="发布" aria-label="发布"><button data-xh-part="item-drag-trigger" item-id="发布"></button><span data-demo-block="line" data-tone="warning"></span></div>
    <div data-xh-part="live-region"></div>
  </div>
</xh-sortable>
<script type="module">
  const host = document.getElementById("sortable-disabled");
  const root = host.querySelector('[data-xh-part="root"]');
  host.addEventListener("sort", (event) => {
    host.ids = event.detail.ids;
    for (const id of event.detail.ids) root.insertBefore(root.querySelector(`[data-xh-part="item"][item-id="${id}"]`), root.querySelector('[data-xh-part="live-region"]'));
  });
</script>
```

### 看板

在几列之间移动任务

```vue
<script setup lang="ts">
import type { SortableTransferDetails } from "@xihan-ui/headless";
import { XhSortableDropIndicator, XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from "@xihan-ui/vue";
import { reactive } from "vue";

const columns = [
  { id: "todo", title: "待办" },
  { id: "doing", title: "进行中" },
  { id: "done", title: "已完成" },
];
const lists = reactive<Record<string, string[]>>({ todo: ["调研", "原型", "评审"], doing: ["接口", "联调"], done: ["立项"] });
const tones: Record<string, string> = { 调研: "brand", 原型: "info", 评审: "warning", 接口: "success", 联调: "danger", 立项: "neutral" };

// 落进别的列时源列表发一次 transfer：两列的新顺序都算好了，照着写回即可
function onTransfer(detail: SortableTransferDetails): void {
  lists[detail.fromList] = detail.fromIds;
  lists[detail.toList] = detail.toIds;
}
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: var(--xh-space-4)">
    <section
      v-for="column in columns"
      :key="column.id"
      style="flex: 1 1 160px; display: grid; gap: var(--xh-space-2); padding: var(--xh-space-3); border: var(--xh-stroke-thin) solid var(--xh-border-default); border-radius: var(--xh-shape-surface)"
    >
      <h4 :id="`sortable-board-${column.id}`" style="margin: 0; font-size: var(--xh-text-label-size)">{{ column.title }}</h4>
      <XhSortableRoot
        v-model:ids="lists[column.id]"
        group="board"
        :list-id="column.id"
        :aria-labelledby="`sortable-board-${column.id}`"
        style="min-block-size: var(--xh-control-h-lg)"
        @transfer="onTransfer"
      >
        <XhSortableItem
          v-for="id in lists[column.id]"
          :key="id"
          :item-id="id"
          :aria-label="id"
          style="display: flex; align-items: center; gap: var(--xh-space-2); padding: var(--xh-space-2) var(--xh-space-3); border-radius: var(--xh-shape-control); background: var(--xh-bg-subtle)"
        >
          <XhSortableItemDragTrigger :item-id="id" />
          <span data-demo-block="line" :data-tone="tones[id]" />
        </XhSortableItem>
        <XhSortableDropIndicator />
        <XhSortableLiveRegion />
      </XhSortableRoot>
    </section>
  </div>
</template>
```

```html
<style>
  #sortable-board { display: flex; flex-wrap: wrap; align-items: flex-start; gap: var(--xh-space-4); }
  #sortable-board section { flex: 1 1 160px; display: grid; gap: var(--xh-space-2); padding: var(--xh-space-3); border: var(--xh-stroke-thin) solid var(--xh-border-default); border-radius: var(--xh-shape-surface); }
  #sortable-board h4 { margin: 0; font-size: var(--xh-text-label-size); }
  #sortable-board [data-xh-part="root"] { min-block-size: var(--xh-control-h-lg); }
  #sortable-board [data-xh-part="item"] { display: flex; align-items: center; gap: var(--xh-space-2); padding: var(--xh-space-2) var(--xh-space-3); border-radius: var(--xh-shape-control); background: var(--xh-bg-subtle); }
</style>
<div id="sortable-board">
  <section>
    <h4 id="sortable-board-todo">待办</h4>
    <xh-sortable ids="调研,原型,评审" group="board" list-id="todo" style="display: contents">
      <div data-xh-part="root" aria-labelledby="sortable-board-todo">
        <div data-xh-part="item" item-id="调研" aria-label="调研"><button data-xh-part="item-drag-trigger" item-id="调研"></button><span data-demo-block="line" data-tone="brand"></span></div>
        <div data-xh-part="item" item-id="原型" aria-label="原型"><button data-xh-part="item-drag-trigger" item-id="原型"></button><span data-demo-block="line" data-tone="info"></span></div>
        <div data-xh-part="item" item-id="评审" aria-label="评审"><button data-xh-part="item-drag-trigger" item-id="评审"></button><span data-demo-block="line" data-tone="warning"></span></div>
        <div data-xh-part="drop-indicator"></div>
        <div data-xh-part="live-region"></div>
      </div>
    </xh-sortable>
  </section>
  <section>
    <h4 id="sortable-board-doing">进行中</h4>
    <xh-sortable ids="接口,联调" group="board" list-id="doing" style="display: contents">
      <div data-xh-part="root" aria-labelledby="sortable-board-doing">
        <div data-xh-part="item" item-id="接口" aria-label="接口"><button data-xh-part="item-drag-trigger" item-id="接口"></button><span data-demo-block="line" data-tone="success"></span></div>
        <div data-xh-part="item" item-id="联调" aria-label="联调"><button data-xh-part="item-drag-trigger" item-id="联调"></button><span data-demo-block="line" data-tone="danger"></span></div>
        <div data-xh-part="drop-indicator"></div>
        <div data-xh-part="live-region"></div>
      </div>
    </xh-sortable>
  </section>
  <section>
    <h4 id="sortable-board-done">已完成</h4>
    <xh-sortable ids="立项" group="board" list-id="done" style="display: contents">
      <div data-xh-part="root" aria-labelledby="sortable-board-done">
        <div data-xh-part="item" item-id="立项" aria-label="立项"><button data-xh-part="item-drag-trigger" item-id="立项"></button><span data-demo-block="line" data-tone="neutral"></span></div>
        <div data-xh-part="drop-indicator"></div>
        <div data-xh-part="live-region"></div>
      </div>
    </xh-sortable>
  </section>
</div>
<script type="module">
  const board = document.getElementById("sortable-board");
  const hostOf = listId => board.querySelector(`xh-sortable[list-id="${listId}"]`);
  // 按新顺序把项节点排进这一列的 root：落点线与播报区留在末尾
  function place(host, ids) {
    const root = host.querySelector('[data-xh-part="root"]');
    for (const id of ids) root.insertBefore(board.querySelector(`[data-xh-part="item"][item-id="${id}"]`), root.querySelector('[data-xh-part="drop-indicator"]'));
    host.ids = ids;
  }
  board.addEventListener("sort", event => place(event.target, event.detail.ids));
  // 落进别的列时源列表发一次 transfer：两列的新顺序都算好了，照着把节点挪过去、写回 ids
  board.addEventListener("transfer", (event) => {
    const { fromList, toList, fromIds, toIds } = event.detail;
    place(hostOf(toList), toIds);
    place(hostOf(fromList), fromIds);
  });
</script>
```

## 设计指引

### 何时使用

- 调整任务、标签页、收藏项或表格列的顺序。
- 需要保存用户定义的排列顺序。
- 看板一类的几个列表之间移动条目，并落在指定位置。

### 何时不用

- 数据规则决定顺序时使用普通排序。
- 条目要落进树的某个节点里、改变层级时使用[树](./tree)的拖放。

### 特性

- 支持垂直、水平和换行网格排序。
- 拖动时实时显示让位和落点；放下后项目从松手处带着松手速度落进新位置。
- 支持边缘自动滚动。
- `sort` 事件返回重排后的 `ids`。
- 写了同一个 `group` 的几个列表组成一组：条目拖进组里别的列表时，那个列表让出落点并画出落点线，容器随之长出一格。
- 落进别的列表时由源列表发一次 `transfer`，载荷给出源列表、目标列表、新旧位次与两个列表各自的新顺序；写不写回归宿主，不写回时条目收回原位。

### 组合

- 可在项目中放置独立拖拽手柄。
- 可与[表格](./table)组合为列排序面板。

### 最佳实践

- 拖拽手柄放在项目的固定位置，与项目内的其他控件分开。
- 拖放结束后立刻持久化 `ids`，失败时回滚并提示。
- 项目高度保持一致，让位动画才能表达落点。
- 一组里的每个列表写不重复的 `listId`，`transfer` 靠它说明从哪来、到哪去。
- 被拖的条目仍在源列表里跟手，拖出列表的那一段不能被裁掉：入组的列表与它们的外层不设 `overflow` 裁剪，滚动放在更外层。

### 反模式

- 用整个项目作为手柄，项目内的按钮与链接将无法点击。
- 拖动中改变列表长度或过滤条件。
- 换行网格（`orientation="both"`）入组：四个方向键都用在列表内，没有键留给列表间移动，会直接报错。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-sortable>` |
| Vue 组件 | `XhSortableDropIndicator` `XhSortableItem` `XhSortableItemDragTrigger` `XhSortableLiveRegion` `XhSortableRoot` |
| 组合式函数 | `useSortable` |
| 状态机 | `sortableMachine` |
| 皮肤 | `@xihan-ui/styles/sortable.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `ids` | `string[]` | 是 | 项的稳定标识，数组顺序即当前顺序。这是顺序的唯一真源。 DOM 中项的先后必须与它一致：几何按 DOM 测量，回调按它计算。 |
| `orientation` | `SortableAxis` |  | 排序沿哪根轴进行。换行网格使用 `both`。 |
| `disabled` | `boolean` |  |  |
| `activationDistance` | `number` |  | 按下之后移动多远才视为开始拖动，默认 5px。提供 0 表示按下即拖动。 |
| `autoScroll` | `boolean` |  | 拖到容器边缘时自动滚动，默认开启。 |
| `dir` | `Direction` |  |  |
| `translations` | `Partial<SortableTranslations>` |  |  |
| `group` | `string` |  | 所在的组。同一文档里 group 相同的几个列表组成一组，条目能从一个列表拖进另一个列表并落在指定位置； 键盘拖动中另一条轴上的方向键在相邻列表间移动。不写时列表只在自身内排序。 入组的列表只能是单轴排布（vertical / horizontal）。 |
| `listId` | `string` |  | 这个列表在组里的标识，写了 group 就必须写，且组内不重复：transfer 事件用它说明从哪来、到哪去。 |
| `onSort` | `(details: SortableSortDetails) => void` |  | 顺序变化意图。取消的一次不发出。 |
| `onTransfer` | `(details: SortableTransferDetails) => void` |  | 一项落进了同组另一个列表的意图，由源列表发出一次；取消、落回源列表时不发。 两个列表的新顺序都在载荷里，写不写回归宿主：不写回时那一项收回原位。 |
| `onDragStart` | `(details: SortableDragStartDetails) => void` |  |  |
| `onDragEnd` | `(details: SortableDragEndDetails) => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `sort` | `SortableSortDetails` | 顺序变化；detail 为 `{ from, to, id, ids }`，其中 ids 已重排 |
| `transfer` | `SortableTransferDetails` | 一项落进了同组另一个列表，由源列表发一次；detail 为 `{ id, fromList, toList, from, to, fromIds, toIds }`，节点挪不挪、ids 写不写回归作者 |
| `drag-start` | `SortableDragStartDetails` | 拾起；detail 为 `{ id, from, mode }` |
| `drag-end` | `SortableDragEndDetails` | 收尾（含取消）；detail 为 `{ id, from, to, mode, canceled }`，入了组时另带 fromList / toList |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSortableItem` | `default` | `SortableItemSlotProps` |  |
| `XhSortableItemDragTrigger` | `default` | — |  |
| `XhSortableRoot` | `default` | `SortableRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhSortableItem` | `itemId` | `string` | 是 | 项标识，与 ids 中的值一一对应。 |
| `XhSortableItem` | `disabled` | `boolean` |  | 单独禁用该项。整份 disabled 在 Root 上，该项是项级的。 |
| `XhSortableItem` | `children` | `SlotChildren<SortableItemSlotProps>` |  |  |
| `XhSortableItemDragTrigger` | `itemId` | `string` | 是 | 项标识，与 ids 中的值一一对应。 |
| `XhSortableItemDragTrigger` | `disabled` | `boolean` |  | 单独禁用该项。整份 disabled 在 Root 上，该项是项级的。 |
| `XhSortableRoot` | `children` | `SlotChildren<SortableRootSlotProps>` |  |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle` · `pending` · `dragging`

**事件**：`ITEM.POINTER_DOWN` · `POINTER.MOVE` · `POINTER.END` · `POINTER.CANCEL` · `ITEM.PICKUP` · `KEY.MOVE` · `KEY.MOVE_LIST` · `KEY.DROP` · `KEY.CANCEL` · `GROUP.OVER` · `GROUP.LEAVE` · `GROUP.DROP` · `PRESS.START` · `PRESS.END`

**判据**：`canSort` · `passedActivation` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `dragging` | `boolean` | 正在拖（含键盘拖动）。 |
| `activeId` | `string \| null` |  |
| `from` | `number` |  |
| `to` | `number` |  |
| `mode` | `SortableMode \| null` |  |
| `items` | `SortableItemState[]` | 逐项的呈现状态，顺序与 `ids` 一致。 |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(props: SortableItemProps) => T['element']` |  |
| `getItemDragTriggerProps` | `(props: SortableItemProps) => T['element']` |  |
| `getDropIndicatorProps` | `() => T['element']` | 落点线：拖动中且落点与起点不同位时才存在，位置由内联样式给出。 |
| `getLiveRegionProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in item-drag-trigger，未在拖动，not disabled | 拾起这一项，进入键盘拖动；播报它现在第几位、共几项、以及接下来能按什么 |
| `ArrowDown` / `ArrowRight` | 键盘拖动中 | 往后挪一位并播报新位置；已在末位时不动，也不回绕（挪进了同组别的列表时可以排到它的末项之后）。竖直排布认上下键、水平排布认左右键；另一条轴上的方向键未入组时原样放行，入组时归列表间移动 |
| `ArrowUp` / `ArrowLeft` | 键盘拖动中 | 往前挪一位，规则同上；rtl 下左右两键对调，语义恒是「往前 / 往后」 |
| `ArrowRight` / `ArrowDown` | 键盘拖动中，列表入了组（group），按的是另一条轴上的键：竖直排布认 ArrowRight、水平排布认 ArrowDown | 挪进组里文档序的下一个列表，位次尽量沿用、超出那个列表的长度就排到末尾；播报列表名、它在组里排第几与新位次。已是最后一个列表时不动，也不回绕；rtl 下竖直排布的左右两键对调 |
| `ArrowLeft` / `ArrowUp` | 键盘拖动中，列表入了组（group），按的是另一条轴上的键：竖直排布认 ArrowLeft、水平排布认 ArrowUp | 挪进组里文档序的上一个列表，规则同上 |
| `Space` / `Enter` | 键盘拖动中 | 放下，按当前位置提交顺序并播报落点；落在同组别的列表里时发 transfer，播报落进了哪个列表的第几位 |
| `Escape` | 键盘拖动中 | 取消，顺序回到拾起前，悬着的别的列表撤掉让位；播报已取消与原位置 |
| `Enter` / `Space` | held on item-drag-trigger, not disabled | 按住期间把手投影 data-pressed，与指针 :active 同一副按压面；拾起转拖动那一下即撤下（拖动中的回执是 data-dragging），抬起或失焦撤下 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | translations?.root |
| `root` | `role` | 'group' |
| `item-drag-trigger` | `aria-disabled` | 'true' \| 'false' |
| `item-drag-trigger` | `aria-label` | translations?.itemDragTrigger?.(name) |
| `item-drag-trigger` | `aria-pressed` | 'true' \| 'false' |
| `item-drag-trigger` | `aria-roledescription` | 'sortable' |
| `item-drag-trigger` | `role` | 'button' |
| `drop-indicator` | `aria-hidden` | 'true' |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |
| `live-region` | `role` | 'status' |

- 空格拾取或放下，方向键移动，Escape 取消。
- 入组的列表拿起后，本轴方向键在列表内移动，另一条轴上的方向键在相邻列表间移动：竖排列表用左右键，横排列表用上下键。
- `live-region` 会播报当前拖动位置；挪进别的列表时先播报列表名与它在组里排第几，再播报位次。列表名取列表容器的可及名，看板里用 `aria-labelledby` 指向列标题即可。
- 拖动期间焦点保留在当前手柄。

## 样式参考

### 皮肤

`@xihan-ui/styles/sortable.css` 使用 `[data-scope="sortable"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-drag-mode` | context.get('mode') \| undefined |
| `root` | `data-dragging` | ''（条件成立时才出现） |
| `root` | `data-drop` | 'inside' \| undefined |
| `root` | `data-orientation` | props.orientation |
| `item` | `data-animating` | ''（条件成立时才出现） |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-dragging` | ''（条件成立时才出现） |
| `item` | `data-index` | String(item?.index ?? -1) |
| `item-drag-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `item-drag-trigger` | `data-dragging` | ''（条件成立时才出现） |
| `item-drag-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `item-drag-trigger` | `data-xh-action-control` | '' |
| `item-drag-trigger` | `data-xh-action-display` | 'always' |
| `item-drag-trigger` | `data-xh-action-profile` | 'icon' |
| `item-drag-trigger` | `data-xh-action-size` | 'xs' |
| `item-drag-trigger` | `data-xh-action-variant` | 'ghost' |
| `drop-indicator` | `data-orientation` | props.orientation |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-sortable-drag-bg-active` | `item-drag-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | sortable 的 item-drag-trigger 部件 background-color 覆盖槽。 |
| `--xh-sortable-drag-bg-hover` | `item-drag-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | sortable 的 item-drag-trigger 部件 background-color 覆盖槽。 |
| `--xh-sortable-drag-fg` | `item-drag-trigger` | `color` | `default` | `--xh-fg-muted` | sortable 的 item-drag-trigger 部件 color 覆盖槽。 |
| `--xh-sortable-drag-fg-disabled` | `item-drag-trigger` | `color` | `disabled` | `--xh-fg-disabled` | sortable 的 item-drag-trigger 部件 color 覆盖槽。 |
| `--xh-sortable-drag-fg-hover` | `item-drag-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` | sortable 的 item-drag-trigger 部件 color 覆盖槽。 |
| `--xh-sortable-drag-grip-h` | `item-drag-trigger` | `block-size` | `empty` | `--xh-space-3` | sortable 的 item-drag-trigger 部件 block-size 覆盖槽。 |
| `--xh-sortable-drag-grip-w` | `item-drag-trigger` | `inline-size` | `empty` | `--xh-space-1` | sortable 的 item-drag-trigger 部件 inline-size 覆盖槽。 |
| `--xh-sortable-drag-icon-size` | `item-drag-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` | sortable 的 item-drag-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-sortable-drag-radius` | `item-drag-trigger` | `border-radius` | `default` | `--xh-shape-control` | sortable 的 item-drag-trigger 部件 border-radius 覆盖槽。 |
| `--xh-sortable-drag-size` | `item-drag-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | sortable 的 item-drag-trigger 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
| `--xh-sortable-drop-indicator-bg` | `drop-indicator` | `background` | `default` | `--xh-bg-brand` | sortable 的 drop-indicator 部件 background 覆盖槽。 |
| `--xh-sortable-drop-indicator-radius` | `drop-indicator` | `border-radius` | `default` | `--xh-shape-pill` | sortable 的 drop-indicator 部件 border-radius 覆盖槽。 |
| `--xh-sortable-drop-indicator-size` | `drop-indicator` | `block-size`<br>`inline-size` | `orientation=both`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-stroke-thick` | sortable 的 drop-indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-sortable-gap` | `root` | `gap` | `default` | `--xh-space-2` | sortable 的 root 部件 gap 覆盖槽。 |
| `--xh-sortable-item-opacity-dragging` | `item` | `opacity` | `dragging` | `0.9` | sortable 的 item 部件 opacity 覆盖槽。 |
| `--xh-sortable-item-shadow-dragging` | `item` | `box-shadow` | `dragging` | `--xh-elevation-lifted` | sortable 的 item 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 切换（见[动效规范](../design/motion#角色)）。

`box-shadow` · `opacity` · `translate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：值由内核逐帧算出（`frameLoop`），皮肤里看不到这段。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
