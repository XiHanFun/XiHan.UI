# FloatButton <Badge type="info" text="浮动按钮" />

钉在视口某一角的动作入口：平时是一枚触发器，展开后长出一列动作。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/float-button" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/float-button.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/float-button" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/float-button" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/float-button.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

点触发器展开一组动作，再点一下收起；收起时那组按钮退出 Tab 序列

<XhDemo src="float-button/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="float-button"`：**`root`** · **`trigger`** · **`list`**

## 示例

### 四角

placement 决定钉在哪一角，start / end 跟着书写方向走；那一组恒往页面中间长

<XhDemo src="float-button/02-placement" />

### 展开方式

hover 指针进出整个壳就开合，click 点触发器；点这条恒在，触摸与键盘都靠它

<XhDemo src="float-button/03-expand-trigger" />

### 外形与贴边

shape 换圆角档，offset 决定距那两条边多远；translations 换掉读屏念出的名字

<XhDemo src="float-button/04-shape-offset" />

### 形态与尺寸

variant 换触发器的用色方式，size 换直径；缺省档与 lg 同高，悬浮钮起步就比行内按钮大一号

<XhDemo src="float-button/05-variant-size" />

## 设计指引

### 何时使用

- 页面主动作在长内容里滚没了，但要求随时可达（新建、回到编辑、联系客服）。
- 移动端或窄视口，工具栏没有位置再挂按钮。

### 何时不用

- 动作与当前滚动位置有关：那是[回到顶部](./back-top)。
- 一屏里已经有固定工具栏：直接放进[工具栏](./toolbar)，别再叠一层浮层。
- 动作超过五六个：收进[菜单](./menu)或抽屉，一列悬浮按钮遮内容。

### 特性

- 四个角可钉，`start` / `end` 跟着书写方向走，那一组恒往页面中间长。
- `hover` 与 `click` 两种展开方式，点击那条恒在——触摸与键盘只有它。
- click 展开后，层外按下或全局 Escape 会收起；多个浮层并存时只由同一 Document 的逻辑栈顶响应，后开的 Drawer / Popover 先退场。Toast 属于反馈通道，不登记为可消解父层。
- hover 模式保留整个根节点的指针进出路径；指针离开与层外消解同时到达时只发一次关闭意图。
- 收起时组内按钮退出 Tab 序列，不会盲聚焦到看不见的东西上。
- 缺省触发器是 M3 通透玻璃：背景、边缘、高光、柔影和磨砂来自同一份 `material.glass` 配方；显式 `variant` 仍按各自语义表面绘制。
- 键盘聚焦时触发器改用配方的实体 focus surface，让公共焦点环不依赖背后页面颜色；高对比、减少透明和强制色沿同一令牌通道降级。

### 组合

- 组内放[按钮](./button)或[图标块](./icon-wrapper)；每一项配[文字提示](./tooltip)说明它是什么。

### 最佳实践

- 每一项都给可及名字：悬浮按钮通常只有图标。
- `offset` 要躲开移动端的安全区与系统手势条。

### 反模式

- 用它承载破坏性动作（删除、清空）：贴边的大按钮最容易误触。
- 展开后盖住页面主内容或另一个固定条。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-float-button>` |
| Vue 组件 | `XhFloatButtonList` `XhFloatButtonRoot` `XhFloatButtonTrigger` |
| 组合式函数 | `useFloatButton` |
| 状态机 | `floatButtonMachine` |
| 皮肤 | `@xihan-ui/styles/float-button.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `defaultOpen` | `boolean` |  |  |
| `dir` | `Direction` |  | 文字方向，只作用于排版；作者没给就不写。 |
| `disabled` | `boolean` |  |  |
| `expandTrigger` | `FloatButtonExpandTrigger` |  | 展开方式，默认 click。 |
| `offset` | `number` |  | 距那两条边的距离（px），默认 24。 |
| `onOpenChange` | `(details: CollapsibleOpenChangeDetails) => void` |  | open 变化意图；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `open` | `boolean` |  |  |
| `placement` | `FloatButtonPlacement` |  | 钉在哪一角，默认 bottom-end。 |
| `shape` | `FloatButtonShape` |  | 触发器外形，默认 circle。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，缺省与 lg 同档——悬浮钮要够得着，起步就比行内按钮大一号。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `translations` | `Partial<FloatButtonTranslations>` |  |  |
| `variant` | `ActionVariant` |  | 形态：solid / subtle / outline / ghost，决定底色、描边与前景怎么用。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `CollapsibleOpenChangeDetails` | 展开状态变化；detail 为 `{ open: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFloatButtonRoot` | `default` | `FloatButtonRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `list` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `TOGGLE` · `DISABLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isDisabled` · `isOpenControlled`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` | 展开的那一组此刻露不露面。 |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getListProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger, not disabled | 展开 / 收起 list；悬停展开时这条路照样在，触摸与键盘都靠它 |
| `Escape` | open，无论焦点是否仍在整组内 | 只收起当前 LayerRegistry 的栈顶层；更晚打开的 Drawer / Popover 先处理自己的 Escape |
| `Tab` / `Shift+Tab` | open | 走进展开的那一组；收起时 list 带 hidden，里面的按钮一并退出 Tab 序列 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `list` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-label` | props.translations?.trigger |
| `list` | `aria-labelledby` | `trigger` 部件的 id |
| `list` | `role` | 'group' |

## 样式参考

### 皮肤

`@xihan-ui/styles/float-button.css` 使用 `[data-scope="float-button"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-placement` | props.placement |
| `root` | `data-shape` | props.shape |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-shape` | props.shape |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `list` | `data-placement` | props.placement |
| `list` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-float-button-bg` | `trigger` | `background-color` | `default` | `--xh-_float-button-bg` | float-button 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-float-button-bg-active` | `trigger` | `background-color` | `active`<br>`disabled`<br>`not([data-disabled])` | `--xh-_float-button-bg-active` | float-button 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-float-button-bg-hover` | `trigger` | `background-color` | `@media (hover: hover)`<br>`disabled`<br>`hover`<br>`not([data-disabled])` | `--xh-_float-button-bg-hover` | float-button 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-float-button-border` | `trigger` | `border` | `default` | `--xh-_float-button-border` | float-button 的 trigger 部件 border 覆盖槽。 |
| `--xh-float-button-border-hover` | `trigger` | `border-color` | `@media (hover: hover)`<br>`disabled`<br>`hover`<br>`not([data-disabled])` | `--xh-_float-button-border-hover` | float-button 的 trigger 部件 border-color 覆盖槽。 |
| `--xh-float-button-fg` | `root`<br>`trigger` | `--xh-_ring-color`<br>`color` | `default`<br>`disabled`<br>`focus-visible`<br>`variant=solid` | `--xh-_float-button-fg` | float-button 的 root、trigger 部件 --xh-_ring-color、color 覆盖槽。 |
| `--xh-float-button-gap` | `list`<br>`root` | `gap` | `default` | `--xh-space-2` | float-button 的 list、root 部件 gap 覆盖槽。 |
| `--xh-float-button-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | float-button 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-float-button-layer` | `root` | `z-index` | `default` | `--xh-_layer` | float-button 的 root 部件 z-index 覆盖槽。 |
| `--xh-float-button-radius` | `list`<br>`root`<br>`trigger` | `border-radius` | `default`<br>`shape=square` | `--xh-shape-control`<br>`--xh-shape-pill` | float-button 的 list、root、trigger 部件 border-radius 覆盖槽。 |
| `--xh-float-button-shadow` | `trigger` | `box-shadow` | `default` | `--xh-_float-button-shadow` | float-button 的 trigger 部件 box-shadow 覆盖槽。 |
| `--xh-float-button-size` | `list`<br>`trigger` | `block-size`<br>`inline-size` | `default` | `--xh-_float-button-size` | float-button 的 list、trigger 部件 block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-pop-in` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`hover: hover` · `pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
