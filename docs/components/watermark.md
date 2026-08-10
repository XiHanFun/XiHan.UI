# 水印 <Badge type="info" text="watermark" />

布局组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

印子是一张按文字算出来的 SVG，铺在根的伪元素上；底下的内容照常点、照常选

<XhDemo src="watermark/01-basic" />

### 多行

text 给数组就是多行，图样跟着长高；空白行不占位

<XhDemo src="watermark/02-multi-line" />

### 角度、疏密与深浅

rotate 转整块图样，gap 决定两块之间留多少空白，fontSize 与 opacity 决定字多大、印多深

<XhDemo src="watermark/03-appearance" />

### 撤掉与换色

文字空了就落 data-state="empty"，整层不画；印子的颜色走 --xh-watermark-fg，深浅主题各自跟着走

<XhDemo src="watermark/04-empty-and-color" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-watermark>` |
| Vue 组件 | `XhWatermarkContent` `XhWatermarkRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styled/watermark.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="watermark"`：**`root`** · `content`

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `lines` | `readonly string[]` | 归一化后的文字行；没有可印的文字时是空数组。 |
| `tile` | `WatermarkTile` | 图样尺寸，即平铺步距；没有图样时宽高都是 0。 |
| `image` | `string` | 图样的 data URI；没有图样时是空串。 |
| `state` | `WatermarkState` |  |
| `getRootProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。
