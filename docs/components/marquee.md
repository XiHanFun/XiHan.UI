# Marquee <Badge type="info" text="跑马灯" />

内容沿一条轴循环滚动。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/marquee" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/marquee.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/marquee" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/marquee" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/marquee.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

窗口只露出一段，轨道在里面往左走；滚动整段在皮肤的 @keyframes 里，用的人不写动画

<XhDemo src="marquee/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="marquee"`：**`root`** · **`content`**

## 示例

### 方向

四档：左右走横轴，上下走纵轴。轴另落成 data-orientation，竖着滚的窗口靠 --xh-marquee-block-size 定高

<XhDemo src="marquee/02-direction" />

### 重复铺满

autoFill 在轨道里铺两份内容，走完一份第二份正好压在起点上，看不出接缝；不开则整段走完再回来

<XhDemo src="marquee/03-auto-fill" />

### 速度与暂停

speed 是每秒像素；pauseOnHover 在指针停下或焦点落进窗口时停住

<XhDemo src="marquee/04-speed-and-pause" />

## 设计指引

### 何时使用

- 公告条、合作方 logo 墙这类"内容多、位置窄、且不要求逐条读完"的展示。

### 何时不用

- 内容重要且必须读到：滚动的文字读起来很费力，且会滚走。
- 是一条需要用户处理的通知：用[警告提示](./alert)。

### 特性

- `autoFill` 自动重复内容铺满容器，接缝处不留空。
- `direction` 换方向，`speed` 调速度；速度按 `--xh-marquee-span` 换算成一圈时长，要逐字对上每秒像素数就把这支槽改到内容的真实长度。
- `pauseOnHover` 悬停暂停，`paused` 由作者说了算——受控那一档比悬停优先。

### 组合

- 里面放[图片](./image)做 logo 墙，或[徽标](./badge)做标签流。

### 最佳实践

- 一定要能暂停：悬停暂停是最低要求。
- 系统开启减弱动效时应当停下来。

### 反模式

- 用它承载唯一的重要信息（故障公告、截止时间）。
- 速度快到读不完一句话。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-marquee>` |
| Vue 组件 | `XhMarqueeContent` `XhMarqueeRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/marquee.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `autoFill` | `boolean` |  | 内容不足时重复铺满：轨道里铺两份内容，走完一份正好接上第二份。 |
| `direction` | `MarqueeDirection` |  | 滚动方向，缺省 left。 |
| `paused` | `boolean` |  | 受控暂停：翻真即停在当前位置，翻假接着走。比 pauseOnHover 优先。 |
| `pauseOnHover` | `boolean` |  | 指针停在窗口上时暂停；键盘焦点落进窗口时同样暂停。 |
| `speed` | `number` |  | 名义上的每秒像素数。写成根上的内联变量，皮肤拿一份内容的长度除以它换成一圈的时长。 那个长度取的是 `--xh-marquee-span`——CSS 读不到布局尺寸，槽里放的是一个缺省值。 把它改到与内容真实长度一致时速度才逐字等于每秒这么多像素，否则它是一个成比例的快慢档。 只收有限正数；其余值不写出，退回皮肤缺省。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `copies` | `number` | 轨道里要铺几份内容：autoFill 开是 2，关是 1。 |
| `getRootProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/marquee.css` 使用 `[data-scope="marquee"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-marquee-block-size` | `root` | `block-size` | `orientation=vertical` | `10rem` | marquee 的 root 部件 block-size 覆盖槽。 |
| `--xh-marquee-gap` | `content`<br>`root` | `padding-block-end`<br>`padding-inline-end` | `orientation=vertical`<br>`xh-copy` | `--xh-space-6` | marquee 的 content、root 部件 padding-block-end、padding-inline-end 覆盖槽。 |
| `--xh-marquee-span` | `content`<br>`root` | `animation-duration` | `auto-fill`<br>`default` | `600` | marquee 的 content、root 部件 animation-duration 覆盖槽。 |
| `--xh-marquee-speed` | `content`<br>`root` | `animation-duration` | `auto-fill`<br>`default` | `60` | marquee 的 content、root 部件 animation-duration 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-marquee-x` · `xh-marquee-y` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### 响应式

皮肤另按输入能力分档：`hover: hover`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
