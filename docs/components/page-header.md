# 页头 <Badge type="info" text="page-header" />

一页内容的抬头：面包屑、返回位、头像位、标题、副标题、行尾操作与页脚各占一段。

## 何时使用

- 详情页、编辑页需要一个统一的抬头，带返回与本页主操作。

## 何时不用

- 页面就是一张表或一块卡片，标题写在卡片里更近：用[卡片](./card)。
- 需要的是站点级的头（logo、全局搜索、账户）：那属于[布局](./layout)的 `header`。

## 特性

- 除了 `root`，返回位、副标题、操作、页脚都可选，只写用得上的那几段。
- 返回位就是作者自己的按钮：组件只给身份与位置，类型、可及名字与点击行为自己写。
- `extra` 贴在整行的末尾；面包屑整行排在标题之上，头像 / 图标排在返回位与标题之间。
- 形态分三档：不写即不画面（贴在页面底色上），`surface` 加底色与圆角，`raised` 再加一层抬起投影；后两档的 `bordered` 改画整圈描边。

## 示例

### 基础用法

除了 root，返回位、副标题、操作、页脚都可选；只写用得上的那几段

<XhDemo src="page-header/01-basic" />

### 返回位

返回位就是作者自己的按钮：组件只给身份与位置，type、可及名字与点击行为自己写

<XhDemo src="page-header/02-back" />

### 行尾操作

extra 贴在整行的末尾，里面放什么按钮由作者决定

<XhDemo src="page-header/03-extra" />

### 尺寸

size 换的是标题字号与整块的上下留白，不写 size 即默认档

<XhDemo src="page-header/04-size" />

### 分隔线与页脚

bordered 在底部画一条线，footer 整行另起，装描述或一组摘要

<XhDemo src="page-header/05-bordered-footer" />

### 形态

不写 variant 即不画面（与写 plain 一个样）；surface 加底色、圆角与左右内衬，raised 再加一层抬起投影，bordered 在这两档改画整圈描边

<XhDemo src="page-header/06-variant" />

### 面包屑与头像位

面包屑整行排在标题之上（写在标记最前面），头像/图标排在返回位与标题之间；两块都可缺省

<XhDemo src="page-header/07-breadcrumb-media" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-page-header>` |
| Vue 组件 | `XhPageHeaderBackTrigger` `XhPageHeaderBreadcrumb` `XhPageHeaderDescription` `XhPageHeaderExtra` `XhPageHeaderFooter` `XhPageHeaderMedia` `XhPageHeaderRoot` `XhPageHeaderTitle` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/page-header.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="page-header"`：**`root`** · `breadcrumb` · `back-trigger` · `media` · `title` · `description` · `extra` · `footer`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `bordered` | `boolean` |  | 底部画一条分隔线，把页头与下面的内容分开。给了面的两档改画整圈描边。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定标题字号与整块的上下留白。 |
| `variant` | `PageHeaderVariant` |  | 形态：plain / surface / raised。不写即不画面，与写 plain 同一个样子。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getBreadcrumbProps` | `() => T['element']` | 面包屑位：整行排在标题之上。放什么归作者，组件只圈出位置。 |
| `getBackTriggerProps` | `() => T['element']` |  |
| `getMediaProps` | `() => T['element']` | 头像 / 图标位：排在返回位与标题之间，不随标题行换行。 |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getExtraProps` | `() => T['element']` |  |
| `getFooterProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/page-header.css` 按部件选择：`[data-scope="page-header"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-bordered` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-variant` | props.variant |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-page-header-bg` · `--xh-page-header-border` · `--xh-page-header-breadcrumb-fg` · `--xh-page-header-breadcrumb-font-size` · `--xh-page-header-column-gap` · `--xh-page-header-description-fg` · `--xh-page-header-description-font-size` · `--xh-page-header-extra-gap` · `--xh-page-header-fg` · `--xh-page-header-footer-fg` · `--xh-page-header-footer-font-size` · `--xh-page-header-px` · `--xh-page-header-py` · `--xh-page-header-radius` · `--xh-page-header-row-gap` · `--xh-page-header-shadow` · `--xh-page-header-title-fg` · `--xh-page-header-title-font-size` · `--xh-page-header-title-font-weight`

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 面包屑位里放[面包屑](./breadcrumb)，头像位里放[头像](./avatar)，`extra` 里放[按钮组](./button-group)，`footer` 里放[描述列表](./descriptions)或一组[统计数值](./statistic)。

## 最佳实践

- 标题写具体对象的名字，不写页面类型。
- `extra` 里的主操作只留一个，其余收进[菜单](./menu)。

## 反模式

- 返回位直接调 `history.back()`：用户从外链进来时会退出站点。给它一个确定的上级地址。
- 页头里塞进整块表单。
