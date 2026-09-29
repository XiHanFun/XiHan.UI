来源：https://ui.docs.xihanfun.com/components/grid-list

# GridList 网格列表 `new`

排列一组可选择、可执行主操作，并且每行还能放独立按钮的记录。它使用 ARIA grid/row/gridcell，而不是把按钮塞进 option；因此行选择与行内操作各有自己的焦点和事件。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/grid-list" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/grid-list.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/grid-list" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/grid-list" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/grid-list.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

点击行只改变选择，行内按钮执行自己的动作

```vue
<script setup lang="ts">
import type { GridListNode } from "@xihan-ui/headless";
import {
  XhGridListLabel,
  XhGridListRoot,
  XhGridListRow,
  XhGridListRowAction,
  XhGridListRowActions,
  XhGridListRowContent,
  XhGridListRowDescription,
  XhGridListRowSelectionIndicator,
  XhGridListRowText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const projects: GridListNode[] = [
  { value: "docs", label: "文档站", description: "组件文档与示例" },
  { value: "console", label: "管理后台", description: "运营与权限配置" },
  { value: "mobile", label: "移动端", description: "现场工作台" },
];
const selected = ref<string[]>(["docs"]);
const message = ref("尚未执行行内操作");
</script>

<template>
  <div data-demo-stack>
    <XhGridListRoot v-model:value="selected" :collection="projects">
      <XhGridListLabel>项目</XhGridListLabel>
      <XhGridListRow v-for="project in projects" :key="project.value" :value="project.value">
        <XhGridListRowSelectionIndicator />
        <XhGridListRowContent>
          <XhGridListRowText>{{ project.label }}</XhGridListRowText>
          <XhGridListRowDescription>{{ project.description }}</XhGridListRowDescription>
        </XhGridListRowContent>
        <XhGridListRowActions>
          <XhGridListRowAction @click="message = `编辑 ${project.label}`">编辑</XhGridListRowAction>
        </XhGridListRowActions>
      </XhGridListRow>
    </XhGridListRoot>
    <span data-label>已选：{{ selected.join("、") }}；{{ message }}</span>
  </div>
</template>
```

```html
<div data-demo-stack>
  <xh-grid-list id="grid-list-basic">
    <div data-xh-part="root">
      <span data-xh-part="label">项目</span>
      <div data-xh-part="row" value="docs">
        <span data-xh-part="row-selection-indicator"></span>
        <div data-xh-part="row-content"><span data-xh-part="row-text">文档站</span><span data-xh-part="row-description">组件文档与示例</span></div>
        <div data-xh-part="row-actions"><button data-xh-part="row-action">编辑</button></div>
      </div>
      <div data-xh-part="row" value="console">
        <span data-xh-part="row-selection-indicator"></span>
        <div data-xh-part="row-content"><span data-xh-part="row-text">管理后台</span><span data-xh-part="row-description">运营与权限配置</span></div>
        <div data-xh-part="row-actions"><button data-xh-part="row-action">编辑</button></div>
      </div>
      <div data-xh-part="row" value="mobile">
        <span data-xh-part="row-selection-indicator"></span>
        <div data-xh-part="row-content"><span data-xh-part="row-text">移动端</span><span data-xh-part="row-description">现场工作台</span></div>
        <div data-xh-part="row-actions"><button data-xh-part="row-action">编辑</button></div>
      </div>
    </div>
  </xh-grid-list>
  <span id="grid-list-basic-readout" data-label>已选：docs；尚未执行行内操作</span>
</div>

<script type="module">
  const host = document.getElementById("grid-list-basic");
  const readout = document.getElementById("grid-list-basic-readout");
  host.value = ["docs"];
  host.addEventListener("value-change", (event) => {
    host.value = event.detail.value;
    readout.textContent = "已选：" + event.detail.value.join("、");
  });
  for (const button of host.querySelectorAll('[data-xh-part="row-action"]')) {
    button.addEventListener("click", () => {
      const row = button.closest('[data-xh-part="row"]');
      readout.textContent = "编辑 " + row.querySelector('[data-xh-part="row-text"]').textContent;
    });
  }
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="grid-list"`：**`root`** · `label` · `row` · `row-selection-indicator` · `row-content` · `row-text` · `row-description` · `row-actions` · `row-action` · `empty` · `loading`

## 示例

### 多选

Space 切换当前行，Shift + 方向键、Shift + Space 与 Shift + 点击把锚点到那一行的一段并进选中，Ctrl 或 Cmd+A 选择或清空全部可用行

```vue
<script setup lang="ts">
import {
  XhGridListRoot,
  XhGridListRow,
  XhGridListRowContent,
  XhGridListRowSelectionIndicator,
  XhGridListRowText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const items = [
  { value: "read", label: "读取" },
  { value: "write", label: "写入" },
  { value: "deploy", label: "发布", disabled: true },
];
const selected = ref<string[]>(["read"]);
</script>

<template>
  <div data-demo-stack>
    <XhGridListRoot v-model:value="selected" :collection="items" selection-mode="multiple">
      <XhGridListRow v-for="item in items" :key="item.value" :value="item.value" :disabled="item.disabled">
        <XhGridListRowSelectionIndicator />
        <XhGridListRowContent><XhGridListRowText>{{ item.label }}</XhGridListRowText></XhGridListRowContent>
      </XhGridListRow>
    </XhGridListRoot>
    <span data-label>权限：{{ selected.join("、") || "无" }}</span>
  </div>
</template>
```

```html
<div data-demo-stack>
  <xh-grid-list id="grid-list-multiple" selection-mode="multiple">
    <div data-xh-part="root">
      <div data-xh-part="row" value="read"><span data-xh-part="row-selection-indicator"></span><div data-xh-part="row-content"><span data-xh-part="row-text">读取</span></div></div>
      <div data-xh-part="row" value="write"><span data-xh-part="row-selection-indicator"></span><div data-xh-part="row-content"><span data-xh-part="row-text">写入</span></div></div>
      <div data-xh-part="row" value="deploy" disabled><span data-xh-part="row-selection-indicator"></span><div data-xh-part="row-content"><span data-xh-part="row-text">发布</span></div></div>
    </div>
  </xh-grid-list>
  <span id="grid-list-multiple-readout" data-label>权限：read</span>
</div>
<script type="module">
  const host = document.getElementById("grid-list-multiple");
  const readout = document.getElementById("grid-list-multiple-readout");
  host.value = ["read"];
  host.addEventListener("value-change", (event) => {
    host.value = event.detail.value;
    readout.textContent = "权限：" + (event.detail.value.join("、") || "无");
  });
</script>
```

### 可拖动

GridList 负责选择和行内按钮，Sortable 负责指针与键盘重排

```vue
<script setup lang="ts">
import {
  XhGridListRoot,
  XhGridListRow,
  XhGridListRowActions,
  XhGridListRowContent,
  XhGridListRowText,
  XhSortableDropIndicator,
  XhSortableItem,
  XhSortableItemDragTrigger,
  XhSortableLiveRegion,
  XhSortableRoot,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const source = {
  brief: "需求梳理",
  design: "交互设计",
  build: "开发实现",
};
const ids = ref(["brief", "design", "build"]);
const rows = computed(() => ids.value.map(value => ({ value, label: source[value as keyof typeof source] })));
</script>

<template>
  <XhSortableRoot v-model:ids="ids">
    <XhGridListRoot :collection="rows">
      <XhSortableItem v-for="row in rows" :key="row.value" :item-id="row.value">
        <XhGridListRow :value="row.value">
          <XhGridListRowContent><XhGridListRowText>{{ row.label }}</XhGridListRowText></XhGridListRowContent>
          <XhGridListRowActions>
            <XhSortableItemDragTrigger :item-id="row.value" />
          </XhGridListRowActions>
        </XhGridListRow>
      </XhSortableItem>
    </XhGridListRoot>
    <XhSortableDropIndicator />
    <XhSortableLiveRegion />
  </XhSortableRoot>
</template>
```

```html
<xh-sortable id="grid-list-sortable">
  <div data-xh-part="root" data-xh-part-owner="sortable">
    <xh-grid-list id="grid-list-sortable-list">
      <div data-xh-part="root" data-xh-part-owner="grid-list">
        <div data-xh-part="item" data-xh-part-owner="sortable" item-id="brief"><div data-xh-part="row" data-xh-part-owner="grid-list" value="brief"><div data-xh-part="row-content"><span data-xh-part="row-text">需求梳理</span></div><div data-xh-part="row-actions"><button data-xh-part="item-drag-trigger" data-xh-part-owner="sortable" item-id="brief"></button></div></div></div>
        <div data-xh-part="item" data-xh-part-owner="sortable" item-id="design"><div data-xh-part="row" data-xh-part-owner="grid-list" value="design"><div data-xh-part="row-content"><span data-xh-part="row-text">交互设计</span></div><div data-xh-part="row-actions"><button data-xh-part="item-drag-trigger" data-xh-part-owner="sortable" item-id="design"></button></div></div></div>
        <div data-xh-part="item" data-xh-part-owner="sortable" item-id="build"><div data-xh-part="row" data-xh-part-owner="grid-list" value="build"><div data-xh-part="row-content"><span data-xh-part="row-text">开发实现</span></div><div data-xh-part="row-actions"><button data-xh-part="item-drag-trigger" data-xh-part-owner="sortable" item-id="build"></button></div></div></div>
      </div>
    </xh-grid-list>
    <div data-xh-part="drop-indicator"></div>
    <div data-xh-part="live-region"></div>
  </div>
</xh-sortable>
<script type="module">
  const sortable = document.getElementById("grid-list-sortable");
  const list = document.getElementById("grid-list-sortable-list");
  const labels = { brief: "需求梳理", design: "交互设计", build: "开发实现" };
  sortable.partRoots = [...sortable.querySelectorAll('[data-xh-part-owner="sortable"]')];
  list.partRoots = [...list.querySelectorAll('[data-xh-part-owner="grid-list"][data-xh-part="row"]')];
  sortable.ids = ["brief", "design", "build"];
  list.collection = sortable.ids.map(value => ({ value, label: labels[value] }));
  sortable.addEventListener("sort", (event) => {
    sortable.ids = event.detail.ids;
    const root = list.querySelector('[data-xh-part="root"]');
    for (const id of event.detail.ids) root.append(root.querySelector('[item-id="' + id + '"]'));
    list.collection = event.detail.ids.map(value => ({ value, label: labels[value] }));
    sortable.requestUpdate();
    list.requestUpdate();
  });
</script>
```

### Action List

不保留选择，Enter 或点击行触发主操作，行内按钮仍独立

```vue
<script setup lang="ts">
import {
  XhGridListRoot,
  XhGridListRow,
  XhGridListRowAction,
  XhGridListRowActions,
  XhGridListRowContent,
  XhGridListRowText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const commands = [
  { value: "open", label: "打开项目" },
  { value: "duplicate", label: "复制项目" },
  { value: "archive", label: "归档项目" },
];
const result = ref("等待操作");
</script>

<template>
  <div data-demo-stack>
    <XhGridListRoot :collection="commands" selection-mode="none" @action="result = `主操作：${$event.value}`">
      <XhGridListRow v-for="command in commands" :key="command.value" :value="command.value">
        <XhGridListRowContent><XhGridListRowText>{{ command.label }}</XhGridListRowText></XhGridListRowContent>
        <XhGridListRowActions>
          <XhGridListRowAction @click="result = `说明：${command.label}`">说明</XhGridListRowAction>
        </XhGridListRowActions>
      </XhGridListRow>
    </XhGridListRoot>
    <span data-label>{{ result }}</span>
  </div>
</template>
```

```html
<div data-demo-stack>
  <xh-grid-list id="grid-list-actions" selection-mode="none">
    <div data-xh-part="root">
      <div data-xh-part="row" value="open"><div data-xh-part="row-content"><span data-xh-part="row-text">打开项目</span></div><div data-xh-part="row-actions"><button data-xh-part="row-action">说明</button></div></div>
      <div data-xh-part="row" value="duplicate"><div data-xh-part="row-content"><span data-xh-part="row-text">复制项目</span></div><div data-xh-part="row-actions"><button data-xh-part="row-action">说明</button></div></div>
      <div data-xh-part="row" value="archive"><div data-xh-part="row-content"><span data-xh-part="row-text">归档项目</span></div><div data-xh-part="row-actions"><button data-xh-part="row-action">说明</button></div></div>
    </div>
  </xh-grid-list>
  <span id="grid-list-actions-readout" data-label>等待操作</span>
</div>
<script type="module">
  const host = document.getElementById("grid-list-actions");
  const readout = document.getElementById("grid-list-actions-readout");
  host.addEventListener("action", event => { readout.textContent = "主操作：" + event.detail.value; });
  for (const button of host.querySelectorAll('[data-xh-part="row-action"]')) {
    button.addEventListener("click", () => {
      readout.textContent = "说明：" + button.closest('[data-xh-part="row"]').querySelector('[data-xh-part="row-text"]').textContent;
    });
  }
</script>
```

## 设计指引

### 何时使用

- 每行既能选中，又有编辑、预览、删除等独立操作。
- 记录不需要按列对照，不值得升级为表格。
- 需要与 Sortable 组合，用指针或键盘调整行顺序。

### 何时不用

- 只有选择，没有行内按钮：使用[列表框](./listbox)。
- 只有展示和按钮，没有选择或行主操作：使用[列表](./list)。
- 多个字段必须按列比较、排序或筛选：使用[表格](./table)。

### 特性

- selectionMode 支持 none、single 与 multiple；none 是 Action List 模式。
- 整组只有一个行级 Tab 停靠点；上下方向键、Home/End 与连打检索只在行焦点上工作。
- Space 改变选择，Enter 触发行主操作；焦点在 row-action 时完全交给原生按钮。
- 多选下 Shift 扩选：Shift + 方向键 / Home / End 移动焦点并把锚点到新焦点行那一段并进选中，Shift + Space 与 Shift + 点击扩到那一行。每一次扩选都从扩选开始前的选中集重算，往回扩即收回；禁用行占着位置但不被收进去。
- row-actions 是独立 gridcell，按钮点击不会冒泡成行选择。
- 在途分两种：还没有行时 `loading` 占位露面，一枚加载环排在文案之前；已有行时重新取数不换成占位，行保留上一帧淡下，取完再淡回。两种都由 `root` 报告 `aria-busy`。
- 与 [Sortable](./sortable) 组合即可获得指针拖动、键盘拖动、落点线和读屏播报；GridList 不复制拖拽协议。
- collection 提供行标题、说明、禁用和语气的事实源；作者仍负责铺设各部件。

### 最佳实践

- 每行只保留一到两个高频按钮，更多操作收进 Menu。
- 行主操作和行内按钮使用不同动词，不让同一点击产生两个结果。
- 可排序时始终显示拖拽把手，不把整行点击与拖动混在同一命中区。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-grid-list>` |
| Vue 组件 | `XhGridListEmpty` `XhGridListLabel` `XhGridListLoading` `XhGridListRoot` `XhGridListRow` `XhGridListRowAction` `XhGridListRowActions` `XhGridListRowContent` `XhGridListRowDescription` `XhGridListRowSelectionIndicator` `XhGridListRowText` |
| 组合式函数 | `useGridList` |
| 状态机 | `gridListMachine` |
| 皮肤 | `@xihan-ui/styles/grid-list.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `GridListNode[]` |  |  |
| `value` | `string \| string[]` |  |  |
| `defaultValue` | `string \| string[]` |  |  |
| `selectionMode` | `GridListSelectionMode` |  | none 只保留行主操作与行内按钮；single / multiple 开启选择。默认 single。 |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |
| `invalid` | `boolean` |  |  |
| `loading` | `boolean` |  | 取数在途：root 报告 aria-busy；还没有行时 loading 占位露面，已有行时行保留上一帧淡下、不接指针。 |
| `loop` | `boolean` |  |  |
| `typeahead` | `boolean` |  |  |
| `dir` | `Direction` |  |  |
| `variant` | `ControlVariant` |  |  |
| `tone` | `Tone` |  |  |
| `size` | `Size` |  |  |
| `translations` | `Partial<GridListTranslations>` |  |  |
| `onValueChange` | `(details: GridListValueChangeDetails) => void` |  |  |
| `onAction` | `(details: GridListActionDetails) => void` |  | Enter 或 selectionMode=none 时点击行触发；行内按钮保留自己的原生事件。 |

### GridListNode

`collection` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | 是 |  |
| `label` | `string` |  |  |
| `description` | `string` |  |  |
| `disabled` | `boolean` |  |  |
| `tone` | `Tone` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `GridListValueChangeDetails` | 选择变化；detail 为 { value: string[] } |
| `action` | `GridListActionDetails` | 行主操作；detail 为 { value: string } |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhGridListRoot` | `default` | — |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhGridListRoot` | `children` | `ReactNode` |  |  |
| `XhGridListRow` | `value` | `string` | 是 |  |
| `XhGridListRow` | `disabled` | `boolean` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `row` | 'checked' \| 'unchecked' |
| `row-selection-indicator` | 'checked' \| 'unchecked' |
| `row-content` | 'checked' \| 'unchecked' |
| `row-text` | 'checked' \| 'unchecked' |
| `row-description` | 'checked' \| 'unchecked' |
| `row-actions` | 'checked' \| 'unchecked' |
| `row-action` | 'checked' \| 'unchecked' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `ROW.SELECT` · `ROW.TOGGLE` · `ROW.EXTEND` · `ROW.ACTION` · `ROW.FOCUS` · `GRID.BLUR` · `PRESS.START` · `PRESS.END`

**判据**：`canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` |  |
| `collection` | `readonly GridListNodeMeta[]` |  |
| `selectionMode` | `GridListSelectionMode` |  |
| `focusedValue` | `string \| null` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `loading` | `boolean` |  |
| `isSelected` | `(value: string) => boolean` |  |
| `setValue` | `(next: string[]) => void` |  |
| `select` | `(value: string) => void` |  |
| `toggle` | `(value: string) => void` |  |
| `action` | `(value: string) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getRowProps` | `(props: GridListRowProps) => T['element']` |  |
| `getRowSelectionIndicatorProps` | `(props: GridListRowProps) => T['element']` |  |
| `getRowContentProps` | `(props: GridListRowProps) => T['element']` |  |
| `getRowTextProps` | `(props: GridListRowProps) => T['element']` |  |
| `getRowDescriptionProps` | `(props: GridListRowProps) => T['element']` |  |
| `getRowActionsProps` | `(props: GridListRowProps) => T['element']` |  |
| `getRowActionProps` | `(props: GridListRowProps) => T['button']` |  |
| `getEmptyProps` | `() => T['element']` |  |
| `getLoadingProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/grid/#keyboardinteractionforlayoutgrids)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside grid list | 进入当前锚点行；行内按钮保持原生 Tab 次序 |
| `ArrowDown` | focus on row | 焦点移到下一行；到末尾时按 loop 决定是否回绕 |
| `ArrowUp` | focus on row | 焦点移到上一行；到开头时按 loop 决定是否回绕 |
| `Home` | focus on row | 焦点移到第一行 |
| `End` | focus on row | 焦点移到最后一行 |
| `Space` | focus on selectable row | 单选时选中这一行，多选时切换这一行；不触发行内按钮 |
| `Shift+ArrowDown` / `Shift+ArrowUp` / `Shift+Home` / `Shift+End` | focus on row, selectionMode=multiple | 焦点移动，并把锚点到新焦点行那一段并进扩选开始前的选中；往回扩即收回，禁用行不被收进去 |
| `Shift+Space` | focus on row, selectionMode=multiple | 把锚点到焦点行那一段并进扩选开始前的选中；没有锚点时切换这一行并记为锚点 |
| `Enter` | focus on row | 触发行主操作；未提供主操作且允许选择时改为选中这一行 |
| `Ctrl+A` / `Cmd+A` | focus on multiple grid list | 选中全部可选行；已经全选时取消全部可选行 |
| `单个可打印字符` | focus on row, typeahead 未关闭 | 按行标题连打检索，只移动焦点 |
| `Enter` / `Space` | focus on inline button | 交给原生按钮；不改变行选中状态，也不触发行主操作 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `root` | `aria-disabled` | 'true' \| 'false' |
| `root` | `aria-invalid` | 'true' \| 'false' |
| `root` | `aria-label` | props.translations.root |
| `root` | `aria-labelledby` | `label` 部件的 id |
| `root` | `aria-multiselectable` | 'true' \| undefined |
| `root` | `aria-readonly` | 'true' \| 'false' |
| `root` | `role` | 'grid' |
| `row` | `aria-disabled` | 'true' \| 'false' |
| `row` | `aria-selected` | 'true' \| 'false' \| undefined |
| `row` | `role` | 'row' |
| `row-selection-indicator` | `aria-hidden` | 'true' |
| `row-content` | `role` | 'gridcell' |
| `row-actions` | `role` | 'gridcell' |

## 样式参考

### 皮肤

`@xihan-ui/styles/grid-list.css` 使用 `[data-scope="grid-list"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `row` | `data-disabled` | ''（条件成立时才出现） |
| `row` | `data-highlighted` | ''（条件成立时才出现） |
| `row` | `data-pressed` | ''（条件成立时才出现） |
| `row` | `data-state` | 'checked' \| 'unchecked' |
| `row` | `data-tone` | metaOf.get(row.value)?.tone |
| `row` | `data-xh-collection-context` | 'page' |
| `row` | `data-xh-collection-item` | '' |
| `row` | `data-xh-collection-size` | props.size |
| `row-selection-indicator` | `data-disabled` | ''（条件成立时才出现） |
| `row-selection-indicator` | `data-highlighted` | ''（条件成立时才出现） |
| `row-selection-indicator` | `data-state` | 'checked' \| 'unchecked' |
| `row-selection-indicator` | `data-xh-check-mark` | 'checked' \| 'unchecked' |
| `row-selection-indicator` | `data-xh-check-mark-profile` | 'box' |
| `row-selection-indicator` | `data-xh-collection-slot` | 'prefix' |
| `row-content` | `data-disabled` | ''（条件成立时才出现） |
| `row-content` | `data-highlighted` | ''（条件成立时才出现） |
| `row-content` | `data-state` | 'checked' \| 'unchecked' |
| `row-text` | `data-disabled` | ''（条件成立时才出现） |
| `row-text` | `data-highlighted` | ''（条件成立时才出现） |
| `row-text` | `data-state` | 'checked' \| 'unchecked' |
| `row-text` | `data-xh-collection-slot` | 'text' |
| `row-description` | `data-disabled` | ''（条件成立时才出现） |
| `row-description` | `data-highlighted` | ''（条件成立时才出现） |
| `row-description` | `data-state` | 'checked' \| 'unchecked' |
| `row-description` | `data-xh-collection-slot` | 'description' |
| `row-actions` | `data-disabled` | ''（条件成立时才出现） |
| `row-actions` | `data-highlighted` | ''（条件成立时才出现） |
| `row-actions` | `data-state` | 'checked' \| 'unchecked' |
| `row-action` | `data-disabled` | ''（条件成立时才出现） |
| `row-action` | `data-highlighted` | ''（条件成立时才出现） |
| `row-action` | `data-state` | 'checked' \| 'unchecked' |
| `row-action` | `data-xh-action-control` | '' |
| `row-action` | `data-xh-action-display` | 'always' |
| `row-action` | `data-xh-action-profile` | 'text' |
| `row-action` | `data-xh-action-size` | 'xs' |
| `row-action` | `data-xh-action-variant` | 'ghost' |
| `loading` | `data-loading` | ''（条件成立时才出现） |
| `loading` | `data-xh-loading-ring` | '' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-grid-list-bg` | `root` | `background` | `default`<br>`variant=outline`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface`<br>`transparent` | grid-list 的 root 部件 background 覆盖槽。 |
| `--xh-grid-list-border` | `root` | `border-color` | `variant=outline` | `--xh-border-default` | grid-list 的 root 部件 border-color 覆盖槽。 |
| `--xh-grid-list-border-invalid` | `root` | `border-color` | `invalid` | `--xh-border-invalid` | grid-list 的 root 部件 border-color 覆盖槽。 |
| `--xh-grid-list-gap` | `root` | `gap` | `default` | `--xh-list-option-gap` | grid-list 的 root 部件 gap 覆盖槽。 |
| `--xh-grid-list-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | grid-list 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-grid-list-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | grid-list 的 label 部件 color 覆盖槽。 |
| `--xh-grid-list-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | grid-list 的 label 部件 font-size 覆盖槽。 |
| `--xh-grid-list-label-font-weight` | `label` | `font-weight` | `default` | `--xh-font-weight-semibold` | grid-list 的 label 部件 font-weight 覆盖槽。 |
| `--xh-grid-list-label-px` | `label` | `padding-inline` | `default` | `--xh-control-px-md` | grid-list 的 label 部件 padding-inline 覆盖槽。 |
| `--xh-grid-list-label-py` | `label` | `padding-block` | `default` | `--xh-space-1` | grid-list 的 label 部件 padding-block 覆盖槽。 |
| `--xh-grid-list-p` | `root` | `padding` | `default` | `--xh-space-1` | grid-list 的 root 部件 padding 覆盖槽。 |
| `--xh-grid-list-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | grid-list 的 root 部件 border-radius 覆盖槽。 |
| `--xh-grid-list-row-action-font-size` | `row-action` | `font-size` | `default` | `--xh-control-font-sm` | grid-list 的 row-action 部件 font-size 覆盖槽。 |
| `--xh-grid-list-row-actions-gap` | `row-actions` | `gap` | `default` | `--xh-space-1` | grid-list 的 row-actions 部件 gap 覆盖槽。 |
| `--xh-grid-list-row-actions-ms` | `row-actions` | `margin-inline-start` | `default` | `--xh-control-gap-md` | grid-list 的 row-actions 部件 margin-inline-start 覆盖槽。 |
| `--xh-grid-list-row-bg-selected` | `row` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not(:focus-visible)`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=page` | `--xh-bg-brand-subtle` | grid-list 的 row 部件 background-color 覆盖槽。 |
| `--xh-grid-list-row-content-gap` | `row-content` | `gap` | `default` | `--xh-space-1` | grid-list 的 row-content 部件 gap 覆盖槽。 |
| `--xh-grid-list-row-description-fg` | `row-description` | `color` | `default` | `--xh-fg-muted` | grid-list 的 row-description 部件 color 覆盖槽。 |
| `--xh-grid-list-row-description-font-size` | `row-description` | `font-size` | `default` | `--xh-control-caption-md` | grid-list 的 row-description 部件 font-size 覆盖槽。 |
| `--xh-grid-list-row-fg-selected` | `row` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=page` | `--xh-fg-on-brand-subtle` | grid-list 的 row 部件 color 覆盖槽。 |
| `--xh-grid-list-row-indicator-bg` | `row-selection-indicator` | `background` | `default` | `transparent` | grid-list 的 row-selection-indicator 部件 background 覆盖槽。 |
| `--xh-grid-list-row-indicator-bg-selected` | `row-selection-indicator` | `background` | `state=checked` | `--xh-_grid-list-indicator-accent` | grid-list 的 row-selection-indicator 部件 background 覆盖槽。 |
| `--xh-grid-list-row-indicator-border` | `row-selection-indicator` | `border` | `default` | `--xh-border-control` | grid-list 的 row-selection-indicator 部件 border 覆盖槽。 |
| `--xh-grid-list-row-indicator-border-selected` | `row-selection-indicator` | `border-color` | `state=checked` | `--xh-_grid-list-indicator-accent` | grid-list 的 row-selection-indicator 部件 border-color 覆盖槽。 |
| `--xh-grid-list-row-indicator-fg-selected` | `row-selection-indicator` | `color` | `default` | `--xh-_grid-list-indicator-on-accent` | grid-list 的 row-selection-indicator 部件 color 覆盖槽。 |
| `--xh-grid-list-row-indicator-glyph-size` | `row-selection-indicator` | `--xh-icon-size` | `default` | `--xh-_grid-list-indicator-glyph` | grid-list 的 row-selection-indicator 部件 --xh-icon-size 覆盖槽。 |
| `--xh-grid-list-row-indicator-me` | `row-selection-indicator` | `margin-inline-end` | `default` | `--xh-control-gap-md` | grid-list 的 row-selection-indicator 部件 margin-inline-end 覆盖槽。 |
| `--xh-grid-list-row-indicator-radius` | `row-selection-indicator` | `border-radius` | `default` | `--xh-shape-inset` | grid-list 的 row-selection-indicator 部件 border-radius 覆盖槽。 |
| `--xh-grid-list-row-indicator-size` | `row-selection-indicator` | `block-size`<br>`inline-size` | `default` | `--xh-_grid-list-indicator` | grid-list 的 row-selection-indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-grid-list-row-loading-opacity` | `root`<br>`row` | `opacity` | `loading` | `--xh-state-disabled-opacity` | grid-list 的 root、row 部件 opacity 覆盖槽。 |
| `--xh-grid-list-row-radius` | `row` | `border-radius` | `default` | `--xh-shape-control` | grid-list 的 row 部件 border-radius 覆盖槽。 |
| `--xh-grid-list-state-fg` | `empty`<br>`loading` | `color` | `default` | `--xh-fg-muted` | grid-list 的 empty、loading 部件 color 覆盖槽。 |
| `--xh-grid-list-state-font-size` | `empty`<br>`loading` | `font-size` | `default` | `--xh-_grid-list-state-font-size` | grid-list 的 empty、loading 部件 font-size 覆盖槽。 |
| `--xh-grid-list-state-gap` | `empty`<br>`loading` | `gap` | `default` | `--xh-control-gap-md` | grid-list 的 empty、loading 部件 gap 覆盖槽。 |
| `--xh-grid-list-state-px` | `empty`<br>`loading` | `padding-inline` | `default` | `--xh-_grid-list-state-px` | grid-list 的 empty、loading 部件 padding-inline 覆盖槽。 |
| `--xh-grid-list-state-py` | `empty`<br>`loading` | `padding-block` | `default` | `--xh-space-3` | grid-list 的 empty、loading 部件 padding-block 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 切换（见[动效规范](../design/motion#角色)）。

`-webkit-mask-size` · `background-color` · `border-color` · `color` · `mask-size` · `opacity` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
