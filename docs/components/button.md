# 按钮 <Badge type="info" text="button" />

触发一次动作的最小控件：按下去就发生一件事。它不承载值，也不表达持续的开关态。

## 何时使用

- 提交表单、执行一次命令、打开浮层。
- 一屏里有多个动作、需要把主次排出来：形态（variant）与语气（tone）是两条正交的轴，四种形态 × 六种语气都成立。
- 只放一枚图元的紧凑动作，用 `iconOnly` 收成正方形。

## 何时不用

- 跳到另一个地址：那是链接。浏览器的中键新开、右键菜单与预读只对 `<a>` 生效，写成按钮加跳转全都拿不到。要的是链接外观加按钮质感时，把 `data-scope` / `data-part` 这组契约铺到 `<a>` 上，皮肤照样认。
- 开关一个持续状态：用[切换按钮](./toggle)，它有 `aria-pressed`。
- 在几个互斥项里选一个：用[切换按钮组](./toggle-group)或[单选组](./radio-group)。

## 特性

- 形态 · 语气 · 尺寸三轴正交，任意组合都成立。
- 载入态用 `aria-disabled` 加事件拦截表达，按钮仍能聚焦，读屏也仍念得到名字。
- `prefix` / `suffix` 两个图元部件自带 `aria-hidden`，读屏念到的只有 `label`。
- 皮肤认的是 `data-scope` 与 `data-part`，不是标签名。

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
| `ariaLabel` | `string` |  | 作者写在根节点上的可及名（aria-label / aria-labelledby）。 宿主只把它们转告连接层，用来判断图标按钮有没有名字；属性本身仍由宿主写进根节点。 |
| `ariaLabelledby` | `string` |  |  |
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

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `root` | `aria-disabled` | 'true' \| undefined |
| `indicator` | `aria-hidden` | 'true' |
| `prefix` | `aria-hidden` | 'true' |
| `suffix` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/button.css` 按部件选择：`[data-scope="button"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-full-width` | ''（条件成立时才出现） |
| `root` | `data-icon-only` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-button-bg` · `--xh-button-bg-active` · `--xh-button-bg-hover` · `--xh-button-fg` · `--xh-button-font-size` · `--xh-button-font-weight` · `--xh-button-gap` · `--xh-button-h` · `--xh-button-icon-size` · `--xh-button-px` · `--xh-button-radius` · `--xh-button-shadow` · `--xh-button-spin-duration`

## 动效

关键帧 `xh-spin` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 连排成一条：外面套[按钮组](./button-group)，档位与形态写在容器上，组内每一段自己不重复标注。
- 图元用 [图标](./icon)，放进 `prefix` 或 `suffix`。
- 需要二次确认的危险动作：外面套[弹出确认](./popconfirm)。

## 最佳实践

- 只放图标时必须给 `aria-label`——按钮此时没有任何可见文字，名字只能由它来给。
- 一个视图里 `solid` + `brand` 只留一个，主动作唯一才排得出主次。
- 载入期间保留原有宽度，别让指示器把按钮撑窄或撑宽，指针会跟着跑掉。

## 反模式

- 用 `disabled` 表达"正在提交"：原生禁用会丢掉焦点、读屏也不再播报，用户不知道发生了什么。用 `loading`。
- 把导航写成按钮加 `onClick` 跳转，见上。
- 在按钮里再放一个可聚焦元素：一次点击落在哪个目标上不可预期。
