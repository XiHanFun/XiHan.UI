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

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-dialog>` |
| Vue 组件 | `XhDialogCloseTrigger` `XhDialogContent` `XhDialogDescription` `XhDialogRoot` `XhDialogTitle` `XhDialogTrigger` |
| 组合式函数 | `useDialog` |
| 状态机 | `dialogMachine` |
| 皮肤 | `@xihan-ui/styled/dialog.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="dialog"`：`trigger` · `backdrop` · `positioner` · **`content`** · `title` · `description` · `close-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `modal` | `boolean` |  |  |
| `role` | `'dialog' | 'alertdialog'` |  |  |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  |  |
| `restoreFocus` | `boolean` |  |  |
| `size` | `string` |  | 尺寸：sm / md / lg。只换 content 的最大宽度，落在 content 上（本组件没有 root 部件）。 |
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
