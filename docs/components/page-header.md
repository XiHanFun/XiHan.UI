# PageHeader 页头 <Badge type="info" text="alpha" />

统一呈现页面标题、说明、导航和主要操作。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/page-header" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/page-header.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/page-header" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/page-header" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/page-header.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

显示标题、说明与页面操作

<XhDemo src="page-header/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="page-header"`：**`root`** · `breadcrumb` · `back-trigger` · `media` · `title` · `description` · `extra` · `footer`

## 示例

### 页脚

在标题下方显示页面摘要

<XhDemo src="page-header/05-bordered-footer" />

### 变体

适配页面、表面与抬升区域

<XhDemo src="page-header/06-variant" />

### 导航与媒体

补充页面路径和对象标识

<XhDemo src="page-header/07-breadcrumb-media" />

## 设计指引

### 何时使用

- 详情页、编辑页或对象页面需要稳定的标题区域。

### 何时不用

- 卡片标题应放在卡片内部。
- Logo、全局搜索和账户入口属于站点级布局。

### 特性

- 标题与说明上下排列，操作区位于末侧。
- 面包屑、返回位、媒体位、操作区和页脚均可省略。
- `surface` 提供独立内容面，`raised` 增加抬升层级。
- `bordered` 为纯净页头增加底部分隔，为有面页头增加完整边界。

### 组合

- 使用 `breadcrumb`、`media`、`extra` 和 `footer` 组织补充内容。

### 最佳实践

- 标题使用具体对象名称，说明文字保持简短。
- 操作区只保留一个主要操作。

### 反模式

- 返回入口应指向明确的上级页面。
- 不要在页头中放置完整表单。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-page-header>` |
| Vue 组件 | `XhPageHeaderBackTrigger` `XhPageHeaderBreadcrumb` `XhPageHeaderDescription` `XhPageHeaderExtra` `XhPageHeaderFooter` `XhPageHeaderMedia` `XhPageHeaderRoot` `XhPageHeaderTitle` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/page-header.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `bordered` | `boolean` |  | 底部画一条分隔线，把页头与下面的内容分开。给了面的两档改画整圈描边。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定标题字号与整块的上下留白。 |
| `variant` | `PageHeaderVariant` |  | 形态：plain / surface / raised。不写即不画面，与写 plain 同一个样子。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

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

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/page-header.css` 使用 `[data-scope="page-header"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-bordered` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-variant` | props.variant |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-page-header-bg` | `root` | `background` | `is([data-variant='surface'], [data-variant='raised'])`<br>`variant=raised`<br>`variant=surface` | `--xh-bg-surface` | page-header 的 root 部件 background 覆盖槽。 |
| `--xh-page-header-border` | `root` | `border`<br>`border-block-end` | `bordered`<br>`is([data-variant='surface'], [data-variant='raised'])`<br>`variant=raised`<br>`variant=surface` | `--xh-border-subtle` | page-header 的 root 部件 border、border-block-end 覆盖槽。 |
| `--xh-page-header-breadcrumb-fg` | `breadcrumb` | `color` | `default` | `--xh-fg-muted` | page-header 的 breadcrumb 部件 color 覆盖槽。 |
| `--xh-page-header-breadcrumb-font-size` | `breadcrumb` | `font-size` | `default` | `--xh-text-secondary-size` | page-header 的 breadcrumb 部件 font-size 覆盖槽。 |
| `--xh-page-header-column-gap` | `back-trigger`<br>`extra`<br>`media` | `margin-inline-end`<br>`margin-inline-start` | `default` | `--xh-space-3` | page-header 的 back-trigger、extra、media 部件 margin-inline-end、margin-inline-start 覆盖槽。 |
| `--xh-page-header-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | page-header 的 description 部件 color 覆盖槽。 |
| `--xh-page-header-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` | page-header 的 description 部件 font-size 覆盖槽。 |
| `--xh-page-header-extra-gap` | `extra` | `gap` | `default` | `--xh-space-2` | page-header 的 extra 部件 gap 覆盖槽。 |
| `--xh-page-header-fg` | `root` | `color` | `default` | `--xh-fg-default` | page-header 的 root 部件 color 覆盖槽。 |
| `--xh-page-header-footer-fg` | `footer` | `color` | `default` | `--xh-fg-muted` | page-header 的 footer 部件 color 覆盖槽。 |
| `--xh-page-header-footer-font-size` | `footer` | `font-size` | `default` | `--xh-text-secondary-size` | page-header 的 footer 部件 font-size 覆盖槽。 |
| `--xh-page-header-px` | `root` | `padding-inline` | `default` | `--xh-_page-header-px` | page-header 的 root 部件 padding-inline 覆盖槽。 |
| `--xh-page-header-py` | `root` | `padding-block` | `default` | `--xh-_page-header-py` | page-header 的 root 部件 padding-block 覆盖槽。 |
| `--xh-page-header-radius` | `root` | `border-radius` | `default` | `--xh-_page-header-radius` | page-header 的 root 部件 border-radius 覆盖槽。 |
| `--xh-page-header-row-gap` | `root` | `row-gap` | `default` | `--xh-_page-header-row-gap` | page-header 的 root 部件 row-gap 覆盖槽。 |
| `--xh-page-header-shadow` | `root` | `box-shadow` | `variant=raised` | `--xh-elevation-raised` | page-header 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-page-header-title-fg` | `title` | `color` | `default` | `--xh-fg-default` | page-header 的 title 部件 color 覆盖槽。 |
| `--xh-page-header-title-font-size` | `title` | `font-size` | `default` | `--xh-_page-header-title-size` | page-header 的 title 部件 font-size 覆盖槽。 |
| `--xh-page-header-title-font-weight` | `title` | `font-weight` | `default` | `--xh-font-weight-semibold` | page-header 的 title 部件 font-weight 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### 响应式

皮肤按视口分档：`max-width: 640px`。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
