# 抽屉 <Badge type="info" text="drawer" />

反馈与浮层组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

root 留在页面原地，content 被 portal 到 body；Escape 关闭、Tab 在面板里循环，展开期间页面滚不动

<XhDemo src="drawer/01-basic" />

### 贴边方向

side 只落成 data-side，面板压在哪条边由皮肤按这个值决定；root 与 content 报的是同一条边

<XhDemo src="drawer/02-side" />

### 受控

传了 open 就由宿主说了算；Escape、点面板外、按叉都只回写 open，不自己改状态

<XhDemo src="drawer/03-controlled" />

### 尺寸

size 落成 content 的 data-size，只改面板贴边方向上的厚度；三档各自一个抽屉，点开才看得出厚薄

<XhDemo src="drawer/04-size" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-drawer>` |
| Vue 组件 | `XhDrawerCloseTrigger` `XhDrawerContent` `XhDrawerDescription` `XhDrawerRoot` `XhDrawerTitle` `XhDrawerTrigger` |
| 组合式函数 | `useDrawer` |
| 状态机 | `drawerMachine` |
| 皮肤 | `@xihan-ui/styled/drawer.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="drawer"`：**`root`** · `trigger` · `backdrop` · `positioner` · **`content`** · `title` · `description` · `close-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `modal` | `boolean` |  |  |
| `side` | `DrawerSide` |  | 从哪条边滑出，默认 'right'。只影响输出的 data-side，不参与状态转移。 |
| `role` | `'dialog' | 'alertdialog'` |  |  |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  |  |
| `restoreFocus` | `boolean` |  |  |
| `size` | `string` |  | 尺寸：sm / md / lg。横放时换面板宽度、竖放时换面板高度，随 side 而定。 |
| `translations` | `Partial<DrawerTranslations>` |  |  |
| `onOpenChange` | `(details: DrawerOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

## 状态机

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

## connect API

`useDrawer` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `side` | `DrawerSide` | 已解析的滑出边（prop 缺省时是默认值），作者据此配动画。 |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getBackdropProps` | `() => T['element']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getCloseTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 打开抽屉并把焦点移入 content |
| `Escape` | open | 关闭并把焦点还给 trigger |
| `Tab` | open 且 modal | 在 content 内向后循环焦点 |
| `Shift+Tab` | open 且 modal | 在 content 内向前循环焦点 |
