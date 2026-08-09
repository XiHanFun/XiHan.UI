# 锚点 <Badge type="info" text="anchor" />

导航组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

目录跟着滚动位置自己换高亮；scroll-element 把判定线挂到指定滚动容器上，不给就挂在窗口上

<XhDemo src="anchor/01-basic" />

### 受控

传了 value 就由宿主说了算；一节都没越过判定线时它是 null，此时谁都不亮、指示条整条收起

<XhDemo src="anchor/02-controlled" />

### 判定线偏移

offset 是判定线距容器视口顶边的距离，有吸顶栏就把栏高填进去，越过它的最后一节才算当前节

<XhDemo src="anchor/03-offset" />

### 横排目录

orientation="horizontal" 只改样式：条目排成一行，轨道与指示条从起始缘挪到底边

<XhDemo src="anchor/04-horizontal" />

### 语气

tone 换的是选中那一节的指示条与文字颜色，这里用 default-value 预置「用法」为选中项

<XhDemo src="anchor/05-tone" />

### 尺寸

size 换条目的字号与左右内边距，不传 size 即默认档

<XhDemo src="anchor/06-size" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-anchor>` |
| Vue 组件 | `XhAnchorIndicator` `XhAnchorItem` `XhAnchorLink` `XhAnchorList` `XhAnchorRoot` |
| 组合式函数 | `useAnchor` |
| 状态机 | `anchorMachine` |
| 皮肤 | `@xihan-ui/styled/anchor.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="anchor"`：**`root`** · **`list`** · **`item`** · **`link`** · `indicator`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| null` |  | 当前激活的锚点 id，给定即受控。 |
| `defaultValue` | `string \| null` |  |  |
| `targets` | `readonly string[]` |  | 目标区块的 id 清单，按文档序给；不给则按渲染出来的 link 现查。 |
| `offset` | `number` |  | 判定线距滚动容器视口顶边的距离（px），默认 0。 |
| `smooth` | `boolean` |  | 点链接时平滑滚动到目标，默认 false。 |
| `dir` | `Direction` |  | 文字方向，作用于排版与指示条的起始缘。 |
| `orientation` | `Orientation` |  | 列表轴向，默认 vertical，只影响样式。 |
| `translations` | `Partial<AnchorTranslations>` |  |  |
| `tone` | `string` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `string` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: AnchorValueChangeDetails) => void` |  | value 变化意图回调。 |

## 状态机

**状态**：`idle` · `scrolling`

**事件**：`SPY.RESOLVE` · `LINK.CLICK` · `VALUE.SET` · `after.scrollLock`

**判据**：`isSmooth` · `isTargetReached`

## connect API

`useAnchor` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` | 当前激活的锚点 id；一个都没越过判定线时为 null。 |
| `isActive` | `(value: string) => boolean` |  |
| `setValue` | `(next: string \| null) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` |  |
| `getLinkProps` | `(props: AnchorLinkProps) => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/navigation.html)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | focus in link | 跳到目标区块：smooth 关时由原生 &lt;a href="#id"&gt; 跳转，开时组件拦下并平滑滚动（两种情况都当场把激活项切过去，不等观察器） |
| `Tab` / `Shift+Tab` | focus in root | 逐条走过目录里的链接；锚点导航不做 roving tabindex，每一条都是独立的 Tab 停靠点 |
