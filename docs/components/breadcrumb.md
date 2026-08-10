# 面包屑 <Badge type="info" text="breadcrumb" />

导航组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

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
