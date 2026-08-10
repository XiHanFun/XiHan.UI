# 对话框 <Badge type="info" text="dialog" />

反馈与浮层组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

不传 open 即为非受控；内容被 portal 到 body，Esc 或点遮罩关闭，关闭后焦点回到触发按钮

<XhDemo src="dialog/01-basic" />

### 受控

传了 open 就由宿主说了算，组件自己不再改状态；Esc、点遮罩、按叉都只回写 open

<XhDemo src="dialog/02-controlled" />

### 警示对话框

role=alertdialog 交给读屏更强的语气；关掉 Esc 与点遮罩后，只剩里面这两颗按钮能走出去

<XhDemo src="dialog/03-alert" />

### 尺寸

size 落成 content 的 data-size，只改面板的最大宽度；三档各自一个对话框，点开才看得出宽窄

<XhDemo src="dialog/04-size" />

### 内容滚动

标题与底部操作留在原处，只有中间那块长文在自己的框里滚

<XhDemo src="dialog/05-scroll" />

### 异步确认

提交期间按钮转圈，Esc 与点遮罩这两条出口一并封住，落定之后才把 open 写回 false

<XhDemo src="dialog/06-async" />

### 命令式确认框

一次函数调用把描述符推进表里并展开对话框；拿回的对象随后可改标题、正文与按钮状态，表里就是当前所有实例

<XhDemo src="dialog/07-imperative" />

### 拖动标题栏挪窗口

指针按在标题上，顺着 DOM 找到 content 部件，把累计位移写进它的 translate；入场动画走的是 transform，两者互不覆盖

<XhDemo src="dialog/08-draggable" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-dialog>` |
| Vue 组件 | `XhDialogCloseTrigger` `XhDialogContent` `XhDialogDescription` `XhDialogRoot` `XhDialogTitle` `XhDialogTrigger` |
| 组合式函数 | `useDialog` |
| 状态机 | `dialogMachine` |
| 皮肤 | `@xihan-ui/styles/dialog.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="dialog"`：`trigger` · `backdrop` · `positioner` · **`content`** · `title` · `description` · `close-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `modal` | `boolean` |  |  |
| `role` | `'dialog' \| 'alertdialog'` |  |  |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  |  |
| `restoreFocus` | `boolean` |  |  |
| `size` | `Size` |  | 尺寸：sm / md / lg。只换 content 的最大宽度，落在 content 上（本组件没有 root 部件）。 |
| `translations` | `Partial<DialogTranslations>` |  |  |
| `onOpenChange` | `(details: DialogOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

## 状态机

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

## connect API

`useDialog` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
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
| `Enter` / `Space` | focus in trigger | 打开对话框并把焦点移入 content |
| `Escape` | open | 关闭并把焦点还给 trigger |
| `Tab` | open | 在 content 内向后循环焦点 |
| `Shift+Tab` | open | 在 content 内向前循环焦点 |
