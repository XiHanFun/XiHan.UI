# 页头 <Badge type="info" text="page-header" />

导航组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

除了 root，返回位、副标题、操作、页脚都可选；只写用得上的那几段

<XhDemo src="page-header/01-basic" />

### 返回位

返回位就是作者自己的按钮：组件只给身份与位置，type、可及名字与点击行为自己写

<XhDemo src="page-header/02-back" />

### 行尾操作

extra 贴在整行的末尾，里面放什么按钮由作者决定

<XhDemo src="page-header/03-extra" />

### 尺寸

size 换的是标题字号与整块的上下留白，不传 size 即默认档

<XhDemo src="page-header/04-size" />

### 分隔线与页脚

bordered 在底部画一条线，footer 整行另起，装描述或一组摘要

<XhDemo src="page-header/05-bordered-footer" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-page-header>` |
| Vue 组件 | `XhPageHeaderBackTrigger` `XhPageHeaderExtra` `XhPageHeaderFooter` `XhPageHeaderRoot` `XhPageHeaderSubtitle` `XhPageHeaderTitle` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styled/page-header.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="page-header"`：**`root`** · `back-trigger` · `title` · `subtitle` · `extra` · `footer`

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getBackTriggerProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getSubtitleProps` | `() => T['element']` |  |
| `getExtraProps` | `() => T['element']` |  |
| `getFooterProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。
