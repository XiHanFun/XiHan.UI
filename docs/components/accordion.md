# 手风琴 <Badge type="info" text="accordion" />

数据展示组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-accordion>` |
| Vue 组件 | `XhAccordionContent` `XhAccordionHeader` `XhAccordionIndicator` `XhAccordionItem` `XhAccordionRoot` `XhAccordionTrigger` |
| 组合式函数 | `useAccordion` |
| 状态机 | `accordionMachine` |
| 皮肤 | `@xihan-ui/styled/accordion.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="accordion"`：`root` · `item` · `header` · **`trigger`** · **`content`** · `indicator`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string[]` |  | 展开集合，给定即受控。 |
| `defaultValue` | `string[]` |  |  |
| `multiple` | `boolean` |  | 允许多项同时展开；false 时展开一项即收起其余。 |
| `collapsible` | `boolean` |  | 允许把最后一个展开项收起，默认 false。 |
| `orientation` | `Orientation` |  | 方向键轴向，默认 vertical。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；影响水平轴上 ArrowLeft/ArrowRight 的语义。 |
| `onValueChange` | `(details: AccordionValueChangeDetails) => void` |  | 展开集合变化回调。 |

## 状态机

**状态**：`idle`

**事件**：`ITEM.TOGGLE` · `VALUE.SET`

## connect API

`useAccordion` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` | 当前展开集合，单开模式下长度 ≤ 1。 |
| `setValue` | `(next: string[]) => void` |  |
| `isOpen` | `(value: string) => boolean` |  |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(props: AccordionItemProps) => T['element']` |  |
| `getHeaderProps` | `(props: AccordionItemProps) => T['element']` |  |
| `getTriggerProps` | `(props: AccordionItemProps) => T['button']` |  |
| `getContentProps` | `(props: AccordionItemProps) => T['element']` |  |
| `getIndicatorProps` | `(props: AccordionItemProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in trigger, not disabled | 展开/收起该条目的 content |
| `ArrowDown` / `ArrowRight` | focus in trigger, 按键与 orientation 同轴（dir=rtl 时左右键语义互换） | 焦点移到下一个 trigger，末条不回绕 |
| `ArrowUp` / `ArrowLeft` | focus in trigger, 按键与 orientation 同轴（dir=rtl 时左右键语义互换） | 焦点移到上一个 trigger，首条不回绕 |
| `Home` | focus in trigger | 焦点移到首个 trigger |
| `End` | focus in trigger | 焦点移到末个 trigger |
| `Tab` / `Shift+Tab` | focus in trigger | 按文档序进出：每个 trigger 都是独立 Tab 停靠点，无 roving tabindex |
