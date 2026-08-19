# 按钮 <Badge type="info" text="button" />

通用组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

按钮文字直接写在内容里

<XhDemo src="button/01-basic" />

### 变体

variant 只改皮肤的几个颜色槽位，行为完全一致

<XhDemo src="button/02-variant" />

### 尺寸

不传 size 即默认档

<XhDemo src="button/03-size" />

### 禁用与载入

loading 会挡住点击，并给 indicator 部件挂上旋转动画

<XhDemo src="button/04-state" />

### 语气

tone 决定用哪族颜色，与 variant 正交：四种形态 × 六种语气都成立

<XhDemo src="button/05-tone" />

### 图标与文字

图元放进 prefix 或 suffix 部件，文字放进 label；两个图元部件自带 aria-hidden，读屏念到的只有 label

<XhDemo src="button/06-icon" />

### 点击事件

处理器照常挂在组件上；载入态与禁用态的点击在根上就被拦下，作者挂的处理器也收不到

<XhDemo src="button/07-click" />

### 形状与图标按钮

圆角是一个组件令牌；只放一枚图元时把左右内边距收成 0、宽度取控件档位，名字这时只能由 aria-label 给

<XhDemo src="button/08-shape" />

### 自定义配色

不写 variant 时底色与文字色取自组件令牌，逐个实例覆盖就能用上语气表以外的颜色

<XhDemo src="button/09-custom-color" />

### 按钮组

相邻两段共用一条边，圆角只留在两端；档位与形状写在容器上，靠自定义属性流给组内每一段

<XhDemo src="button/10-group" />

### 渲染成链接

皮肤认的是 data-scope 与 data-part 这组契约，不是标签名：把契约铺到链接元素上就得到导航型按钮，跳转仍由浏览器原生完成

<XhDemo src="button/11-as-link" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-button>` |
| Vue 组件 | `XhButton` `XhButtonIndicator` `XhButtonLabel` `XhButtonPrefix` `XhButtonSuffix` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/button.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="button"`：**`root`** · `label` · `indicator` · `prefix` · `suffix`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `disabled` | `boolean` |  |  |
| `fullWidth` | `boolean` |  | 撑满行宽：表单末尾的提交按钮与移动端常用。 |
| `iconOnly` | `boolean` |  | 只有图标：左右内距清零、宽高相等。宽度跟着当前尺寸档的高度走， 不必把档位写进行内样式。图标按钮没有可见文字，作者须自行给可及名。 |
| `loading` | `boolean` |  | 加载态：用 aria-disabled + 拦截事件表达，保留焦点。 |
| `size` | `Size` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 |
| `type` | `'button' \| 'submit' \| 'reset'` |  |  |
| `variant` | `ActionVariant` |  | 形态：solid / subtle / outline / ghost，决定颜色怎么用 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `disabled` | `boolean` |  |
| `loading` | `boolean` |  |
| `getRootProps` | `() => T['button']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getPrefixProps` | `() => T['element']` |  |
| `getSuffixProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in root, interactive | 激活按钮（原生行为） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-button-bg` · `--xh-button-bg-active` · `--xh-button-bg-hover` · `--xh-button-fg` · `--xh-button-font-size` · `--xh-button-font-weight` · `--xh-button-gap` · `--xh-button-h` · `--xh-button-icon-size` · `--xh-button-px` · `--xh-button-radius` · `--xh-button-spin-duration`
