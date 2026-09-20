来源：https://ui.docs.xihanfun.com/components/context-menu

# ContextMenu 右键菜单 `alpha`

通过右键或长按在指针位置打开命令菜单。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/context-menu" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/context-menu.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/context-menu" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/context-menu" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/context-menu.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

在目标区域右键打开命令菜单

```vue
<script setup lang="ts">
import { XhContextMenuRoot } from "@xihan-ui/vue";

const commands = [
  { value: "open", label: "打开" },
  { value: "rename", label: "重命名" },
  { value: "duplicate", label: "创建副本" },
  { value: "delete", label: "移到回收站", separatorBefore: true },
];
</script>

<template>
  <XhContextMenuRoot :collection="commands">
    <template #trigger>
      <span
        style="
          display: grid;
          place-items: center;
          gap: 6px;
          inline-size: min(480px, 100%);
          min-block-size: 160px;
          border-radius: var(--xh-shape-surface);
          background: var(--xh-bg-subtle);
          cursor: context-menu;
        "
      >
        <strong>设计规范.pdf</strong>
        <span style="color: var(--xh-fg-muted)">右键打开菜单</span>
      </span>
    </template>
  </XhContextMenuRoot>
</template>
```

```html
<xh-context-menu>
  <div data-xh-part="root">
    <div
      data-xh-part="trigger"
      style="display: grid; place-items: center; gap: 6px; inline-size: min(480px, 100%); min-block-size: 160px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); cursor: context-menu"
    >
      <strong>设计规范.pdf</strong>
      <span style="color: var(--xh-fg-muted)">右键打开菜单</span>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="open"><span data-xh-part="item-text">打开</span></div>
        <div data-xh-part="item" value="rename"><span data-xh-part="item-text">重命名</span></div>
        <div data-xh-part="item" value="duplicate"><span data-xh-part="item-text">创建副本</span></div>
        <div data-xh-part="separator"></div>
        <div data-xh-part="item" value="delete"><span data-xh-part="item-text">移到回收站</span></div>
      </div>
    </div>
  </div>
</xh-context-menu>
```

## 组件结构

加粗的是必需部件。

`data-scope="context-menu"`：`root` · **`trigger`** · `positioner` · **`content`** · **`item`** · `item-text` · `item-indicator` · `item-description` · `separator` · `group` · `group-label` · `arrow`

## 示例

### 分组

使用标题与分隔线组织命令

```vue
<script setup lang="ts">
import { XhContextMenuRoot } from "@xihan-ui/vue";

const commands = [
  { value: "name", label: "按名称", indicator: "", group: "sort", groupLabel: "排序方式" },
  { value: "time", label: "按修改时间", group: "sort" },
  { value: "list", label: "列表", group: "view", groupLabel: "视图", separatorBefore: true },
  { value: "grid", label: "网格", group: "view" },
];
</script>

<template>
  <XhContextMenuRoot :collection="commands">
    <template #trigger>
      <span
        style="display: grid; place-items: center; inline-size: min(480px, 100%); min-block-size: 144px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); cursor: context-menu"
      >
        右键设置文件视图
      </span>
    </template>
  </XhContextMenuRoot>
</template>
```

```html
<xh-context-menu>
  <div data-xh-part="root">
    <div
      data-xh-part="trigger"
      style="display: grid; place-items: center; inline-size: min(480px, 100%); min-block-size: 144px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); cursor: context-menu"
    >
      右键设置文件视图
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="group" value="sort">
          <span data-xh-part="group-label">排序方式</span>
          <div data-xh-part="item" value="name"><span data-xh-part="item-indicator"></span><span data-xh-part="item-text">按名称</span></div>
          <div data-xh-part="item" value="time"><span data-xh-part="item-text">按修改时间</span></div>
        </div>
        <div data-xh-part="separator"></div>
        <div data-xh-part="group" value="view">
          <span data-xh-part="group-label">视图</span>
          <div data-xh-part="item" value="list"><span data-xh-part="item-text">列表</span></div>
          <div data-xh-part="item" value="grid"><span data-xh-part="item-text">网格</span></div>
        </div>
      </div>
    </div>
  </div>
</xh-context-menu>
```

### 图标与快捷键

在命令两侧补充识别信息

```vue
<script setup lang="ts">
import { CopyIcon, PencilIcon, TrashIcon } from "@xihan-ui/icons";
import {
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuItemText,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSeparator,
  XhContextMenuTrigger,
  XhIcon,
} from "@xihan-ui/vue";
</script>

<template>
  <XhContextMenuRoot>
    <XhContextMenuTrigger
      style="display: grid; place-items: center; inline-size: min(480px, 100%); min-block-size: 144px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); cursor: context-menu"
    >
      右键编辑 notes.md
    </XhContextMenuTrigger>
    <XhContextMenuPositioner>
      <XhContextMenuContent>
        <XhContextMenuItem value="copy">
          <XhIcon :icon="CopyIcon" size="sm" />
          <XhContextMenuItemText>复制</XhContextMenuItemText>
          <span aria-hidden="true">⌘ C</span>
        </XhContextMenuItem>
        <XhContextMenuItem value="rename">
          <XhIcon :icon="PencilIcon" size="sm" />
          <XhContextMenuItemText>重命名</XhContextMenuItemText>
          <span aria-hidden="true">F2</span>
        </XhContextMenuItem>
        <XhContextMenuSeparator />
        <XhContextMenuItem value="delete">
          <XhIcon :icon="TrashIcon" size="sm" />
          <XhContextMenuItemText>移到回收站</XhContextMenuItemText>
          <span aria-hidden="true">⌫</span>
        </XhContextMenuItem>
      </XhContextMenuContent>
    </XhContextMenuPositioner>
  </XhContextMenuRoot>
</template>
```

```html
<xh-context-menu>
  <div data-xh-part="root">
    <div data-xh-part="trigger" style="display: grid; place-items: center; inline-size: min(480px, 100%); min-block-size: 144px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); cursor: context-menu">
      右键编辑 notes.md
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="copy">
          <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>
          <span data-xh-part="item-text">复制</span><span aria-hidden="true">⌘ C</span>
        </div>
        <div data-xh-part="item" value="rename">
          <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 20h4l11-11-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>
          <span data-xh-part="item-text">重命名</span><span aria-hidden="true">F2</span>
        </div>
        <div data-xh-part="separator"></div>
        <div data-xh-part="item" value="delete">
          <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13"/></svg>
          <span data-xh-part="item-text">移到回收站</span><span aria-hidden="true">⌫</span>
        </div>
      </div>
    </div>
  </div>
</xh-context-menu>
```

### 子菜单

将相关命令收进下一层

```vue
<script setup lang="ts">
import {
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSeparator,
  XhContextMenuSub,
  XhContextMenuSubTrigger,
  XhContextMenuTrigger,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
} from "@xihan-ui/vue";
</script>

<template>
  <XhContextMenuRoot>
    <XhContextMenuTrigger
      style="display: grid; place-items: center; inline-size: min(480px, 100%); min-block-size: 144px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); cursor: context-menu"
    >
      右键管理项目
    </XhContextMenuTrigger>
    <XhContextMenuPositioner>
      <XhContextMenuContent>
        <XhContextMenuItem value="open">打开</XhContextMenuItem>
        <XhContextMenuItem value="rename">重命名</XhContextMenuItem>
        <XhContextMenuSeparator />
        <XhContextMenuSub value="share">
          <XhContextMenuSubTrigger>发送到</XhContextMenuSubTrigger>
          <XhMenuPositioner>
            <XhMenuContent>
              <XhMenuItem value="email">邮件</XhMenuItem>
              <XhMenuItem value="message">消息</XhMenuItem>
            </XhMenuContent>
          </XhMenuPositioner>
        </XhContextMenuSub>
        <XhContextMenuSeparator />
        <XhContextMenuItem value="delete">移到回收站</XhContextMenuItem>
      </XhContextMenuContent>
    </XhContextMenuPositioner>
  </XhContextMenuRoot>
</template>
```

```html
<xh-context-menu>
  <div data-xh-part="root">
    <div data-xh-part="trigger" style="display: grid; place-items: center; inline-size: min(480px, 100%); min-block-size: 144px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); cursor: context-menu">
      右键管理项目
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="open">打开</div>
        <div data-xh-part="item" value="rename">重命名</div>
        <div data-xh-part="separator"></div>
        <xh-menu submenu open-on-hover placement="right-start" style="display: contents">
          <div data-xh-part="trigger" value="share">发送到</div>
          <div data-xh-part="positioner">
            <div data-xh-part="content">
              <div data-xh-part="item" value="email">邮件</div>
              <div data-xh-part="item" value="message">消息</div>
            </div>
          </div>
        </xh-menu>
        <div data-xh-part="separator"></div>
        <div data-xh-part="item" value="delete">移到回收站</div>
      </div>
    </div>
  </div>
</xh-context-menu>
```

## 设计指引

### 何时使用

- 为文件、表格行或画布对象提供快捷操作。

### 何时不用

- 主要操作应保留可见入口。
- 以触摸操作为主的界面不应只依赖长按。
- 选择值时使用[选择器](./select)。

### 特性

- 菜单默认贴近指针位置。
- 支持分组、分隔线、标记位和子菜单。
- `typeahead` 控制首字符检索，`longPressDelay` 设置长按时间。
- 条目可组合图标、文字、说明和快捷键提示。
- 选中任意层级的命令后发出根级 `select` 并关闭菜单链。

### 组合

- 使用 `XhContextMenuSub` 创建子菜单。

### 最佳实践

- 右键菜单只作为快捷入口，不替代页面上的主要操作。
- 条目较多时按功能分组。
- 仅为有意义的命令添加图标或快捷键提示。

### 反模式

- 不要在整页范围覆盖浏览器原生右键菜单。
- 不要移除复制、打开链接等原生能力而不提供等价入口。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-context-menu>` |
| Vue 组件 | `XhContextMenuArrow` `XhContextMenuContent` `XhContextMenuGroup` `XhContextMenuGroupLabel` `XhContextMenuItem` `XhContextMenuItemDescription` `XhContextMenuItemIndicator` `XhContextMenuItemText` `XhContextMenuPositioner` `XhContextMenuRoot` `XhContextMenuSeparator` `XhContextMenuSub` `XhContextMenuSubTrigger` `XhContextMenuTrigger` |
| 组合式函数 | `useContextMenu` |
| 状态机 | `contextMenuMachine` |
| 皮肤 | `@xihan-ui/styles/context-menu.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `ContextMenuNode[]` |  | 条目数据，显示文本、禁用、标记位与分组的事实源。提供后条目部件只需声明 value。 未提供时回到文本与禁用全部写在条目部件上的方式。 |
| `open` | `boolean` |  | 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `placement` | `Placement` |  | 相对光标位置的首选放置位，默认 bottom-start。 |
| `offset` | `number` |  | 浮层与光标的间距（px），默认 0：右键菜单需要贴近光标。 |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `typeahead` | `boolean` |  | 连打检索，默认开启。关闭后可打印字符一律放行给页面。 |
| `translations` | `Partial<ContextMenuTranslations>` |  | 读屏文案，默认英文。 |
| `longPressDelay` | `number` |  | 触摸端长按多久视为触发（ms），默认 700。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定条目高亮与标记位使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定条目高度、内边距与字号档位。 |
| `onOpenChange` | `(details: ContextMenuOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onSelect` | `(details: ContextMenuSelectDetails) => void` |  | 条目被选中；菜单随之关闭。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `ContextMenuOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |
| `select` | `ContextMenuSelectDetails` | 条目被选中（菜单随之关闭）；detail 为 `{ value: string }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhContextMenuRoot` | `default` | `ContextMenuRootSlotProps` |  |
| `XhContextMenuRoot` | `trigger` | — |  |
| `XhContextMenuRoot` | `item` | `ContextMenuNodeMeta` |  |
| `XhContextMenuSub` | `default` | `ContextMenuSubSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`closed` · `pressing` · `open`

**事件**：`CONTEXT.MENU` · `OPEN` · `CLOSE` · `PRESS.START` · `PRESS.MOVE` · `PRESS.END` · `after.longPressDelay` · `ITEM.PRESS.START` · `ITEM.PRESS.END` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ITEM.FOCUS` · `FOCUS.CLEAR` · `ITEM.LOST` · `ITEM.SELECT`

**判据**：`isOpenControlled` · `movedBeyondTolerance` · `canPressItem`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `collection` | `readonly ContextMenuNodeMeta[]` | 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `pressing` | `boolean` | 长按计时进行中；触发区据此提供按压反馈。 |
| `point` | `ContextMenuPoint \| null` | 当前锚点坐标；从未打开过时为 null。 |
| `focusedValue` | `string \| null` | 焦点锚点；收起时为 null。 |
| `setOpen` | `(next: boolean) => void` | 收起经 CLOSE；展开沿用最近一次锚点坐标，从未有过坐标时锚定在触发区的起始角。 |
| `openAt` | `(x: number, y: number) => void` | 命令式展开到指定视口坐标。 |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['element']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getItemProps` | `(props: ContextMenuItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: ContextMenuItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: ContextMenuItemProps) => T['element']` |  |
| `getItemDescriptionProps` | `(props: ContextMenuItemProps) => T['element']` |  |
| `getSeparatorProps` | `() => T['element']` |  |
| `getGroupProps` | `(props: ContextMenuGroupProps) => T['element']` |  |
| `getGroupLabelProps` | `(props: ContextMenuGroupProps) => T['element']` |  |
| `getArrowProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/menu/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ContextMenu` / `Shift+F10` | focus in trigger | 在触发区起始角展开菜单并把焦点落到首个可用条目 |
| `ArrowDown` | open, focus in content | 焦点移到下一个条目（禁用项跳过、尽头按 loop 回绕） |
| `ArrowUp` | open, focus in content | 焦点移到上一个条目（禁用项跳过、尽头按 loop 回绕） |
| `Home` | open, focus in content | 焦点移到首个可用条目 |
| `End` | open, focus in content | 焦点移到末个可用条目 |
| `单个可打印字符` | open, typeahead 未关 | 连打检索把焦点移到首字母匹配的条目，不选中它 |
| `Enter` / `Space` | focus in item, not disabled | 派发选中详情并关闭菜单，焦点归还触发区 |
| `Enter` / `Space` | held in item, not disabled | 按住期间该条目投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或菜单收起撤下 |
| `Escape` | open | 关闭菜单并把焦点归还触发区 |
| `Tab` / `Shift+Tab` | open | 关闭菜单，焦点不归还触发区，按 Tab 序列自然离开 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-haspopup` | 'menu' |
| `trigger` | `aria-keyshortcuts` | 'Shift+F10' |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-label` | props.translations.content |
| `content` | `role` | 'menu' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `role` | 'menuitem' |
| `item-indicator` | `aria-hidden` | 'true' |
| `separator` | `aria-orientation` | 'horizontal' |
| `separator` | `role` | 'separator' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |
| `arrow` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/context-menu.css` 使用 `[data-scope="context-menu"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `trigger` | `data-pressing` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-state` | 'open' \| 'closed' |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-highlighted` | ''（条件成立时才出现） |
| `item` | `data-pressed` | ''（条件成立时才出现） |
| `item` | `data-xh-collection-context` | 'overlay' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `item-text` | `data-disabled` | ''（条件成立时才出现） |
| `item-text` | `data-highlighted` | ''（条件成立时才出现） |
| `item-text` | `data-xh-collection-slot` | 'text' |
| `item-indicator` | `data-disabled` | ''（条件成立时才出现） |
| `item-indicator` | `data-highlighted` | ''（条件成立时才出现） |
| `item-indicator` | `data-xh-collection-slot` | 'prefix' |
| `item-description` | `data-disabled` | ''（条件成立时才出现） |
| `item-description` | `data-highlighted` | ''（条件成立时才出现） |
| `item-description` | `data-xh-collection-slot` | 'description' |
| `separator` | `data-xh-collection-separator` | '' |
| `arrow` | `data-placement` | 定位引擎算出的实际落位 |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-context-menu-arrow-size` | `arrow` | `--xh-_overlay-arrow-size` | `default` | `--xh-overlay-arrow-size` | context-menu 的 arrow 部件 --xh-_overlay-arrow-size 覆盖槽。 |
| `--xh-context-menu-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-backdrop` | context-menu 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-context-menu-border` | `arrow`<br>`content` | `border` | `default` | `--xh-material-frosted-border` | context-menu 的 arrow、content 部件 border 覆盖槽。 |
| `--xh-context-menu-content-bg` | `arrow`<br>`content` | `background` | `default` | `--xh-material-frosted-bg` | context-menu 的 arrow、content 部件 background 覆盖槽。 |
| `--xh-context-menu-content-fg` | `content` | `color` | `default` | `--xh-material-frosted-fg` | context-menu 的 content 部件 color 覆盖槽。 |
| `--xh-context-menu-content-gap` | `content` | `gap` | `default` | `--xh-list-option-gap` | context-menu 的 content 部件 gap 覆盖槽。 |
| `--xh-context-menu-content-px` | `content` | `padding-inline` | `default` | `--xh-surface-pad-xs` | context-menu 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-context-menu-content-py` | `content` | `padding-block` | `default` | `--xh-surface-pad-xs` | context-menu 的 content 部件 padding-block 覆盖槽。 |
| `--xh-context-menu-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` | context-menu 的 content 部件 border-radius 覆盖槽。 |
| `--xh-context-menu-content-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | context-menu 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-context-menu-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` | context-menu 的 group 部件 gap 覆盖槽。 |
| `--xh-context-menu-group-label-fg` | `group-label` | `color` | `default` | `--xh-material-frosted-fg-muted` | context-menu 的 group-label 部件 color 覆盖槽。 |
| `--xh-context-menu-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` | context-menu 的 group-label 部件 font-size 覆盖槽。 |
| `--xh-context-menu-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-medium` | context-menu 的 group-label 部件 font-weight 覆盖槽。 |
| `--xh-context-menu-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_context-menu-item-px` | context-menu 的 group-label 部件 padding-inline 覆盖槽。 |
| `--xh-context-menu-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` | context-menu 的 group-label 部件 padding-block 覆盖槽。 |
| `--xh-context-menu-highlight` | `content` | `background` | `default` | `--xh-material-frosted-highlight` | context-menu 的 content 部件 background 覆盖槽。 |
| `--xh-context-menu-icon-size` | `positioner`<br>`root` | `--xh-icon-size` | `is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | context-menu 的 positioner、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-context-menu-item-bg-active` | `item` | `background-color` | `in-path` | `--xh-bg-subtle` | context-menu 的 item 部件 background-color 覆盖槽。 |
| `--xh-context-menu-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])` | `--xh-bg-subtle` | context-menu 的 item 部件 background-color 覆盖槽。 |
| `--xh-context-menu-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-bg-subtle-hover` | context-menu 的 item 部件 background-color 覆盖槽。 |
| `--xh-context-menu-item-description-fg` | `item-description` | `color` | `default` | `--xh-material-frosted-fg-muted` | context-menu 的 item-description 部件 color 覆盖槽。 |
| `--xh-context-menu-item-description-font-size` | `item-description` | `font-size` | `default` | `--xh-text-caption-size` | context-menu 的 item-description 部件 font-size 覆盖槽。 |
| `--xh-context-menu-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`in-path`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-material-frosted-fg` | context-menu 的 item 部件 color 覆盖槽。 |
| `--xh-context-menu-item-font-size` | `item` | `font-size` | `default` | `--xh-_context-menu-font-size` | context-menu 的 item 部件 font-size 覆盖槽。 |
| `--xh-context-menu-item-gap` | `item` | `gap` | `default` | `--xh-_context-menu-item-gap` | context-menu 的 item 部件 gap 覆盖槽。 |
| `--xh-context-menu-item-indicator-fg` | `item-indicator` | `color` | `default` | `--xh-_tone` | context-menu 的 item-indicator 部件 color 覆盖槽。 |
| `--xh-context-menu-item-indicator-size` | `item-indicator` | `block-size`<br>`inline-size` | `default` | `--xh-icon-size` | context-menu 的 item-indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-context-menu-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` | context-menu 的 item 部件 line-height 覆盖槽。 |
| `--xh-context-menu-item-px` | `item` | `padding-inline` | `default` | `--xh-_context-menu-item-px` | context-menu 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-context-menu-item-py` | `item` | `padding-block` | `default` | `--xh-_context-menu-item-py` | context-menu 的 item 部件 padding-block 覆盖槽。 |
| `--xh-context-menu-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | context-menu 的 item 部件 border-radius 覆盖槽。 |
| `--xh-context-menu-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | context-menu 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-context-menu-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-menu-max-h` | context-menu 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-context-menu-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` | context-menu 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-context-menu-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-menu-min-w` | context-menu 的 content 部件 min-inline-size 覆盖槽。 |
| `--xh-context-menu-separator-color` | `separator` | `background` | `default` | `--xh-material-frosted-separator` | context-menu 的 separator 部件 background 覆盖槽。 |
| `--xh-context-menu-separator-my` | `separator` | `margin-block` | `default` | `--xh-space-0_5` | context-menu 的 separator 部件 margin-block 覆盖槽。 |
| `--xh-context-menu-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` | context-menu 的 separator 部件 border-radius 覆盖槽。 |
| `--xh-context-menu-separator-thickness` | `separator` | `block-size` | `default` | `--xh-stroke-thin` | context-menu 的 separator 部件 block-size 覆盖槽。 |
| `--xh-context-menu-submenu-indicator-fg` | `item` | `background-color` | `default` | `--xh-material-frosted-fg-muted` | context-menu 的 item 部件 background-color 覆盖槽。 |
| `--xh-context-menu-trigger-bg-pressing` | `trigger` | `background` | `pressing` | `--xh-bg-subtle` | context-menu 的 trigger 部件 background 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

共享关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`background` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
