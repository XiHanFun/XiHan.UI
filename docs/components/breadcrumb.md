# 面包屑 <Badge type="info" text="breadcrumb" />

把当前位置在层级里的路径摊开，每一层都能点回去。

## 何时使用

- 层级超过两级且用户可能从搜索或外链直接进到深层。
- 需要让用户知道"我在哪，上一层是什么"。

## 何时不用

- 站点是扁平的：路径只有一层，写它没有信息量。
- 用来表达步骤的先后：那是[步骤条](./steps)。

## 特性

- `href` 归作者写；末级只多一个 `current`：它拿到 `aria-current="page"`、点不动、也不占 Tab 位。
- 中间层级可以折叠成省略号；省略号与分隔符都对读屏隐藏，念出来仍是完整的列表项数。
- `root` 是 `nav` 地标，`translations.root` 换掉它的 `aria-label`。

## 示例

### 基础用法

href 归作者写，末级只多一个 current：它拿到 aria-current="page"、点不动、也不占 Tab 位

<XhDemo src="breadcrumb/01-basic" />

### 折叠中间层级

省略号与分隔符同为 ol 的直接子 li，两者都对读屏隐藏，念出来仍是「列表，共 3 项」

<XhDemo src="breadcrumb/02-ellipsis" />

### 读屏文案

root 是 nav 地标，translations.root 换掉它的 aria-label，同页有多个地标时靠它区分

<XhDemo src="breadcrumb/03-translations" />

### 语气

tone 换的是当前项的文字色，以及可点那几层悬停时的文字色；末级预置为当前项

<XhDemo src="breadcrumb/04-tone" />

### 尺寸

size 换整条路径的字号与各层之间的间距，不传 size 即默认档

<XhDemo src="breadcrumb/05-size" />

### 层级下拉

某一层要换去处时，把菜单整套放进 item 里；面包屑只管这一层的排版

<XhDemo src="breadcrumb/06-dropdown" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-breadcrumb>` |
| Vue 组件 | `XhBreadcrumbEllipsis` `XhBreadcrumbItem` `XhBreadcrumbLink` `XhBreadcrumbList` `XhBreadcrumbRoot` `XhBreadcrumbSeparator` |
| 组合式函数 | `useBreadcrumb` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/breadcrumb.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="breadcrumb"`：**`root`** · **`list`** · **`item`** · **`link`** · `separator` · `ellipsis`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `dir` | `Direction` |  | 文字方向，只作用于排版；作者没给就不写。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `translations` | `Partial<BreadcrumbTranslations>` |  |  |

## connect API

`useBreadcrumb` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` |  |
| `getLinkProps` | `(props: BreadcrumbLinkProps) => T['element']` |  |
| `getSeparatorProps` | `() => T['element']` |  |
| `getEllipsisProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | focus in link, 非当前页 | 跟随链接（原生 &lt;a href&gt; 的激活行为，面包屑自己不监听按键） |
| `Tab` / `Shift+Tab` | focus in root | 逐条走过可点的链接；面包屑不做 roving tabindex，当前页那条带 tabindex=-1 自动脱序 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | props.translations?.root |
| `link` | `aria-current` | 'page' \| undefined |
| `link` | `aria-disabled` | 'true' \| 'false' |
| `separator` | `aria-hidden` | 'true' |
| `ellipsis` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/breadcrumb.css` 按部件选择：`[data-scope="breadcrumb"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `link` | `data-current` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-breadcrumb-current-fg` · `--xh-breadcrumb-current-font-weight` · `--xh-breadcrumb-ellipsis-size` · `--xh-breadcrumb-fg` · `--xh-breadcrumb-font-size` · `--xh-breadcrumb-gap` · `--xh-breadcrumb-leading` · `--xh-breadcrumb-link-bg-hover` · `--xh-breadcrumb-link-fg-hover` · `--xh-breadcrumb-link-gap` · `--xh-breadcrumb-link-max-w` · `--xh-breadcrumb-link-px` · `--xh-breadcrumb-link-radius` · `--xh-breadcrumb-separator-fg` · `--xh-breadcrumb-separator-size`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 放进[页头](./page-header)；某一层要换去处时把整套[菜单](./menu)放进那一项里。

## 最佳实践

- 末级写当前页标题，别写"详情"这种没有信息的词。
- 同页有多个 `nav` 地标时给面包屑单独的 `aria-label`。

## 反模式

- 拿面包屑记录浏览历史：它表达的是层级位置，不是来路。
- 末级也做成链接指向自己。
