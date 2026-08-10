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

库不带插画资产，图标槽收任意内容：字形、XhIcon、手写的内联 svg 都行

<XhDemo src="result/05-icon" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-result>` |
| Vue 组件 | `XhResultAction` `XhResultDescription` `XhResultIcon` `XhResultRoot` `XhResultTitle` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styled/result.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="result"`：**`root`** · `icon` · `title` · `description` · `action`

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
