# 跑马灯 <Badge type="info" text="marquee" />

布局组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

窗口只露出一段，轨道在里面往左走；滚动整段在皮肤的 @keyframes 里，用的人不写动画

<XhDemo src="marquee/01-basic" />

### 方向

四档：左右走横轴，上下走纵轴。轴另落成 data-orientation，竖着滚的窗口靠 --xh-marquee-block-size 定高

<XhDemo src="marquee/02-direction" />

### 重复铺满

autoFill 在轨道里铺两份内容，走完一份第二份正好压在起点上，看不出接缝；不开则整段走完再回来

<XhDemo src="marquee/03-auto-fill" />

### 速度与暂停

speed 是每秒像素；pauseOnHover 在指针停下或焦点落进窗口时停住

<XhDemo src="marquee/04-speed-and-pause" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-marquee>` |
| Vue 组件 | `XhMarqueeContent` `XhMarqueeRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/marquee.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="marquee"`：**`root`** · **`content`**

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `copies` | `number` | 轨道里要铺几份内容：autoFill 开是 2，关是 1。 |
| `getRootProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。
