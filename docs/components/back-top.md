# 回到顶部 <Badge type="info" text="back-top" />

导航组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

滚过 200px 按钮才露面，点它滚回顶部

<XhDemo src="back-top/01-basic" />

### 露面阈值

visibility-height 决定滚过多少像素按钮才出现

<XhDemo src="back-top/02-visibility-height" />

### 滚动方式

behavior=auto 一步跳回顶部，smooth 平滑滚过去

<XhDemo src="back-top/03-behavior" />

### 语气与尺寸

tone 决定按钮用哪族颜色，size 换一档尺寸；translations 换掉读屏念出的名字

<XhDemo src="back-top/04-tone-size" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-back-top>` |
| Vue 组件 | `XhBackTopRoot` `XhBackTopTrigger` |
| 组合式函数 | `useBackTop` |
| 状态机 | `backTopMachine` |
| 皮肤 | `@xihan-ui/styled/back-top.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="back-top"`：**`root`** · **`trigger`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `visibilityHeight` | `number` |  | 滚过这么多像素按钮才露面，默认 200。 |
| `behavior` | `BackTopBehavior` |  | 滚回顶部的方式，默认 smooth。 |
| `translations` | `Partial<BackTopTranslations>` |  |  |
| `tone` | `string` |  | 语气：brand / neutral / success / warning / danger / info，决定按钮用哪族颜色。 |
| `size` | `string` |  | 尺寸：sm / md / lg。 |
| `onVisibleChange` | `(details: BackTopVisibleChangeDetails) => void` |  | 露面与否变化时回调。 |

## 状态机

**状态**：`hidden` · `visible`

**事件**：`SCROLL.RESOLVE` · `TRIGGER.CLICK`

**判据**：`shouldShow` · `shouldHide`

## connect API

`useBackTop` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `visible` | `boolean` | 按钮此刻露不露面。 |
| `scrollToTop` | `() => void` | 程序化滚回顶部，与点按钮走同一条路。 |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 滚回顶部；按 behavior 决定是一步到位还是平滑滚过去 |
| `Tab` / `Shift+Tab` | trigger 露面时 | 走到按钮上；收起时整个 root 带 hidden，按钮不在 Tab 序列里 |
