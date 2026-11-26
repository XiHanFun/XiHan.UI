# Presence 进出场

让一块内容按 `present` 出现与消失：出现时淡入，消失时等退场动画播完再撤下，撤下之后通知 `exit-complete`。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/presence" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/presence.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/presence" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/presence" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/presence.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

present 决定内容在不在：变为真时淡入，变为假时淡出，退场播完才撤下

<XhDemo src="presence/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="presence"`：**`root`**

## 示例

### 退场后保留内容

unmountOnExit 缺省为真，退场播完即卸载，再出现时里面的输入已清空；设为 false 时只藏起 root，输入原样保留

<XhDemo src="presence/02-keep-mounted" />

### 自定义进出场

两个覆盖槽各收一整条 animation 简写，换成自己的关键帧；退场那条带 forwards，位移取幅度令牌，减弱动效下只剩淡变

<XhDemo src="presence/03-custom-motion" />

### 退场完成

exit-complete 在退场动画播完、内容撤下之后才发，「退场中」与「已撤下」由它分开；退场途中改回在场不发

<XhDemo src="presence/04-exit-complete" />

## 设计指引

### 何时使用

- 一块内容随某个条件出现与消失，并且需要进出场动画：保存成功后的提示、筛选条件下多出来的一行说明、切换后才出现的辅助面板。
- 自己组合的浮现内容要沿用组件库的退场时机：退场动画播完才卸载，中途改回在场时从此刻接着淡入。

### 何时不用

- 内容要随触发器展开与收起、高度跟着变化时，使用[折叠区域](./collapsible)或[手风琴](./accordion)，它们自带触发器语义与行高动画。
- 内容要浮在页面之上时，使用[对话框](./dialog)、[抽屉](./drawer)或[气泡卡片](./popover)，它们自带焦点、遮罩与定位，进出场也已内置。
- 只是显示或隐藏、不需要动画时，直接按条件渲染即可。

### 特性

- 只管两件事：内容在不在，以及退场动画几时播完。不带角色、不接按键，读屏读到的是内容本身。
- 首帧就在场的内容直接呈现（`data-instant`），不播进场；`present` 第一次变化起，每一次出现都播进场、每一次消失都播退场。
- 退场期间 root 带 `data-state="closed"`、不带 `hidden`，动画播完才带上 `hidden` 并撤下内容；中途改回在场时取消退场，从此刻的不透明度接着淡入，内容不重新挂载。
- 内容缺省第一次在场才挂载（`lazyMount`），退场播完即卸载（`unmountOnExit`）；把 `unmountOnExit` 设为 `false` 时内容留着、只藏起 root，里面的输入与滚动位置随之保留；两者都设为 `false` 时内容从一开始就挂着，不在场时随 root 一起藏起。
- `exit-complete` 只在退场播完、内容撤下之后发一次；初始就不在场、退场途中又改回在场，都不发。
- 缺省动画是一段只动不透明度的淡入淡出，时长取 `--xh-motion-duration-enter` / `--xh-motion-duration-exit`。`--xh-presence-enter-animation` 与 `--xh-presence-exit-animation` 各收一整条 `animation` 简写：写 `none` 关掉这一头，写自己的关键帧换掉；也可以直接按 `data-state` 给 root 写动画。退场时组件读的是 root 上实际在播的动画，不另设计时器。
- Web Components 里元素不能销毁作者写的节点：把内容写进 root 里的一个 `<template>`，解析时不实例化，挂载时克隆、卸载时丢弃；没写模板时卸载只是把节点暂时摘下，挂载时原样放回。

### 组合

- 包住[警告提示](./alert)、[空状态](./empty-state)或一段表单说明，让它随条件出现与消失。
- 放进列表或表单的某一行里做局部的补充信息；整组条目的增删用各集合组件自带的列表动效。

### 最佳实践

- 自己写进出场动画时成对写：有进场就写退场，退场关键帧带 `forwards`，否则播完、藏起之前会闪回一帧。
- 自己的关键帧里有位移时，幅度取 `--xh-motion-distance-*`：减弱动效下它们归零，只剩淡变。
- 消失的内容里若有焦点，先把焦点移到仍在场的位置，焦点不随内容一起消失。

### 反模式

- 用它包对话框或下拉面板：浮层组件已经各自管着进出场，再包一层会播两遍动画。
- 在 `exit-complete` 里再把 `present` 改回真来做循环动画：进出场表达的是内容的来去，循环动效另有角色。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-presence>` |
| Vue 组件 | `XhPresence` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/presence.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `lazyMount` | `boolean` |  | 第一次在场之前不挂内容，缺省 true。 |
| `onExitComplete` | `() => void` |  | 退场动画播完、内容撤下之后通知；初始就不在场时不通知。 |
| `present` | `boolean` |  | 是否在场。由 false 变 true 时进场；由 true 变 false 时等退场动画播完才撤下。缺省 false。 |
| `unmountOnExit` | `boolean` |  | 退场播完后卸掉内容，缺省 true；写 false 时内容留着、根上带 hidden。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `exit-complete` | — | 退场动画播完、内容撤下之后派发，没有 detail；初始就不在场时不派发 |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhPresence` | `children` | `ReactNode` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `present` | `boolean` |  |
| `isContentMounted` | `(visible: boolean, mountedOnce: boolean) => boolean` | 这一帧内容该不该挂着。visible 是适配器退场闸门给的「在场或还在播退场」， mountedOnce 是此前是否在场过一次。 |
| `getRootProps` | `(visible: boolean, presentChanged: boolean) => T['element']` | visible 同上：退场播完才带 hidden，退场那一段还要看得见。 presentChanged 是 present 自挂载以来变过没有：没变过时首帧就在场的根带 data-instant 直接呈现， 第一次变化起每一次进场照常播。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/presence.css` 按 `[data-scope="presence"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-presence` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-instant` | ''（条件成立时才出现） |
| `root` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-presence-enter-animation` | `root` | `animation` | `instant`<br>`not([data-instant], [hidden])`<br>`state=open` | `--xh-motion-duration-enter` | presence 的 root 部件 animation 覆盖槽。 |
| `--xh-presence-exit-animation` | `root` | `animation` | `not([hidden])`<br>`state=closed` | `--xh-motion-duration-exit` | presence 的 root 部件 animation 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：出现（见[动效规范](../design/motion#角色)）。

可覆盖的动效槽：`--xh-presence-enter-animation` · `--xh-presence-exit-animation`。

共享关键帧 `xh-fade-in` · `xh-fade-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。
