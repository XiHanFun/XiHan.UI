# Breadcrumb 面包屑

显示当前页面在信息层级中的位置。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/breadcrumb" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/breadcrumb.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/breadcrumb" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/breadcrumb" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/breadcrumb.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

显示当前页面的层级路径

<XhDemo src="breadcrumb/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="breadcrumb"`：**`root`** · **`list`** · **`item`** · **`link`** · `link-icon` · `separator` · `ellipsis`

## 示例

### 折叠层级

收起过长路径的中间部分

<XhDemo src="breadcrumb/02-ellipsis" />

### 自定义分隔符

替换层级之间的视觉标记

<XhDemo src="breadcrumb/03-translations" />

### 尺寸

适配不同的信息密度

<XhDemo src="breadcrumb/04-size" />

## 设计指引

### 何时使用

- 页面具有明确的父子层级。
- 用户可能从搜索或外链直接进入深层页面。

### 何时不用

- 扁平页面不需要面包屑。
- 流程进度使用[步骤条](./steps)。

### 特性

- `collection` 可直接生成完整路径，也支持手写部件。
- `maxItems` 将过长路径的中间层折叠为省略号。
- 默认分隔符为箭头，可通过插槽或渲染函数替换。
- 当前页使用 `aria-current="page"`，不参与键盘导航。

### 组合

- 通常放在页头或正文标题之前。

### 最佳实践

- 当前项使用清晰的页面标题，避免“详情”等泛化名称。
- 同页有多个 `nav` 地标时给面包屑单独的 `aria-label`。

### 反模式

- 不要用面包屑表示浏览历史。
- 当前项不要链接到自身。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-breadcrumb>` |
| Vue 组件 | `XhBreadcrumbEllipsis` `XhBreadcrumbItem` `XhBreadcrumbLink` `XhBreadcrumbLinkIcon` `XhBreadcrumbList` `XhBreadcrumbRoot` `XhBreadcrumbSeparator` |
| 组合式函数 | `useBreadcrumb` |
| 状态机 | `breadcrumbMachine` |
| 皮肤 | `@xihan-ui/styles/breadcrumb.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `readonly BreadcrumbNode[]` |  | 层级数据，文字、链接与当前页的事实源。 未提供时回到层级逐个写成部件的方式。 |
| `maxItems` | `number` |  | 最多展开的层数，超出的中间层折叠为一个省略位；未提供时全部列出。 |
| `dir` | `Direction` |  | 文字方向，只作用于排版；作者未提供时不写入。 |
| `translations` | `Partial<BreadcrumbTranslations>` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |

### BreadcrumbNode

`collection` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | 是 | 层级身份，写入 data-value。 |
| `label` | `string` |  | 显示文字；默认回退为 value。 |
| `href` | `string` |  | 链接地址；未提供时渲染为不带 href 的 a。 |
| `icon` | `string` |  | 图标文本，写入 link-icon 部件；需要放置图形时改用插槽。 |
| `current` | `boolean` |  | 当前页所在层级。 |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhBreadcrumbLink` | `value` | `string` |  | 链接身份，按压通道按它记住正被按住的那一条；未声明时派生一个实例内稳定的键。 |
| `XhBreadcrumbLink` | `current` | `boolean` |  | 当前页的条目。 |
| `XhBreadcrumbRoot` | `renderSeparator` | `() => ReactNode` |  | 分隔符的内容；未提供时由皮肤绘制默认箭头。 |
| `XhBreadcrumbRoot` | `renderEllipsis` | `(nodes: readonly BreadcrumbNodeMeta[]) => ReactNode` |  | 省略位的内容，可得到被折叠的层；未提供时为一个省略号。 |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`PRESS.START` · `PRESS.END`

**判据**：`canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `collection` | `readonly BreadcrumbNodeMeta[]` | 由 collection 推导的层级元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `items` | `readonly BreadcrumbItem[]` | 按 maxItems 折叠后的序列，省略位自带被折叠的层级；未提供 collection 时为空数组。 |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` |  |
| `getLinkProps` | `(props: BreadcrumbLinkProps) => T['element']` |  |
| `getLinkIconProps` | `() => T['element']` |  |
| `getSeparatorProps` | `() => T['element']` |  |
| `getEllipsisProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | focus in link, 非当前页 | 跟随链接（原生 &lt;a href&gt; 的激活行为，面包屑自己不监听按键） |
| `Enter` / `Space` | held in link, 非当前页 | 按住期间该链接投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下。跟随链接照旧由这一次按键（原生 &lt;a href&gt;）承担，当前页那条不进 |
| `Tab` / `Shift+Tab` | focus in root | 逐条走过可点的链接；面包屑不做 roving tabindex，当前页那条带 tabindex=-1 自动脱序 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | props.translations.root |
| `link` | `aria-current` | 'page' \| undefined |
| `link` | `aria-disabled` | 'true' \| 'false' |
| `link-icon` | `aria-hidden` | 'true' |
| `separator` | `aria-hidden` | 'true' |
| `ellipsis` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/breadcrumb.css` 使用 `[data-scope="breadcrumb"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `link` | `data-current` | ''（条件成立时才出现） |
| `link` | `data-pressed` | ''（条件成立时才出现） |
| `link` | `data-xh-collection-context` | 'nav' |
| `link` | `data-xh-collection-item` | '' |
| `link` | `data-xh-collection-size` | props.size |
| `link` | `data-xh-collection-terminal` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-breadcrumb-ellipsis-size` | `ellipsis` | `inline-size` | `default` | `--xh-space-5` | breadcrumb 的 ellipsis 部件 inline-size 覆盖槽。 |
| `--xh-breadcrumb-fg` | `link`<br>`root` | `color` | `default`<br>`xh-collection-context=nav` | `--xh-fg-muted` | breadcrumb 的 link、root 部件 color 覆盖槽。 |
| `--xh-breadcrumb-font-size` | `link`<br>`root` | `font-size` | `default` | `--xh-_breadcrumb-font-size` | breadcrumb 的 link、root 部件 font-size 覆盖槽。 |
| `--xh-breadcrumb-gap` | `list` | `gap` | `default` | `--xh-_breadcrumb-gap` | breadcrumb 的 list 部件 gap 覆盖槽。 |
| `--xh-breadcrumb-icon-size` | `link`<br>`root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | breadcrumb 的 link、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-breadcrumb-leading` | `link`<br>`root` | `line-height` | `default` | `--xh-leading-tight` | breadcrumb 的 link、root 部件 line-height 覆盖槽。 |
| `--xh-breadcrumb-link-bg-hover` | `link` | `background-color` | `disabled`<br>`error`<br>`hover`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-bg-subtle` | breadcrumb 的 link 部件 background-color 覆盖槽。 |
| `--xh-breadcrumb-link-bg-pressed` | `link` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=nav` | `--xh-bg-subtle-hover` | breadcrumb 的 link 部件 background-color 覆盖槽。 |
| `--xh-breadcrumb-link-fg-current` | `link` | `color` | `current`<br>`xh-collection-context=nav`<br>`xh-collection-terminal` | `--xh-_breadcrumb-accent-text` | breadcrumb 的 link 部件 color 覆盖槽。 |
| `--xh-breadcrumb-link-fg-hover` | `link` | `color` | `disabled`<br>`error`<br>`hover`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-_breadcrumb-accent-text` | breadcrumb 的 link 部件 color 覆盖槽。 |
| `--xh-breadcrumb-link-font-weight-current` | `link` | `font-weight` | `current`<br>`xh-collection-context=nav`<br>`xh-collection-terminal` | `--xh-font-weight-medium` | breadcrumb 的 link 部件 font-weight 覆盖槽。 |
| `--xh-breadcrumb-link-gap` | `link` | `gap` | `default` | `--xh-space-1` | breadcrumb 的 link 部件 gap 覆盖槽。 |
| `--xh-breadcrumb-link-icon-size` | `link-icon` | `block-size`<br>`inline-size` | `default` | `--xh-glyph-size-text` | breadcrumb 的 link-icon 部件 block-size、inline-size 覆盖槽。 |
| `--xh-breadcrumb-link-max-w` | `link` | `max-inline-size` | `default` | `--xh-nav-link-max-w` | breadcrumb 的 link 部件 max-inline-size 覆盖槽。 |
| `--xh-breadcrumb-link-px` | `link` | `padding-inline` | `default` | `--xh-space-1` | breadcrumb 的 link 部件 padding-inline 覆盖槽。 |
| `--xh-breadcrumb-link-radius` | `link` | `border-radius` | `default` | `--xh-shape-control` | breadcrumb 的 link 部件 border-radius 覆盖槽。 |
| `--xh-breadcrumb-separator-fg` | `ellipsis`<br>`separator` | `color` | `default` | `--xh-fg-subtle` | breadcrumb 的 ellipsis、separator 部件 color 覆盖槽。 |
| `--xh-breadcrumb-separator-size` | `separator` | `inline-size` | `default` | `--xh-glyph-size-text` | breadcrumb 的 separator 部件 inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

另有按 `dir` 分支的规则。
