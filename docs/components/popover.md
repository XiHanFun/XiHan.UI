# 气泡卡片 <Badge type="info" text="popover" />

反馈与浮层组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

点击展开，Escape 或点外部关闭；positioner 负责摆位，content 才是浮层本体

<XhDemo src="popover/01-basic" />

### 朝向与间距

placement 是请求值，空间不够时定位引擎会自动翻面；offset 调的是浮层与触发器的距离

<XhDemo src="popover/02-placement" />

### 受控

传了 open 就由宿主说了算；这里额外关掉点外部关闭，只有按钮与 Escape 能收起

<XhDemo src="popover/03-controlled" />

### 尺寸

三档换的是浮层的内边距与字号，不写 size 即缺省档；逐个点开触发器看差别

<XhDemo src="popover/04-size" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-popover>` |
| Vue 组件 | `XhPopoverArrow` `XhPopoverCloseTrigger` `XhPopoverContent` `XhPopoverDescription` `XhPopoverPositioner` `XhPopoverRoot` `XhPopoverTitle` `XhPopoverTrigger` |
| 组合式函数 | `usePopover` |
| 状态机 | `popoverMachine` |
| 皮肤 | `@xihan-ui/styled/popover.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="popover"`：**`trigger`** · `positioner` · **`content`** · `title` · `description` · `close-trigger` · `arrow`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `placement` | `Placement` |  |  |
| `offset` | `number` |  |  |
| `modal` | `boolean` |  | 模态浮层陷住焦点；默认 false（非模态，Tab 可离开）。 |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  |  |
| `translations` | `Partial<PopoverTranslations>` |  |  |
| `size` | `string` |  | 尺寸：sm / md / lg，决定面板的内边距档位。 |
| `onOpenChange` | `(details: PopoverOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

## 状态机

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

## connect API

`usePopover` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getCloseTriggerProps` | `() => T['button']` |  |
| `getArrowProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 切换开合，展开时把焦点移入 content |
| `Escape` | open | 关闭并把焦点还给 trigger |
| `Tab` | open 且 modal | 在 content 内向后循环焦点 |
| `Shift+Tab` | open 且 modal | 在 content 内向前循环焦点 |
