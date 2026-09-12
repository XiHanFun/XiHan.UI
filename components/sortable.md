来源：https://ui.docs.xihanfun.com/components/sortable

# Sortable `排序`

让用户拖着重排一列条目，键盘也能完成同一件事。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/sortable" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/sortable.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/sortable" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/sortable" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/sortable.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

ids 是顺序的唯一真源，sort 事件回传的 ids 已经重排好，可直接写回

```vue
<script setup lang="ts">
import { XhSortableItem, XhSortableItemDragTrigger, XhSortableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const ids = ref(["写方案", "评审", "实现", "上线"]);
</script>

<template>
  <XhSortableRoot v-model:ids="ids" style="inline-size: 100%">
    <XhSortableItem v-for="id in ids" :key="id" :item-id="id" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid var(--xh-border-default)">
      <XhSortableItemDragTrigger :item-id="id" />
      <span>{{ id }}</span>
    </XhSortableItem>
  </XhSortableRoot>
  <p style="margin-top: 12px; color: var(--xh-fg-muted)">当前顺序：{{ ids.join(" → ") }}</p>
</template>
```

```html
<xh-sortable ids="写方案,评审,实现,上线" style="display: contents">
  <div data-xh-part="root" style="inline-size: 100%">
    <div data-xh-part="item" id="写方案" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid var(--xh-border-default)">
      <button data-xh-part="item-drag-trigger" id="写方案"></button>
      <span>写方案</span>
    </div>
    <div data-xh-part="item" id="评审" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid var(--xh-border-default)">
      <button data-xh-part="item-drag-trigger" id="评审"></button>
      <span>评审</span>
    </div>
    <div data-xh-part="item" id="实现" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid var(--xh-border-default)">
      <button data-xh-part="item-drag-trigger" id="实现"></button>
      <span>实现</span>
    </div>
    <div data-xh-part="item" id="上线" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid var(--xh-border-default)">
      <button data-xh-part="item-drag-trigger" id="上线"></button>
      <span>上线</span>
    </div>
    <div data-xh-part="live-region"></div>
  </div>
</xh-sortable>
```

## 示例

### 横排与网格

orientation 三档：竖排、横排，换行网格用 both，落点按最近中心判

```vue
<script setup lang="ts">
import { XhSortableItem, XhSortableItemDragTrigger, XhSortableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const tabs = ref(["概览", "订单", "库存", "报表"]);
const cards = ref(["甲", "乙", "丙", "丁", "戊", "己"]);
</script>

<template>
  <p style="margin-bottom: 8px">横排：只认左右方向键。</p>
  <XhSortableRoot v-model:ids="tabs" orientation="horizontal">
    <XhSortableItem v-for="id in tabs" :key="id" :item-id="id" style="display: flex; align-items: center; gap: 8px; padding: 6px 12px; border: 1px solid var(--xh-border-default)">
      <XhSortableItemDragTrigger :item-id="id" />
      <span>{{ id }}</span>
    </XhSortableItem>
  </XhSortableRoot>

  <p style="margin: 20px 0 8px">换行网格：上下左右都认，落点取离指针最近的那一格。</p>
  <XhSortableRoot v-model:ids="cards" orientation="both" style="max-inline-size: 320px">
    <XhSortableItem v-for="id in cards" :key="id" :item-id="id" style="display: flex; align-items: center; justify-content: center; inline-size: 88px; block-size: 64px; border: 1px solid var(--xh-border-default)">
      <XhSortableItemDragTrigger :item-id="id">{{ id }}</XhSortableItemDragTrigger>
    </XhSortableItem>
  </XhSortableRoot>
</template>
```

```html
<p style="margin-bottom: 8px">横排：只认左右方向键。</p>
<xh-sortable
  id="sortable-tabs"
  ids="概览,订单,库存,报表"
  orientation="horizontal"
  style="display: contents"
>
  <div data-xh-part="root">
    <div data-xh-part="item" item-id="概览" style="display: flex; align-items: center; gap: 8px; padding: 6px 12px; border: 1px solid var(--xh-border-default)">
      <button data-xh-part="item-drag-trigger" item-id="概览"></button>
      <span>概览</span>
    </div>
    <div data-xh-part="item" item-id="订单" style="display: flex; align-items: center; gap: 8px; padding: 6px 12px; border: 1px solid var(--xh-border-default)">
      <button data-xh-part="item-drag-trigger" item-id="订单"></button>
      <span>订单</span>
    </div>
    <div data-xh-part="item" item-id="库存" style="display: flex; align-items: center; gap: 8px; padding: 6px 12px; border: 1px solid var(--xh-border-default)">
      <button data-xh-part="item-drag-trigger" item-id="库存"></button>
      <span>库存</span>
    </div>
    <div data-xh-part="item" item-id="报表" style="display: flex; align-items: center; gap: 8px; padding: 6px 12px; border: 1px solid var(--xh-border-default)">
      <button data-xh-part="item-drag-trigger" item-id="报表"></button>
      <span>报表</span>
    </div>
    <div data-xh-part="live-region"></div>
  </div>
</xh-sortable>

<p style="margin: 20px 0 8px">换行网格：上下左右都认，落点取离指针最近的那一格。</p>
<xh-sortable
  id="sortable-cards"
  ids="甲,乙,丙,丁,戊,己"
  orientation="both"
  style="display: contents"
>
  <div data-xh-part="root" style="max-inline-size: 320px">
    <div data-xh-part="item" item-id="甲" style="display: flex; align-items: center; justify-content: center; inline-size: 88px; block-size: 64px; border: 1px solid var(--xh-border-default)">
      <button data-xh-part="item-drag-trigger" item-id="甲">甲</button>
    </div>
    <div data-xh-part="item" item-id="乙" style="display: flex; align-items: center; justify-content: center; inline-size: 88px; block-size: 64px; border: 1px solid var(--xh-border-default)">
      <button data-xh-part="item-drag-trigger" item-id="乙">乙</button>
    </div>
    <div data-xh-part="item" item-id="丙" style="display: flex; align-items: center; justify-content: center; inline-size: 88px; block-size: 64px; border: 1px solid var(--xh-border-default)">
      <button data-xh-part="item-drag-trigger" item-id="丙">丙</button>
    </div>
    <div data-xh-part="item" item-id="丁" style="display: flex; align-items: center; justify-content: center; inline-size: 88px; block-size: 64px; border: 1px solid var(--xh-border-default)">
      <button data-xh-part="item-drag-trigger" item-id="丁">丁</button>
    </div>
    <div data-xh-part="item" item-id="戊" style="display: flex; align-items: center; justify-content: center; inline-size: 88px; block-size: 64px; border: 1px solid var(--xh-border-default)">
      <button data-xh-part="item-drag-trigger" item-id="戊">戊</button>
    </div>
    <div data-xh-part="item" item-id="己" style="display: flex; align-items: center; justify-content: center; inline-size: 88px; block-size: 64px; border: 1px solid var(--xh-border-default)">
      <button data-xh-part="item-drag-trigger" item-id="己">己</button>
    </div>
    <div data-xh-part="live-region"></div>
  </div>
</xh-sortable>

<script type="module">
  // 顺序真源是 ids：sort 回传的那份已经重排好，写回去的同时把 DOM 顺序搬成一样——几何按 DOM 量
  for (const id of ["sortable-tabs", "sortable-cards"]) {
    const host = document.getElementById(id);
    const root = host.querySelector('[data-xh-part="root"]');
    host.addEventListener("sort", (event) => {
      host.ids = event.detail.ids;
      for (const itemId of event.detail.ids) {
        root.append(root.querySelector(`[data-xh-part="item"][item-id="${itemId}"]`));
      }
    });
  }
</script>
```

### 键盘拖拽

默认开着且关不掉：Tab 到手柄，空格拾起，方向键挪，空格放下，Esc 取消

```vue
<script setup lang="ts">
import { XhSortableItem, XhSortableItemDragTrigger, XhSortableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const ids = ref(["第一项", "第二项", "第三项"]);
const log = ref<string[]>([]);
</script>

<template>
  <p style="margin-bottom: 8px; color: var(--xh-fg-muted)">
    Tab 聚焦到手柄，按空格拾起后用 ↑↓ 移动，再按空格落下；Esc 退回原位。
  </p>
  <XhSortableRoot
    v-model:ids="ids"
    @sort="log.unshift(`${$event.id}：第 ${$event.from + 1} 位 → 第 ${$event.to + 1} 位`)"
    @drag-end="$event.canceled && log.unshift(`${$event.id}：已取消`)"
  >
    <XhSortableItem v-for="id in ids" :key="id" :item-id="id" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid var(--xh-border-default)">
      <XhSortableItemDragTrigger :item-id="id" />
      <span>{{ id }}</span>
    </XhSortableItem>
  </XhSortableRoot>
  <ul style="margin-top: 12px; color: var(--xh-fg-muted)">
    <li v-for="(line, i) in log.slice(0, 4)" :key="i">{{ line }}</li>
  </ul>
</template>
```

```html
<p style="margin-bottom: 8px; color: var(--xh-fg-muted)">
  Tab 聚焦到手柄，按空格拾起后用 ↑↓ 移动，再按空格落下；Esc 退回原位。
</p>
<xh-sortable id="sortable-keyboard" ids="第一项,第二项,第三项" style="display: contents">
  <div data-xh-part="root">
    <div data-xh-part="item" item-id="第一项" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid var(--xh-border-default)">
      <button data-xh-part="item-drag-trigger" item-id="第一项"></button>
      <span>第一项</span>
    </div>
    <div data-xh-part="item" item-id="第二项" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid var(--xh-border-default)">
      <button data-xh-part="item-drag-trigger" item-id="第二项"></button>
      <span>第二项</span>
    </div>
    <div data-xh-part="item" item-id="第三项" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid var(--xh-border-default)">
      <button data-xh-part="item-drag-trigger" item-id="第三项"></button>
      <span>第三项</span>
    </div>
    <div data-xh-part="live-region"></div>
  </div>
</xh-sortable>
<ul id="sortable-keyboard-log" style="margin-top: 12px; color: var(--xh-fg-muted)"></ul>

<script type="module">
  const host = document.getElementById("sortable-keyboard");
  const root = host.querySelector('[data-xh-part="root"]');
  const logEl = document.getElementById("sortable-keyboard-log");
  const log = [];

  function push(line) {
    log.unshift(line);
    logEl.replaceChildren(
      ...log.slice(0, 4).map((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        return li;
      })
    );
  }

  host.addEventListener("sort", (event) => {
    // 顺序真源是 ids：写回去的同时把 DOM 顺序搬成一样——几何按 DOM 量
    host.ids = event.detail.ids;
    for (const itemId of event.detail.ids) {
      root.append(root.querySelector(`[data-xh-part="item"][item-id="${itemId}"]`));
    }
    push(`${event.detail.id}：第 ${event.detail.from + 1} 位 → 第 ${event.detail.to + 1} 位`);
  });

  host.addEventListener("drag-end", (event) => {
    if (event.detail.canceled) push(`${event.detail.id}：已取消`);
  });
</script>
```

### 禁用

手柄退出 Tab 序列，按下也不进拖动

```vue
<script setup lang="ts">
import { XhSortableItem, XhSortableItemDragTrigger, XhSortableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const ids = ref(["锁定一", "锁定二", "锁定三"]);
</script>

<template>
  <XhSortableRoot v-model:ids="ids" disabled>
    <XhSortableItem v-for="id in ids" :key="id" :item-id="id" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid var(--xh-border-default)">
      <XhSortableItemDragTrigger :item-id="id" />
      <span>{{ id }}</span>
    </XhSortableItem>
  </XhSortableRoot>
</template>
```

```html
<xh-sortable ids="锁定一,锁定二,锁定三" disabled style="display: contents">
  <div data-xh-part="root">
    <div data-xh-part="item" item-id="锁定一" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid var(--xh-border-default)">
      <button data-xh-part="item-drag-trigger" item-id="锁定一"></button>
      <span>锁定一</span>
    </div>
    <div data-xh-part="item" item-id="锁定二" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid var(--xh-border-default)">
      <button data-xh-part="item-drag-trigger" item-id="锁定二"></button>
      <span>锁定二</span>
    </div>
    <div data-xh-part="item" item-id="锁定三" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid var(--xh-border-default)">
      <button data-xh-part="item-drag-trigger" item-id="锁定三"></button>
      <span>锁定三</span>
    </div>
    <div data-xh-part="live-region"></div>
  </div>
</xh-sortable>
```

## 设计指引

### 何时使用

- 顺序本身是数据的一部分：表格列的先后、标签页的排列、收藏项的次序。
- 顺序要存回后端：`sort` 事件直接给出重排好的 `ids`，接上就能提交。

### 何时不用

- 顺序由数据决定而不由人决定：那是排序规则，不是拖拽。
- 要把条目拖到**另一个**容器里：本组件只管单个列表内部的重排。

### 特性

- `ids` 是顺序的唯一真源，`sort` 事件回传的 `ids` 已经重排好，可以直接写回。
- 拖动过程走乐观投影：其余条目实时让位，松手即定，不是拖完才跳一下。
- 键盘路径默认开着且关不掉：空格拾起、方向键挪、空格放下、Esc 取消，全程有读屏播报。
- 按下之后要走够 `activationDistance`（默认 5px）才算拖动，因此条目本身仍然可以点击。
- 拖到容器边缘会自动滚动，视口外的落点够得着。
- `orientation` 三档：竖排、横排，以及换行网格用的 `both`——网格按最近中心判落点。
- 写一个 `drop-indicator` 节点（排在末项之后），拖动中会在松手后条目要插进去的那条缝上画一条线；落点回到起点时它自动收起。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-sortable>` |
| Vue 组件 | `XhSortableDropIndicator` `XhSortableItem` `XhSortableItemDragTrigger` `XhSortableLiveRegion` `XhSortableRoot` |
| 组合式函数 | `useSortable` |
| 状态机 | `sortableMachine` |
| 皮肤 | `@xihan-ui/styles/sortable.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="sortable"`：**`root`** · **`item`** · `item-drag-trigger` · `drop-indicator` · `live-region`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `ids` | `string[]` | 是 | 项的稳定标识，数组顺序就是当前顺序。这是顺序的唯一真源。 DOM 里项的先后必须与它一致——几何按 DOM 量，回调按它算。 |
| `orientation` | `SortableAxis` |  | 排序沿哪根轴走。换行网格用 `both`。 |
| `disabled` | `boolean` |  |  |
| `activationDistance` | `number` |  | 按下之后走多远才算开始拖，默认 5px。给 0 表示按下即拖。 |
| `autoScroll` | `boolean` |  | 拖到容器边缘时自动滚动，默认开。 |
| `dir` | `Direction` |  |  |
| `translations` | `Partial<SortableTranslations>` |  |  |
| `onSort` | `(details: SortableSortDetails) => void` |  | 顺序变化意图。取消的那次不发。 |
| `onDragStart` | `(details: SortableDragStartDetails) => void` |  |  |
| `onDragEnd` | `(details: SortableDragEndDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `sort` | `SortableSortDetails` | 顺序变化；detail 为 `{ from, to, id, ids }`，其中 ids 已重排好 |
| `drag-start` | `SortableDragStartDetails` | 拾起；detail 为 `{ id, from, mode }` |
| `drag-end` | `SortableDragEndDetails` | 收尾（含取消）；detail 为 `{ id, from, to, mode, canceled }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSortableItem` | `default` | `SortableItemSlotProps` |  |
| `XhSortableItemDragTrigger` | `default` | — |  |
| `XhSortableRoot` | `default` | `SortableRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `pending` · `dragging`

**事件**：`ITEM.POINTER_DOWN` · `POINTER.MOVE` · `POINTER.END` · `POINTER.CANCEL` · `ITEM.PICKUP` · `KEY.MOVE` · `KEY.DROP` · `KEY.CANCEL`

**判据**：`canSort` · `passedActivation`

## connect API

`useSortable` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

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
| `getDropIndicatorProps` | `() => T['element']` | 落点线：拖动中且落点与起点不同一位时才在场，位置由内联样式给出。 |
| `getLiveRegionProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in item-drag-trigger，未在拖动，not disabled | 拾起这一项，进入键盘拖动；播报它现在第几位、共几项、以及接下来能按什么 |
| `ArrowDown` / `ArrowRight` | 键盘拖动中 | 往后挪一位并播报新位置；已在末位时不动，也不回绕。竖直排布认上下键、水平排布认左右键，另一条轴上的方向键原样放行 |
| `ArrowUp` / `ArrowLeft` | 键盘拖动中 | 往前挪一位，规则同上；rtl 下左右两键对调，语义恒是「往前 / 往后」 |
| `Space` / `Enter` | 键盘拖动中 | 放下，按当前位置提交顺序并播报落点 |
| `Escape` | 键盘拖动中 | 取消，顺序回到拾起前，播报已取消与原位置 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

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

- 手柄是 `role=button`，带 `aria-roledescription="sortable"` 与 `aria-pressed`。
- 拖动过程的每一步都写进视觉隐藏的 `role=status` 区域，读屏能听到「移到第几位，共几项」。
- 拖动中的 Tab 会被拦下：焦点一旦移走，这一场就没有出口了。

## 样式

默认皮肤 `@xihan-ui/styles/sortable.css` 按部件选择：`[data-scope="sortable"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-dragging` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-dragging` | ''（条件成立时才出现） |
| `item` | `data-index` | String(item?.index ?? -1) |
| `item-drag-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `item-drag-trigger` | `data-dragging` | ''（条件成立时才出现） |
| `drop-indicator` | `data-orientation` | props.orientation |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-sortable-drag-bg-hover` | `item-drag-trigger` | `background` | `disabled`<br>`hover`<br>`not([data-disabled])` | `--xh-bg-subtle-hover` | sortable 的 item-drag-trigger 部件 background 覆盖槽。 |
| `--xh-sortable-drag-fg` | `item-drag-trigger` | `color` | `default` | `--xh-fg-muted` | sortable 的 item-drag-trigger 部件 color 覆盖槽。 |
| `--xh-sortable-drag-fg-disabled` | `item-drag-trigger` | `color` | `disabled` | `--xh-fg-disabled` | sortable 的 item-drag-trigger 部件 color 覆盖槽。 |
| `--xh-sortable-drag-fg-hover` | `item-drag-trigger` | `color` | `disabled`<br>`hover`<br>`not([data-disabled])` | `--xh-fg-default` | sortable 的 item-drag-trigger 部件 color 覆盖槽。 |
| `--xh-sortable-drag-grip-h` | `item-drag-trigger` | `block-size` | `empty` | `--xh-space-3` | sortable 的 item-drag-trigger 部件 block-size 覆盖槽。 |
| `--xh-sortable-drag-grip-w` | `item-drag-trigger` | `inline-size` | `empty` | `--xh-space-1` | sortable 的 item-drag-trigger 部件 inline-size 覆盖槽。 |
| `--xh-sortable-drag-radius` | `item-drag-trigger` | `border-radius` | `default` | `--xh-shape-control` | sortable 的 item-drag-trigger 部件 border-radius 覆盖槽。 |
| `--xh-sortable-drag-size` | `item-drag-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-action-size` | sortable 的 item-drag-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-sortable-drop-indicator-bg` | `drop-indicator` | `background` | `default` | `--xh-bg-brand` | sortable 的 drop-indicator 部件 background 覆盖槽。 |
| `--xh-sortable-drop-indicator-radius` | `drop-indicator` | `border-radius` | `default` | `--xh-shape-pill` | sortable 的 drop-indicator 部件 border-radius 覆盖槽。 |
| `--xh-sortable-drop-indicator-size` | `drop-indicator` | `block-size`<br>`inline-size` | `orientation=both`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-stroke-thick` | sortable 的 drop-indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-sortable-gap` | `root` | `gap` | `default` | `--xh-space-2` | sortable 的 root 部件 gap 覆盖槽。 |
| `--xh-sortable-item-opacity-dragging` | `item` | `opacity` | `dragging` | `0.9` | sortable 的 item 部件 opacity 覆盖槽。 |
| `--xh-sortable-item-shadow-dragging` | `item` | `box-shadow` | `dragging` | `--xh-elevation-raised` | sortable 的 item 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`box-shadow` · `opacity` · `transform` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 每项里放一个拖拽手柄：只有手柄能拖，条目其余部分照常可点。
- 与[表格](./table)的列设置配合，做成可拖的列顺序面板。
