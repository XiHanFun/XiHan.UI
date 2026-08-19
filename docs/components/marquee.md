# 跑马灯 <Badge type="info" text="marquee" />

内容沿一条轴循环滚动。

## 何时使用

- 公告条、合作方 logo 墙这类"内容多、位置窄、且不要求逐条读完"的展示。

## 何时不用

- 内容重要且必须读到：滚动的文字读起来很费力，且会滚走。
- 是一条需要用户处理的通知：用[警告提示](./alert)。

## 特性

- `autoFill` 自动重复内容铺满容器，接缝处不留空。
- `direction` 换方向，`speed` 调速度。
- `pauseOnHover` 悬停暂停。

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

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `autoFill` | `boolean` |  | 内容不足时重复铺满：轨道里铺两份内容，走完一份正好接上第二份。 |
| `direction` | `MarqueeDirection` |  | 滚动方向，缺省 left。 |
| `pauseOnHover` | `boolean` |  | 指针停在窗口上时暂停；键盘焦点落进窗口时同样暂停。 |
| `speed` | `number` |  | 每秒滚过的像素数。写成根上的内联变量，皮肤拿一份内容的长度除以它换成一圈的时长。 只收有限正数；其余值不写出，退回皮肤缺省。 |

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

## 样式

默认皮肤 `@xihan-ui/styles/marquee.css` 按部件选择：`[data-scope="marquee"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-marquee-block-size` · `--xh-marquee-gap` · `--xh-marquee-span` · `--xh-marquee-speed`

## 动效

关键帧 `xh-marquee-x` · `xh-marquee-y` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## 响应式

皮肤内置条件规则：`hover: hover`。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 里面放[图片](./image)做 logo 墙，或[徽标](./badge)做标签流。

## 最佳实践

- 一定要能暂停：悬停暂停是最低要求。
- 系统开启减弱动效时应当停下来。

## 反模式

- 用它承载唯一的重要信息（故障公告、截止时间）。
- 速度快到读不完一句话。
