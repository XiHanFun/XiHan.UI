# 结果页 <Badge type="info" text="result" />

数据展示组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

图标、标题、说明、操作四段按需摆，只有 root 必须写

<XhDemo src="result/01-basic" />

### 结果类型

status 只落成 data-status，皮肤据它给图标区上语气色；画什么图标仍由作者塞

<XhDemo src="result/02-status" />

### 状态码页

404 / 403 / 500 三档各并进一族语气色，操作槽里放这一页的回退出口

<XhDemo src="result/03-http" />

### 尺寸

size 换的是留白、图标框与标题字号，不传 size 即默认档

<XhDemo src="result/04-size" />

### 图标由作者塞

库不带插画资产，图标位收任意内容：字形、图标组件、手写的内联 svg 都行

<XhDemo src="result/05-icon" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-result>` |
| Vue 组件 | `XhResultAction` `XhResultDescription` `XhResultIcon` `XhResultRoot` `XhResultTitle` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/result.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="result"`：**`root`** · `icon` · `title` · `description` · `action`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `size` | `Size` |  | 尺寸档位，只改留白与字号，不改语义。 |
| `status` | `ResultStatus` |  | 结果类型，只落成 root 的 data-status；图标画什么由作者塞进图标槽。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getIconProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getActionProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-result-action-gap` · `--xh-result-description-fg` · `--xh-result-description-font-size` · `--xh-result-description-leading` · `--xh-result-description-max-w` · `--xh-result-fg` · `--xh-result-gap` · `--xh-result-icon-fg` · `--xh-result-icon-font-size` · `--xh-result-icon-size` · `--xh-result-px` · `--xh-result-py` · `--xh-result-title-fg` · `--xh-result-title-font-size` · `--xh-result-title-font-weight` · `--xh-result-title-leading`
