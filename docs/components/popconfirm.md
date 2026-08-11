# 弹出确认 <Badge type="info" text="popconfirm" />

反馈与浮层组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

点触发器就地问一句，确认与取消都收起浮层；展开时焦点先落在取消上

<XhDemo src="popconfirm/01-basic" />

### 放置位

placement 是首选位，位置不够时引擎自己避让，实际落点写在 data-placement 上

<XhDemo src="popconfirm/02-placement" />

### 尺寸

size 换的是面板的内边距与最大宽度，三个档位落在 content 上

<XhDemo src="popconfirm/03-size" />

### 语气

在 content 上写 data-tone，确认按钮跟着换色；语气是共享的一层，不是本组件的 prop

<XhDemo src="popconfirm/04-tone" />

### 受控与异步确认

传了 open 就由宿主说了算：确认先跑提交，跑完才写回收起

<XhDemo src="popconfirm/05-async-confirm" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-popconfirm>` |
| Vue 组件 | `XhPopconfirmCancelTrigger` `XhPopconfirmConfirmTrigger` `XhPopconfirmContent` `XhPopconfirmDescription` `XhPopconfirmPositioner` `XhPopconfirmRoot` `XhPopconfirmTitle` `XhPopconfirmTrigger` |
| 组合式函数 | `usePopconfirm` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/popconfirm.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="popconfirm"`：**`root`** · **`trigger`** · `positioner` · **`content`** · `title` · `description` · **`confirm-trigger`** · **`cancel-trigger`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `offset` | `number` |  |  |
| `onCancel` | `() => void` |  | 点了取消按钮，随后浮层收起。Escape 与层外交互只发 onOpenChange，不发这条。 |
| `onConfirm` | `() => void` |  | 点了确认按钮，随后浮层收起。 |
| `onOpenChange` | `(details: PopoverOpenChangeDetails) => void` |  | open 变化意图；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `open` | `boolean` |  |  |
| `placement` | `Placement` |  |  |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定面板的内边距档位。 |

## connect API

`usePopconfirm` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `confirm` | `() => void` | 发确认意图并请求收起。 |
| `cancel` | `() => void` | 发取消意图并请求收起。 |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getConfirmTriggerProps` | `() => T['button']` |  |
| `getCancelTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 切换开合，展开时把焦点移入 content |
| `Enter` / `Space` | focus in confirm-trigger | 发确认意图并收起浮层 |
| `Enter` / `Space` | focus in cancel-trigger | 发取消意图并收起浮层 |
| `Escape` | open | 收起浮层并把焦点还给 trigger；不发确认也不发取消 |
