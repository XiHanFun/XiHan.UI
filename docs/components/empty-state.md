# 空状态 <Badge type="info" text="empty-state" />

数据展示组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

图标、标题、说明、操作四个槽都可选，只有 root 是必须的

<XhDemo src="empty-state/01-basic" />

### 尺寸

size 只换留白与字号，语义一点不动；不传即 md

<XhDemo src="empty-state/02-size" />

### 播报方式

缺省 polite 让 root 成为活区，筛完就地播报；off 让它只是个普通容器

<XhDemo src="empty-state/03-live" />

### 用作结果页

同一套部件也承载 404、403 这类结果：换掉图标与文案，操作槽里放回退出口

<XhDemo src="empty-state/04-result" />

### 按语气着色

空状态自己不带语气，图标槽里放一枚带 tone 的图标，成功、警示、出错就各是一族颜色

<XhDemo src="empty-state/05-tone-icon" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-empty-state>` |
| Vue 组件 | `XhEmptyStateAction` `XhEmptyStateDescription` `XhEmptyStateIcon` `XhEmptyStateRoot` `XhEmptyStateTitle` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/empty-state.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="empty-state"`：**`root`** · `icon` · `title` · `description` · `action`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `live` | `EmptyStateLive` |  | 缺省 polite。 |
| `size` | `Size` |  | 尺寸档位，只改留白与字号，不改语义。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `live` | `EmptyStateLive` | 生效的播报方式，缺省补齐后的值。 |
| `getRootProps` | `() => T['element']` |  |
| `getIconProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getActionProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/live-regions/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-empty-state-action-gap` · `--xh-empty-state-description-fg` · `--xh-empty-state-description-font-size` · `--xh-empty-state-description-leading` · `--xh-empty-state-description-max-w` · `--xh-empty-state-fg` · `--xh-empty-state-gap` · `--xh-empty-state-icon-fg` · `--xh-empty-state-icon-font-size` · `--xh-empty-state-icon-size` · `--xh-empty-state-px` · `--xh-empty-state-py` · `--xh-empty-state-title-fg` · `--xh-empty-state-title-font-size` · `--xh-empty-state-title-font-weight` · `--xh-empty-state-title-leading`
