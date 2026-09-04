# 结果页 <Badge type="info" text="result" />

一次操作或一段流程结束后的整页反馈：成功、失败或某个状态码。

## 何时使用

- 提交成功、支付完成、权限不足、页面不存在。
- 用户需要在这里决定下一步去哪。

## 何时不用

- 只是一次轻量操作的反馈：用[轻提示](./toast)。
- 列表里没有数据：用[空状态](./empty-state)。

## 特性

- `status` 决定这一页并进哪一族语气色。
- 图标由作者塞，标题、描述与操作槽各占一段。

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

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `icon` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/result.css` 按部件选择：`[data-scope="result"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-status` | props.status |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-result-action-gap` · `--xh-result-description-fg` · `--xh-result-description-font-size` · `--xh-result-description-leading` · `--xh-result-description-max-w` · `--xh-result-fg` · `--xh-result-gap` · `--xh-result-icon-fg` · `--xh-result-icon-font-size` · `--xh-result-icon-size` · `--xh-result-px` · `--xh-result-py` · `--xh-result-title-fg` · `--xh-result-title-font-size` · `--xh-result-title-font-weight` · `--xh-result-title-leading`

## 动效

关键帧 `xh-rise-in` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 图标用[图标块](./icon-wrapper)；操作槽里放[按钮](./button)与[按钮组](./button-group)。

## 最佳实践

- 每一页都给回退出口：回首页、重试、联系支持。403 与 500 尤其需要。
- 失败页要给可追溯的标识（请求号、时间），用户报障时用得上。

## 反模式

- 只写"出错了"却不说是什么错，也不给下一步。
- 成功页没有任何后续入口，用户卡在原地。
