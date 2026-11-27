# Popover 气泡卡片

由点击触发、贴着触发器的一小块浮层，可以放任意内容与交互。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/popover" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/popover.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/popover" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/popover" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/popover.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

点击展开，Escape 或点击外部关闭；positioner 负责定位，content 才是浮层本体

<XhDemo src="popover/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="popover"`：`trigger` · `positioner` · **`content`** · `title` · `description` · `close-trigger` · `arrow`

## 示例

### 朝向与间距

placement 是请求值，空间不足时定位引擎会自动翻面；offset 调整浮层与触发器的距离

<XhDemo src="popover/02-placement" />

### 受控

传入 open 后由宿主决定；这里额外关闭点击外部关闭，只有按钮与 Escape 能收起

<XhDemo src="popover/03-controlled" />

### 尺寸

三档改变浮层的内边距与字号，不写 size 即默认档；逐个点开触发器查看差别

<XhDemo src="popover/04-size" />

### 确认气泡

标题、说明与两个按钮组成一次就地确认；两个按钮按下后都只是收起浮层

<XhDemo src="popover/05-confirm" />

### 长内容滚动

浮层自身不限高，为内部容器设置上限并开启滚动，标题与关闭按钮就不随内容滚动

<XhDemo src="popover/06-scroll" />

### 模态浮层

modal 使焦点限制在浮层内：Tab 到末尾回绕，旁边的按钮此时无法获得焦点

<XhDemo src="popover/07-modal" />

### 事件

open-change 带一份 { open }，报告的是本次要进入的状态；非受控时内部开合也照常触发一次

<XhDemo src="popover/08-event" />

### 浮层与触发器同宽

测量触发器的实际宽度写进 content 的行内样式，同时解除最大宽度上限；触发器更换文案后宽度随之变化

<XhDemo src="popover/09-trigger-width" />

### 书写方向

start / end 是逻辑对齐不是左右：RTL 下 bottom-start 贴的是锚点右缘，块轴上的对齐不受影响

<XhDemo src="popover/10-rtl" />

### 落在指针位置

anchor 交一个只给得出矩形的虚拟锚点，浮层就固定在刚点击的位置；再点一次更换落点，不用再摆一颗看不见的触发器

<XhDemo src="popover/11-point-anchor" />

## 设计指引

### 何时使用

- 补充信息或一小组操作，不需要为此打开对话框。
- 内容中有可聚焦元素（按钮、输入框），这是它与[文字提示](./tooltip)的分界。

### 何时不用

- 只有一句纯文字说明时，使用[文字提示](./tooltip)。
- 悬停即出、不需要点击时，使用[悬浮卡片](./hover-card)。
- 内容是一列命令时，使用[菜单](./menu)。

### 特性

- `placement` 只是首选位置，空间不足时定位引擎自动翻面。
- `crossOffset` 沿交叉轴再挪一段：正值往结束方向，落在上下两侧时往行内结束方向（RTL 下向左），落在左右两侧时往下，箭头仍对着触发器中心。`flip` 为 false 时不再自动翻面，守着 `placement` 那一侧，交叉轴贴边挪位照旧；`boundary` 给一块碰撞边界（元素或带 `getBoundingClientRect()` 的对象），浮层只在它与视口的交集里摆，翻面、贴边与可用空间都以交集为界。三项原样交给定位引擎，不写就留给引擎缺省。
- `modal` 可选：需要锁定下层时开启；展开期间可动态切换，模态档会锁定页面滚动并让背景失活。
- `end` 等对齐是逻辑方向，跟随书写方向，不是物理左右。
- `anchor` 换成外部锚点：由别处的按钮（工具栏命令等）受控打开时，把那颗按钮交给 `anchor`，浮层就贴着它定位、收起时焦点归还给它，可以不写触发器。展开期间这颗按钮带 `aria-haspopup`、`aria-expanded` 与 `aria-controls`，收起或换锚点时还原；点它算浮层内的交互，开合交给打开它的那条命令。
- `anchor` 也收虚拟锚点：一个带 `getBoundingClientRect()` 的对象（右键的指针落点、文本选区的 `Range`），浮层按它给的矩形落位，页面滚动、视口改尺时现读重算；换一个对象即按新矩形重挂。虚拟锚点接不了焦点、也写不了读屏属性：收起时焦点归还给触发器，没有触发器时回到打开前的焦点持有者。
- 展开后焦点进入浮层：`initialFocus` 给一个选择器，焦点落在 content 里匹配它的元素上；没给或不匹配时落在第一个可聚焦元素上。`restoreFocus` 为 false 时收起不归还焦点（缺省归还给触发器或元素锚点）；Tab 与层外交互收起时焦点已经去了别处，一向不抢回。模态与非模态都生效。
- content 里的内容缺省常驻、收起只隐藏。`lazyMount` 让它第一次打开时才挂载、之后常驻：表格每行一个气泡卡片时，收起态每个实例背着的整份内容是挂载开销的大头；`unmountOnExit` 让它在退场动画播完后卸载、下次打开重新挂载，内容里的组件状态与输入随之丢掉。positioner 与 content 节点不受这两项管，一向常驻，触发器的 `aria-controls` 始终指得到它。Web Components 的作者节点一向常驻；写进 content 里一个 `<template>` 的内容按同一规则挂卸。
- 退场动画播完、层与焦点域等资源全部释放之后发出 `onExitComplete` / `exit-complete`；退场途中重开与卸载都不发。退场后的清理（重置表单、撤掉临时数据）放在这里，不必自己量动画。
- `disabled` 让浮层不可打开：触发器转原生 disabled（退出 Tab 序列、画禁用面），点按与 `setOpen(true)` 都不展开，展开途中转为禁用即收起；与文字提示、悬浮卡片的 `disabled` 同名同义。

默认内容面走 frosted 配方：实体底、1px 描边与 md 档投影，overlay 圆角 8px；箭头复用底色和边界。内衬纵 12 横 16（`sm` 纵 8 横 12、`lg` 纵 16 横 20），标题 14px / medium / 正文色，说明即气泡正文，14px 次级色，与标题相距 4px。触发器与关闭按钮走 Action Control 家族配方：触发器为 text 档中性描边，关闭按钮为 icon 档 ghost 面，悬停与按下沿画布承载阶梯换底，Space / Enter 与触屏按住期间投影 `data-pressed`，与指针按下同一副按压面。系统减少透明度、高对比与强制色时，原位切换为实体表面；打印时收起交互浮层。

### 组合

- 触发器使用[按钮](./button)；长内容使用[滚动区域](./scroll-area)。

### 最佳实践

- 打开后焦点进入浮层，Escape 关闭并归还焦点。
- 模态浮层关闭时，滚动锁与背景失活保留到真实退场动画结束；退场内容自身立即退出焦点与交互树。
- 内容控制在一屏内，需要滚动时应改用[抽屉](./drawer)。

### 反模式

- 悬停触发却内含按钮：指针移动过去的途中就会关闭。
- 气泡内再弹出气泡。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-popover>` |
| Vue 组件 | `XhPopoverArrow` `XhPopoverCloseTrigger` `XhPopoverContent` `XhPopoverDescription` `XhPopoverPositioner` `XhPopoverRoot` `XhPopoverTitle` `XhPopoverTrigger` |
| 组合式函数 | `usePopover` |
| 状态机 | `popoverMachine` |
| 皮肤 | `@xihan-ui/styles/popover.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `anchor` | `HTMLElement \| VirtualAnchor \| null` |  | 外部锚点：给了就锚在它上面、收起时焦点归还到它，不再取 trigger；用于由别处的按钮受控打开浮层，此时通常不渲染 trigger。 展开期间它带 aria-haspopup、aria-expanded、aria-controls，收起或换锚点时还原；点它算层内交互，不会先被判为层外交互关掉。 也收虚拟锚点：带 getBoundingClientRect() 的对象（指针落点、文本选区的 Range），每次定位现读它此刻的矩形， 页面滚动、视口改尺时跟着重算。虚拟锚点接不了焦点、也写不了读屏属性：收起时焦点归还给 trigger， 没有 trigger 时回到打开前的焦点持有者；换一个锚点对象即按新矩形重挂定位。 |
| `placement` | `Placement` |  |  |
| `crossOffset` | `number` |  | 交叉轴上再挪多少，缺省 0。正值往交叉轴的结束方向挪：落在上下两侧时往行内结束方向（RTL 下向左）， 落在左右两侧时往下；先于翻面与贴边挪位，箭头仍对着触发器中心。 |
| `flip` | `boolean` |  | 空间不足时翻到对侧，默认 true；false 时守着 placement 那一侧，交叉轴贴边挪位照旧。 |
| `boundary` | `Element \| VirtualAnchor \| null` |  | 碰撞边界：浮层只在这块区域与视口的交集里摆，翻面、贴边挪位与可用空间都以交集为界。 收元素或带 getBoundingClientRect() 的对象；缺省只受视口与裁剪祖先约束。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  |  |
| `modal` | `boolean` |  | 模态浮层陷入焦点；默认 false（非模态，Tab 可离开）。 |
| `initialFocus` | `string` |  | 展开后先聚焦到 content 内匹配该选择器的元素；没给、或选择器不匹配时按 Tab 序列落到第一个可聚焦元素。 模态与非模态都生效：浮层展开时焦点总会进入 content。 |
| `restoreFocus` | `boolean` |  | 收起时把焦点归还给 trigger（给了元素锚点时归还给它），默认 true。 Tab 与层外交互收起时焦点已经去了别处，一向不抢回，与这个开关无关。 |
| `lazyMount` | `boolean` |  | 第一次打开时才挂载 content 里的内容，默认 false。页面上 Popover 很多（表格每行一个）时， 收起态每个实例背着的整份内容是挂载开销的大头。positioner 与 content 节点照旧常驻，trigger 的 aria-controls 始终指得到它。 |
| `unmountOnExit` | `boolean` |  | 收起动画播完后卸载 content 里的内容，默认 false；下次打开重新挂载，内容里的组件状态与输入随之丢掉。 |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  |  |
| `disabled` | `boolean` |  | 浮层不可打开：触发器转原生 disabled，点按与命令式 setOpen(true) 都不展开；展开途中转为禁用即收起。 与 Tooltip、HoverCard 的 disabled 同名同义：关掉的是浮层这件事。受控写回 open 仍按宿主的意思来。 |
| `parts` | `TitleDescriptionParts` |  | 作者实际渲染了哪些部件，由适配器统计；省略即按都在场处理（服务端直出与挂载前）。 title 不在场时 content 不写 aria-labelledby，名字由作者在 content 上写 aria-label； description 不在场、或渲染了但读不出一句话（判断同 `hasNamingContent`）时不写 aria-describedby。 |
| `translations` | `Partial<PopoverTranslations>` |  |  |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定面板的内边距档位。 |
| `onOpenChange` | `(details: PopoverOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onExitComplete` | `() => void` |  | 退场动画播完（或没有退场动画），且本层的层、消解层、焦点域与模态资源全部释放后通知；卸载和退场途中重开不通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `PopoverOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |
| `exit-complete` | — | 退场动画播完、本层资源全部释放；卸载和退场途中重开不派发 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhPopoverRoot` | `default` | `PopoverRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhPopoverPositioner` | `container` | `() => Element \| null` |  | 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 |
| `XhPopoverRoot` | `children` | `SlotChildren<PopoverRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `PRESS.START` · `PRESS.END`

**判据**：`isOpenControlled` · `isDisabled`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getCloseTriggerProps` | `() => T['button']` |  |
| `getArrowProps` | `() => T['element']` |  |
| `isContentMounted` | `(present: boolean) => boolean` | content 里的内容此刻该不该挂载。`present` 是适配器的退场闸门：打开中或收起动画还没播完为真。 缺省恒为真；lazyMount 下没打开过为假；unmountOnExit 下闸门落下（退场播完）即为假。 positioner 与 content 节点不受它管，一向常驻。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 切换开合，展开时把焦点移入 content |
| `Escape` | open | 关闭并把焦点还给 trigger |
| `Tab` | open 且 modal | 在 content 内向后循环焦点 |
| `Shift+Tab` | open 且 modal | 在 content 内向前循环焦点 |
| `Enter` / `Space` | held in trigger / close-trigger | 按住期间该按钮投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或浮层收起撤下 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `content` | `aria-describedby` | `description` 部件的 id（条件成立时才出现） |
| `content` | `aria-hidden` | 'true'（条件成立时才出现） |
| `content` | `aria-labelledby` | `title` 部件的 id（条件成立时才出现） |
| `content` | `aria-modal` | 'true' \| 'false' |
| `content` | `role` | 'dialog' |
| `close-trigger` | `aria-label` | translations.close |
| `arrow` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/popover.css` 按 `[data-scope="popover"][data-part="trigger"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-popover` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-pressed` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'text' |
| `trigger` | `data-xh-action-size` | 'md' |
| `trigger` | `data-xh-action-variant` | 'outline' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-instant` | ''（条件成立时才出现） |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `content` | `data-xh-material` | 'frosted' |
| `close-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `close-trigger` | `data-xh-action-control` | '' |
| `close-trigger` | `data-xh-action-display` | 'always' |
| `close-trigger` | `data-xh-action-profile` | 'icon' |
| `close-trigger` | `data-xh-action-size` | 'sm' |
| `close-trigger` | `data-xh-action-variant` | 'ghost' |
| `arrow` | `data-placement` | 定位引擎算出的实际落位 |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-popover-arrow-size` | `arrow` | `--xh-_overlay-arrow-size` | `default` | `--xh-overlay-arrow-size` | popover 的 arrow 部件 --xh-_overlay-arrow-size 覆盖槽。 |
| `--xh-popover-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `xh-material=frosted` | `--xh-_material-backdrop` | popover 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-popover-bg` | `arrow`<br>`content` | `background` | `default`<br>`not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-bg`<br>`--xh-material-frosted-bg` | popover 的 arrow、content 部件 background 覆盖槽。 |
| `--xh-popover-border` | `arrow`<br>`content` | `border` | `default`<br>`not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-border`<br>`--xh-material-frosted-border` | popover 的 arrow、content 部件 border 覆盖槽。 |
| `--xh-popover-close-bg-hover` | `close-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | popover 的 close-trigger 部件 background-color 覆盖槽。 |
| `--xh-popover-close-bg-pressed` | `close-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | popover 的 close-trigger 部件 background-color 覆盖槽。 |
| `--xh-popover-close-fg` | `close-trigger` | `color` | `default` | `--xh-material-frosted-fg-muted` | popover 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-popover-close-fg-hover` | `close-trigger` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed` | popover 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-popover-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` | popover 的 close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-popover-close-size` | `close-trigger`<br>`content`<br>`title` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default`<br>`has([data-scope='popover'][data-part='close-trigger'])`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size`<br>`--xh-control-h-sm` | popover 的 close-trigger、content、title 部件 block-size、inline-size、padding-inline-end 覆盖槽。 |
| `--xh-popover-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | popover 的 description 部件 color 覆盖槽。 |
| `--xh-popover-description-font-size` | `description` | `font-size` | `default` | `--xh-text-body-size` | popover 的 description 部件 font-size 覆盖槽。 |
| `--xh-popover-fg` | `content` | `color` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-fg` | popover 的 content 部件 color 覆盖槽。 |
| `--xh-popover-gap` | `content` | `gap` | `default` | `--xh-space-1` | popover 的 content 部件 gap 覆盖槽。 |
| `--xh-popover-icon-size` | `close-trigger`<br>`content`<br>`trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-xs` | popover 的 close-trigger、content、trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-popover-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | popover 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-popover-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-max-h` | popover 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-popover-max-w` | `content` | `max-inline-size` | `default` | `--xh-_popover-max-w` | popover 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-popover-px` | `content` | `padding-inline` | `default` | `--xh-_popover-px` | popover 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-popover-py` | `content` | `padding-block` | `default` | `--xh-_popover-py` | popover 的 content 部件 padding-block 覆盖槽。 |
| `--xh-popover-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` | popover 的 content 部件 border-radius 覆盖槽。 |
| `--xh-popover-shadow` | `content` | `box-shadow` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-shadow` | popover 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-popover-title-fg` | `title` | `color` | `default` | `--xh-material-frosted-fg` | popover 的 title 部件 color 覆盖槽。 |
| `--xh-popover-title-font-size` | `title` | `font-size` | `default` | `--xh-text-label-size` | popover 的 title 部件 font-size 覆盖槽。 |
| `--xh-popover-title-font-weight` | `title` | `font-weight` | `default` | `--xh-font-weight-medium` | popover 的 title 部件 font-weight 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 出现（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-overlay-pop-in` · `xh-pop-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
