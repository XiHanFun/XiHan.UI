# 栅格 <Badge type="info" text="grid" />

布局组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

二维排布容器：cols 定分几列，gap 走间距档位，每一格按文档序依次落格

<XhDemo src="grid/01-basic" />

### 列数

cols 收 1 到 12 的整数；各列等宽，放不下的格子自动换到下一行

<XhDemo src="grid/02-cols" />

### 间距档位

gap 收的是档位名不是像素：xs / sm / md / lg / xl 逐档指向一个间距令牌，行距与列距同吃这一份

<XhDemo src="grid/03-gap" />

### 跨列与错列

span 让一格横跨几列；offset 让一格改从第 offset + 1 条列线起排，把它前面那几列空出来

<XhDemo src="grid/04-span-offset" />

### 格内对齐

align 管每一项在自己那格里的块向落点，justify 管行内落点；两轴缺省都是铺满整格

<XhDemo src="grid/05-align-justify" />

### 响应式列数

cols 除了整数也收断点对象，逐档写各自的列数：窄视口一列，越宽排得越密，拖动窗口即可看到换档

<XhDemo src="grid/06-responsive-cols" />

### 断点档位一览

四档断点取自令牌：sm 640px、md 768px、lg 1024px、xl 1280px；自窄到宽依次接管，视口到哪一档就用哪一档的列数

<XhDemo src="grid/07-breakpoints" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-grid>` |
| Vue 组件 | `XhGridItem` `XhGridRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/grid.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="grid"`：**`root`** · `item`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `align` | `GridAlign` |  | 每一项在自己那格里的块向对齐：start / center / end / stretch / baseline，不写则铺满格高。 |
| `cols` | `GridCols` |  | 列数：1 至 12 的整数，不写按一列排。各列等宽，且每列的下限是 0，长内容不会把自己那列撑宽。 也收断点对象 `{ base, sm, md, lg, xl }`，逐档写各自的列数，没写的档沿用比它窄的那一档。 |
| `gap` | `GridGap` |  | 行列间距档位：xs / sm / md / lg / xl，不写则不留间距。档位换算成多少由皮肤定。 |
| `justify` | `GridJustify` |  | 每一项在自己那格里的行内对齐：start / center / end / stretch，不写则铺满格宽。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(props?: GridItemProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。
