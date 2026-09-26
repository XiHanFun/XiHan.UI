# Marquee 跑马灯

内容沿一条轴循环滚动。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/marquee" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/marquee.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/marquee" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/marquee" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/marquee.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

窗口只显示一段，轨道在其中向左滚动；滚动整段在皮肤的 @keyframes 中，使用者不写动画

<XhDemo src="marquee/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="marquee"`：**`root`** · **`content`**

## 示例

### 方向

四档：左右沿横轴，上下沿纵轴。轴另写为 data-orientation，竖向滚动的窗口依靠 --xh-marquee-block-size 定高

<XhDemo src="marquee/02-direction" />

### 重复铺满

autoFill 在轨道中铺设两份内容，滚完一份时第二份正好位于起点，看不出接缝；不开启则整段滚完再回到起点

<XhDemo src="marquee/03-auto-fill" />

### 速度与暂停

speed 是每秒像素；pauseOnHover 在指针停下或焦点落进窗口时暂停

<XhDemo src="marquee/04-speed-and-pause" />

## 设计指引

### 何时使用

- 公告条、合作方 logo 墙等内容多、位置窄且不要求逐条读完的展示。

### 何时不用

- 内容重要且必须被读到：滚动文字阅读费力，且会滚走。
- 需要用户处理的通知使用[警告提示](./alert)。

### 特性

- `autoFill` 自动重复内容铺满容器，接缝处不留空。
- `direction` 切换方向，`speed` 调整速度；速度按 `--xh-marquee-span` 换算为一圈时长，需要精确对应每秒像素数时把该槽改为内容的真实长度。
- `pauseOnHover` 悬停暂停，`paused` 由作者控制，受控状态优先于悬停。

### 组合

- 内部放[图片](./image)组成 logo 墙，或[徽标](./badge)组成标签流。

### 最佳实践

- 必须可以暂停，悬停暂停是最低要求。
- 系统开启减弱动效时应停止。

### 反模式

- 用它承载唯一的重要信息（故障公告、截止时间）。
- 速度过快，无法读完一句话。

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
| `autoFill` | `boolean` |  | 内容不足时重复铺满：轨道中铺两份内容，走完一份正好接上第二份。 |
| `direction` | `MarqueeDirection` |  | 滚动方向，默认 left。 |
| `paused` | `boolean` |  | 受控暂停：为真即停在当前位置，为假继续移动。优先于 pauseOnHover。 |
| `pauseOnHover` | `boolean` |  | 指针停在窗口上时暂停；键盘焦点落进窗口时同样暂停。 |
| `speed` | `number` |  | 名义上的每秒像素数。写为根上的内联变量，皮肤用一份内容的长度除以它换算为一圈的时长。 该长度取自 `--xh-marquee-span`：CSS 无法读取布局尺寸，槽中存放的是一个默认值。 把它修改为与内容真实长度一致时速度才逐字等于每秒该像素数，否则它是一个成比例的快慢档。 只接受有限正数；其余值不写出，回退为皮肤默认值。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `copies` | `number` | 轨道中铺设的内容份数：autoFill 开启为 2，关闭为 1。 |
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

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-marquee-block-size` | `root` | `block-size` | `orientation=vertical` | `10rem` | marquee 的 root 部件 block-size 覆盖槽。 |
| `--xh-marquee-gap` | `content`<br>`root` | `padding-block-end`<br>`padding-inline-end` | `orientation=vertical`<br>`xh-copy` | `--xh-space-6` | marquee 的 content、root 部件 padding-block-end、padding-inline-end 覆盖槽。 |
| `--xh-marquee-span` | `content`<br>`root` | `animation-duration` | `auto-fill`<br>`default` | `600` | marquee 的 content、root 部件 animation-duration 覆盖槽。 |
| `--xh-marquee-speed` | `content`<br>`root` | `animation-duration` | `auto-fill`<br>`default` | `60` | marquee 的 content、root 部件 animation-duration 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

可覆盖的动效槽：`--xh-marquee-span` · `--xh-marquee-speed`。

关键帧 `xh-marquee-x` · `xh-marquee-y` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### 响应式

皮肤另按输入能力分档：`hover: hover`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
