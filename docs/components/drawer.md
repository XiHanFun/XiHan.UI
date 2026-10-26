# Drawer 抽屉

从屏幕某一边滑出的面板。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/drawer" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/drawer.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/drawer" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/drawer" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/drawer.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

不传 open 即为非受控；Escape 关闭、Tab 在面板内循环，展开期间页面不可滚动

<XhDemo src="drawer/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="drawer"`：**`root`** · `trigger` · `backdrop` · `positioner` · **`content`** · `header` · `title` · `description` · `body` · `footer` · `confirm-trigger` · `cancel-trigger` · `close-trigger` · `resize-trigger`

## 示例

### 贴边方向

side 只写为 data-side，面板贴在哪条边由皮肤按该值决定；root 与 content 报告的是同一条边

<XhDemo src="drawer/02-side" />

### 受控

传入 open 后由宿主决定；Escape、点击面板外、按关闭按钮都只回写 open，不自行修改状态

<XhDemo src="drawer/03-controlled" />

### 尺寸

size 写为 content 的 data-size，只改变面板贴边方向上的厚度；三档各自一个抽屉，打开后才可见厚度差异

<XhDemo src="drawer/04-size" />

### 头尾固定、正文滚动

header / body / footer 把面板切为三段：头与尾固定在原处，只有正文一段滚动

<XhDemo src="drawer/05-scroll" />

### 关闭前拦截

受控时组件不自行修改状态：Escape、点击面板外、按关闭按钮都只发一次收起意图，是否写回由宿主决定

<XhDemo src="drawer/06-guard" />

### 调整厚度

resizable 在朝向页面的那条边上放一根把手：拖动或用方向键推，厚度夹在 minPanelSize 与 maxPanelSize 之间；受控的 panelSize 读写当前厚度

<XhDemo src="drawer/07-resize" />

### 局部抽屉

把抽屉收进某块区域：遮罩与定位层从 fixed 换为 absolute，只覆盖该区域而不是整屏

<XhDemo src="drawer/08-contained" />

### props 写法

不写结构时按标准结构铺：标题与触发器文字两项，正文另给；页脚的取消与确定照铺，点确定记一次「应用」

<XhDemo src="drawer/09-props" />

## 设计指引

### 何时使用

- 内容比对话框长（完整表单、详情），但仍属于当前上下文。
- 窄屏上的导航或筛选面板。

### 何时不用

- 只确认一件事时，使用[对话框](./dialog)或[弹出确认](./popconfirm)。
- 内容需要与页面主体对照查看时，并排展开，不遮挡。

### 特性

- `side` 决定滑出方向；`contained` 让它只占据某个容器而不是整个视口。
- 焦点进入时落在 `initialFocus`；没给时落在内容里第一个可聚焦的控件上，越过关闭钮与改尺把手（除它们之外没有可聚焦的才落在关闭钮上）。关闭后归还触发器。
- `role` 写成 `alertdialog` 时内容是警示对话框：读屏用更强的语气，点外面不关。Web Components 侧的属性是 `dialog-role`：`role` 是 HTML 全局属性，写在宿主上宿主本身就成了对话框，连同里面的触发钮。
- `modal=false` 时不渲染遮罩，定位层也不截获页面指针；页面可以与抽屉并行交互。展开期间切换 `modal`，滚动锁、背景失活与焦点陷阱会同步切换。
- `resizable` 在朝向页面的那条边上放一根改尺把手（`resize-trigger`，role=separator）：拖动它面板沿贴边方向变宽（左右放置）或变高（上下放置），聚焦后方向键推一步（8px）、Shift 大步（40px）、Home / End 推到下限与上限。推向页面那一侧变厚：从右往左排版时 `right` 贴在屏幕左边，把手与推的方向一起翻过来。厚度夹在 `minPanelSize`（缺省 160）与 `maxPanelSize` 之间，且不超出视口（`contained` 时是所在容器）。`panelSize` / `defaultPanelSize` / `onPanelSizeChange` 走受控与非受控；没调过时面板按 `size` 档绘制。拖动走 `@xihan-ui/pointer` 的指针会话，步长与 Resizable 同一档。把手是 content 里的绝对定位节点，content 自己滚动（不用 body 段）时它会随内容滚走，长内容请放进 body。
- 关闭时内容立即失活并退出可访问树；面板与遮罩全部完成退场后释放模态资源并发出 `onExitComplete` / `exit-complete`。退场中重开不会被旧完成关闭，卸载立即清理。
- 内容第一次打开才挂载，缺省在退场动画播完后卸载、下次打开重新挂载。反复开合而内容又重时（设置面板、长表单）把 `unmountOnExit` 设为 false：打开过之后收起只隐藏——定位层以内联 `display: none` 收起、遮罩不留、Portal 视觉桥断开——面板里的组件状态、输入与滚动位置都留着，再打开不必重挂。Web Components 的作者节点一向常驻；写进 content 里一个 `<template>` 的内容按同一规则挂卸：第一次打开克隆，缺省退场播完撤走，`unmount-on-exit="false"` 时克隆一次之后常驻。
- 关闭前可以拦截，例如有未保存改动时先确认。
- 面板走 sheet 三件套（1px 描边、不透明底、单层投影），边界由描边承担，不只靠影分层；贴住视口的两个角不取圆角、朝向页面的两个角取浮层圆角，不叠渐变与顶光。分三段时头部是一条 48px 的带（紧凑档 44px），三段横向内衬 16px，正文纵 12、尾段纵 16，头下、尾上各一条贴边的 1px 内部分隔线；不分三段时标题行同样落在顶上那条 48px 带的中线上。入场是整面板从画外推入的大尺度位移，走 slide 时长与曲线，退场仍走 exit 档。
- 触发器与关闭按钮走 Action Control 家族配方：触发器为 text 档中性描边，展开期间压住为悬停同档的中性面；关闭按钮为 icon 档 ghost 面，悬停与按下沿画布承载阶梯换底；Space / Enter 与触屏按住期间投影 `data-pressed`。关闭钮的叉 12px，距右 16px、落在头部带的中线上。标题取页面级面板标题档（heading-3）、正文色，说明文字为 13px 说明档。
- Body 是模态滚动面：滚到头不带动页面，内容高度变化时保留稳定的滚动条空道；不用三段结构时 content 自身是唯一滚动层。
- 不写子内容时按标准结构铺：`title`、`description` 与触发器文字给出页头与触发器（Vue 是 `trigger-text`，React 是 `trigger`，Web Components 是 `title-text`、`description`、`trigger-text` 三个属性），页脚铺取消与确定两颗钮；`actions` 换成只有确定（`alert`）或不铺（`none`），`confirmText` / `cancelText` 改字，缺省取语言包里 `translations.drawer` 的 `ok` / `cancel`。正文与整段页脚经 `body`、`footer` 插槽给出（React 是同名属性，Web Components 是 `slot="body"` / `slot="footer"` 的节点）。一个组件加三个 prop 就是一个确认抽屉。
- 确定钮发 `confirm`：`onConfirm` 返回 Promise 时抽屉等它兑现才收起、确定钮转圈，期间 Escape 与点外面关不掉，拒绝则留在原地并发 `confirm-error`（Web Components 把异步动作交给 `confirmAction` 属性，`confirm` 事件只作通知）。取消钮发 `cancel-press` 并收起；关闭钮随时收得起，挂起中的确认随之作废。手写部件时 `XhDrawerConfirmTrigger` / `XhDrawerCancelTrigger` 是同一对按钮，组合写法照旧。

### 组合

- 内部放[表单](./form)、[侧栏导航](./side-nav)；内容区使用[滚动区域](./scroll-area)。

### 最佳实践

- 提交与取消固定在底部，用户不需要滚动到底部查找。
- 有未保存改动时拦截关闭。

### 反模式

- 在抽屉内再打开抽屉。
- 在宽屏上用抽屉承载可以直接展开的内容。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-drawer>` |
| Vue 组件 | `XhDrawerBody` `XhDrawerCancelTrigger` `XhDrawerCloseTrigger` `XhDrawerConfirmTrigger` `XhDrawerContent` `XhDrawerDescription` `XhDrawerFooter` `XhDrawerHeader` `XhDrawerResizeTrigger` `XhDrawerRoot` `XhDrawerTitle` `XhDrawerTrigger` |
| 组合式函数 | `useDrawer` |
| 状态机 | `drawerMachine` |
| 皮肤 | `@xihan-ui/styles/drawer.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `modal` | `boolean` |  | 是否启用模态约束，默认 true。false 时不提供遮罩，页面其余部分保持可交互； 展开期间可以切换，滚动锁、背景失活与焦点陷阱会同步更新。 |
| `contained` | `boolean` |  | 浮层挂在局部容器中而不是视口：遮罩与定位层从 fixed 改为 absolute， 因此只覆盖该容器、不再覆盖整屏。 挂到哪个容器由适配器决定（Vue 由 root 的 container 决定，WC 本身是 Light DOM、 作者写在何处即在何处），这里只表达按局部容器绘制这一点。 |
| `side` | `DrawerSide` |  | 滑出的边，默认 'right'。只影响输出的 data-side，不参与状态转移。 |
| `role` | `'dialog' \| 'alertdialog'` |  |  |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  |  |
| `restoreFocus` | `boolean` |  |  |
| `size` | `Size` |  | 尺寸：sm / md / lg。横向放置时影响面板宽度、纵向放置时影响面板高度，随 side 而定。 |
| `variant` | `OverlayBackdropVariant` |  | 遮罩形态：opaque / blur / transparent。写在 backdrop 上，只影响该层的底色与模糊。 |
| `unmountOnExit` | `boolean` |  | 收起动画播完后卸载内容，默认 true。内容总是第一次打开才挂载；设为 false 时此后收起只隐藏、不卸载， 再打开不重挂：内容里的组件状态、输入与滚动位置都留着，重开也不再付一遍挂载开销。 适合反复开合、内容又重（设置面板、长表单）的抽屉。 |
| `parts` | `TitleDescriptionParts` |  | 作者实际渲染了哪些部件，由适配器统计；省略即按都在场处理（服务端直出与挂载前）。 title 不在场时 content 不写 aria-labelledby，名字由作者在 content 上写 aria-label； description 不在场、或渲染了但读不出一句话（判断同 `hasNamingContent`）时不写 aria-describedby。 |
| `translations` | `Partial<DrawerTranslations>` |  |  |
| `onOpenChange` | `(details: DrawerOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onExitComplete` | `() => void` |  | 退出动画结束或取消，且本层资源全部释放后通知；卸载和重新打开不通知。 |
| `resizable` | `boolean` |  | 可调厚度：朝向页面的那条边上的 resize-trigger 拖动或用方向键推，面板沿贴边方向变宽（左右放置）或变高（上下放置）。 默认 false。厚度夹在 minPanelSize 与 maxPanelSize 之间，且不超出视口（contained 时是所在容器）。 |
| `panelSize` | `number` |  | 受控厚度（像素）；未提供即非受控。没有值时面板按 size 档的厚度绘制。 |
| `defaultPanelSize` | `number` |  | 非受控的初始厚度（像素）；不给即按 size 档。 |
| `minPanelSize` | `number` |  | 厚度下限（像素），默认 160。 |
| `maxPanelSize` | `number` |  | 厚度上限（像素）；不给时只受视口（或所在容器）限制。 |
| `onPanelSizeChange` | `(details: DrawerPanelSizeChangeDetails) => void` |  | 厚度变化意图：拖动途中连续发出，键盘每推一步发一次。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `confirm` | `CustomEvent` | 点了确定钮；随后收起。异步门经 confirmAction 属性：事件拿不到监听函数的返回值， 给元素赋 `confirmAction = () =&gt; thenable` 即挂起确认门，confirm 事件照发只作通知 |
| `confirm-error` | `CustomEvent` | 确认动作同步抛出或 thenable 拒绝；detail 为 `{ cause }`，保留原始原因 |
| `cancel-press` | `CustomEvent` | 点了取消钮；随后收起。Escape、层外交互与关闭钮只发 open-change |
| `exit-complete` | `CustomEvent` | 退出完成且本层资源已释放 |
| `panel-size-change` | `CustomEvent` | 厚度变化意图；detail 为 `{ panelSize: number }` |
| `open-change` | `DrawerOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhDrawerRoot` | `default` | `DrawerRootSlotProps` |  |
| `XhDrawerRoot` | `trigger` | — | 触发按钮的内容，压过 trigger-text。 |
| `XhDrawerRoot` | `title` | — | 标题，压过 title。 |
| `XhDrawerRoot` | `description` | — | 说明，压过 description。 |
| `XhDrawerRoot` | `body` | — | 正文：面板里唯一会滚动的段。 |
| `XhDrawerRoot` | `footer` | — | 整段页脚：写了它，取消与确定两颗钮不再代铺。 |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhDrawerRoot` | `container` | `() => Element \| null` |  | 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 提供后即为局部抽屉：遮罩与定位层从 fixed 换为 absolute，只覆盖该容器而不是整屏。 该容器要自带 position（relative 等），否则 absolute 会向上找到其他定位祖先。 |
| `XhDrawerRoot` | `trigger` | `ReactNode` |  | 触发按钮的内容。不给时不铺触发器，开合交给受控的 open。 |
| `XhDrawerRoot` | `title` | `ReactNode` |  | 标题。 |
| `XhDrawerRoot` | `description` | `ReactNode` |  | 标题下的说明。 |
| `XhDrawerRoot` | `body` | `ReactNode` |  | 正文：面板里唯一会滚动的段。 |
| `XhDrawerRoot` | `footer` | `ReactNode` |  | 整段页脚：给了它，取消与确定两颗钮不再代铺。 |
| `XhDrawerRoot` | `actions` | `DrawerStructureActions` |  | 页脚铺哪几颗钮：confirm（取消 + 确定，缺省）、alert（只有确定）、none。 |
| `XhDrawerRoot` | `confirmText` | `string` |  | 确定钮的文字，缺省取语言包。 |
| `XhDrawerRoot` | `cancelText` | `string` |  | 取消钮的文字，缺省取语言包。 |
| `XhDrawerRoot` | `onConfirm` | `DrawerActionIntents['onConfirm']` |  | 点了确定钮。返回 thenable 即挂起：抽屉等它兑现才收起、确定钮转圈， 拒绝则保持打开并经 onConfirmError 报告。同步返回照常立即收起。 |
| `XhDrawerRoot` | `onConfirmError` | `DrawerActionIntents['onConfirmError']` |  | 确认回调同步抛出或 thenable 拒绝；details.cause 是原始原因。 |
| `XhDrawerRoot` | `onCancelPress` | `DrawerActionIntents['onCancelPress']` |  | 点了取消钮，随后抽屉收起。Escape、层外交互与关闭钮不发它。 |
| `XhDrawerRoot` | `children` | `SlotChildren<DrawerRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `backdrop` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`RESIZE.START` · `RESIZE.NUDGE` · `RESIZE.TO_BOUND` · `RESIZE.MEASURE`

**判据**：`canResize`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `panelSize` | `number \| null` | 当前厚度；没被调过、也没给初值时为 null。 |
| `resizing` | `boolean` | 正在被指针调厚度。 |
| `side` | `DrawerSide` | 已解析的滑出边（prop 未提供时是默认值），作者据此配置动画。 |
| `pending` | `boolean` | 异步确认进行中：确认钮转圈、再次点击无效，Escape 与层外交互不收起抽屉。 |
| `actionError` | `DrawerConfirmErrorDetails \| null` | 最近一次确认动作的错误；新确认或取消时清空。 |
| `setOpen` | `(next: boolean) => void` | 确认异步挂起期间，收起只能经取消钮或关闭钮：程序与触发器的 setOpen(false) 无效。 |
| `confirm` | `() => void` | 发出确认意图，确认落定后收起；异步确认挂起期间再次调用无效。 |
| `cancel` | `() => void` | 发出取消意图并收起；挂起中的确认作废。 |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getBackdropProps` | `() => T['element']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getBodyProps` | `() => T['element']` |  |
| `getFooterProps` | `() => T['element']` |  |
| `getConfirmTriggerProps` | `() => T['button']` | 确认钮：页脚的主动作，solid；异步确认挂起时转圈。 |
| `getCancelTriggerProps` | `() => T['button']` | 取消钮：页脚的次要出口，outline。 |
| `getCloseTriggerProps` | `() => T['button']` |  |
| `getResizeTriggerProps` | `() => T['element']` | 改尺把手：role=separator，落在朝向页面的那条边上；没开 resizable 时带 hidden。 |
| `isContentMounted` | `(present: boolean) => boolean` | 浮层此刻该不该挂载。`present` 是适配器的退场闸门：打开中或收起动画还没播完为真。 没打开过恒为假；unmountOnExit 为 false 时打开过之后恒为真，闸门落下的那段由适配器隐藏而不卸载。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 打开抽屉并把焦点移入 content |
| `Escape` | open | 关闭并把焦点还给 trigger |
| `Tab` | open 且 modal | 在 content 内向后循环焦点 |
| `Shift+Tab` | open 且 modal | 在 content 内向前循环焦点 |
| `Enter` / `Space` | held in trigger / close-trigger | 按住期间该按钮投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或抽屉收起撤下 |
| `ArrowLeft` / `ArrowRight` / `ArrowUp` / `ArrowDown` | focus in resize-trigger, resizable | 按屏幕方向推把手一步（8px）：推向页面那一侧变厚、推向贴边那一侧变薄；左右放置只认左右键、上下放置只认上下键；夹在上下限之间 |
| `Shift+ArrowLeft` / `Shift+ArrowRight` / `Shift+ArrowUp` / `Shift+ArrowDown` | focus in resize-trigger, resizable | 按大步长推（40px） |
| `Home` / `End` | focus in resize-trigger, resizable | Home 推到厚度下限，End 推到上限（没给上限时推到视口或所在容器能放下的最大厚度） |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `content` | `aria-describedby` | `description` 部件的 id \| undefined |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-labelledby` | `title` 部件的 id \| undefined |
| `content` | `aria-modal` | 'true' \| 'false' |
| `content` | `role` | props.role |
| `confirm-trigger` | `aria-busy` | 'true' \| undefined |
| `confirm-trigger` | `aria-disabled` | 'true' \| undefined |
| `close-trigger` | `aria-label` | translations.close |
| `resize-trigger` | `aria-controls` | `content` 部件的 id |
| `resize-trigger` | `aria-label` | translations.resizeTrigger |
| `resize-trigger` | `aria-orientation` | 'vertical' \| 'horizontal' |
| `resize-trigger` | `aria-valuemax` | String(max) \| undefined |
| `resize-trigger` | `aria-valuemin` | String(min) |
| `resize-trigger` | `aria-valuenow` | String(now) \| undefined |
| `resize-trigger` | `role` | 'separator' |

## 样式参考

### 皮肤

`@xihan-ui/styles/drawer.css` 按 `[data-scope="drawer"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-drawer` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-contained` | ''（条件成立时才出现） |
| `root` | `data-side` | props.side |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-pressed` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'text' |
| `trigger` | `data-xh-action-size` | 'md' |
| `trigger` | `data-xh-action-variant` | 'outline' |
| `backdrop` | `data-contained` | ''（条件成立时才出现） |
| `backdrop` | `data-instant` | ''（条件成立时才出现） |
| `backdrop` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-variant` | props.variant |
| `positioner` | `data-contained` | ''（条件成立时才出现） |
| `positioner` | `data-positioned` | '' |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-contained` | ''（条件成立时才出现） |
| `content` | `data-instant` | ''（条件成立时才出现） |
| `content` | `data-resizing` | ''（条件成立时才出现） |
| `content` | `data-side` | props.side |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `confirm-trigger` | `data-loading` | ''（条件成立时才出现） |
| `confirm-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `confirm-trigger` | `data-xh-action-control` | '' |
| `confirm-trigger` | `data-xh-action-display` | 'always' |
| `confirm-trigger` | `data-xh-action-profile` | 'text' |
| `confirm-trigger` | `data-xh-action-size` | 'md' |
| `confirm-trigger` | `data-xh-action-variant` | 'solid' |
| `confirm-trigger` | `data-xh-ink-surface` | '' |
| `confirm-trigger` | `data-xh-loading-ring` | 'overlay' |
| `cancel-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `cancel-trigger` | `data-xh-action-control` | '' |
| `cancel-trigger` | `data-xh-action-display` | 'always' |
| `cancel-trigger` | `data-xh-action-profile` | 'text' |
| `cancel-trigger` | `data-xh-action-size` | 'md' |
| `cancel-trigger` | `data-xh-action-variant` | 'outline' |
| `close-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `close-trigger` | `data-xh-action-control` | '' |
| `close-trigger` | `data-xh-action-display` | 'always' |
| `close-trigger` | `data-xh-action-profile` | 'icon' |
| `close-trigger` | `data-xh-action-size` | 'sm' |
| `close-trigger` | `data-xh-action-variant` | 'ghost' |
| `resize-trigger` | `data-resizing` | ''（条件成立时才出现） |
| `resize-trigger` | `data-side` | props.side |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-drawer-backdrop-bg` | `backdrop` | `background` | `default` | `--xh-bg-overlay` | drawer 的 backdrop 部件 background 覆盖槽。 |
| `--xh-drawer-backdrop-blur` | `backdrop` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `variant=blur` | `--xh-overlay-backdrop-blur` | drawer 的 backdrop 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-drawer-backdrop-layer` | `backdrop` | `z-index` | `default` | `--xh-_layer` | drawer 的 backdrop 部件 z-index 覆盖槽。 |
| `--xh-drawer-bg` | `content` | `background` | `default` | `--xh-material-elevated-bg` | drawer 的 content 部件 background 覆盖槽。 |
| `--xh-drawer-body-px` | `body` | `padding-inline` | `default` | `--xh-surface-px-sm` | drawer 的 body 部件 padding-inline 覆盖槽。 |
| `--xh-drawer-body-py` | `body` | `padding-block` | `default` | `--xh-surface-py-sm` | drawer 的 body 部件 padding-block 覆盖槽。 |
| `--xh-drawer-border` | `content` | `border` | `default` | `--xh-material-elevated-border` | drawer 的 content 部件 border 覆盖槽。 |
| `--xh-drawer-close-bg-active` | `close-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | drawer 的 close-trigger 部件 background-color 覆盖槽。 |
| `--xh-drawer-close-bg-focus` | `close-trigger` | `background-color` | `focus-visible` | `--xh-_action-variant-bg-focus-visible` | drawer 的 close-trigger 部件 background-color 覆盖槽。 |
| `--xh-drawer-close-bg-hover` | `close-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | drawer 的 close-trigger 部件 background-color 覆盖槽。 |
| `--xh-drawer-close-fg` | `close-trigger` | `color` | `default` | `--xh-fg-muted` | drawer 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-drawer-close-fg-focus` | `close-trigger` | `color` | `focus-visible` | `--xh-drawer-close-fg-hover` | drawer 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-drawer-close-fg-hover` | `close-trigger` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed` | drawer 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-drawer-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` | drawer 的 close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-drawer-close-size` | `close-trigger`<br>`content`<br>`title` | `block-size`<br>`inline-size`<br>`inset-block-start`<br>`padding-inline-end` | `default`<br>`has([data-scope='drawer'][data-part='close-trigger'])`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size`<br>`--xh-control-h-sm` | drawer 的 close-trigger、content、title 部件 block-size、inline-size、inset-block-start、padding-inline-end 覆盖槽。 |
| `--xh-drawer-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | drawer 的 description 部件 color 覆盖槽。 |
| `--xh-drawer-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` | drawer 的 description 部件 font-size 覆盖槽。 |
| `--xh-drawer-fg` | `content` | `color` | `default` | `--xh-material-elevated-fg` | drawer 的 content 部件 color 覆盖槽。 |
| `--xh-drawer-footer-gap` | `footer` | `gap` | `default` | `--xh-control-gap-md` | drawer 的 footer 部件 gap 覆盖槽。 |
| `--xh-drawer-footer-pt` | `footer` | `padding-block-start` | `default` | `--xh-space-2` | drawer 的 footer 部件 padding-block-start 覆盖槽。 |
| `--xh-drawer-footer-px` | `content`<br>`footer` | `padding-inline` | `has([data-scope='drawer'][data-part='body'])` | `--xh-surface-px-sm` | drawer 的 content、footer 部件 padding-inline 覆盖槽。 |
| `--xh-drawer-footer-py` | `content`<br>`footer` | `padding-block` | `has([data-scope='drawer'][data-part='body'])` | `--xh-overlay-sheet-footer-py` | drawer 的 content、footer 部件 padding-block 覆盖槽。 |
| `--xh-drawer-gap` | `content` | `gap` | `default` | `--xh-stack-gap-md` | drawer 的 content 部件 gap 覆盖槽。 |
| `--xh-drawer-header-gap` | `header` | `gap` | `default` | `--xh-stack-gap-sm` | drawer 的 header 部件 gap 覆盖槽。 |
| `--xh-drawer-header-pb` | `content`<br>`header` | `padding-block-end` | `default`<br>`has([data-scope='drawer'][data-part='body'])` | `--xh-_drawer-header-pb`<br>`--xh-space-2` | drawer 的 content、header 部件 padding-block-end 覆盖槽。 |
| `--xh-drawer-header-pt` | `content`<br>`header` | `padding-block-start` | `has([data-scope='drawer'][data-part='body'])` | `--xh-_drawer-header-pt` | drawer 的 content、header 部件 padding-block-start 覆盖槽。 |
| `--xh-drawer-header-px` | `content`<br>`header` | `padding-inline` | `has([data-scope='drawer'][data-part='body'])` | `--xh-surface-px-sm` | drawer 的 content、header 部件 padding-inline 覆盖槽。 |
| `--xh-drawer-icon-size` | `close-trigger`<br>`content`<br>`root`<br>`trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-xs` | drawer 的 close-trigger、content、root、trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-drawer-layer` | `content`<br>`positioner` | `z-index` | `default` | `--xh-_layer` | drawer 的 content、positioner 部件 z-index 覆盖槽。 |
| `--xh-drawer-px` | `content` | `padding-inline` | `contained`<br>`default` | `--xh-surface-px-sm` | drawer 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-drawer-py` | `content` | `padding-block-end`<br>`padding-block-start` | `contained`<br>`default` | `--xh-_drawer-header-pt`<br>`--xh-overlay-sheet-footer-py` | drawer 的 content 部件 padding-block-end、padding-block-start 覆盖槽。 |
| `--xh-drawer-radius` | `content` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `side=bottom`<br>`side=left`<br>`side=right`<br>`side=top` | `--xh-shape-overlay` | drawer 的 content 部件 border-end-end-radius、border-end-start-radius、border-start-end-radius、border-start-start-radius 覆盖槽。 |
| `--xh-drawer-resize-indicator-length` | `resize-trigger` | `block-size`<br>`inline-size` | `is([data-side='left'], [data-side='right'])`<br>`is([data-side='top'], [data-side='bottom'])`<br>`side=bottom`<br>`side=left`<br>`side=right`<br>`side=top` | `--xh-space-8` | drawer 的 resize-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-drawer-resize-indicator-thickness` | `resize-trigger` | `block-size`<br>`inline-size` | `is([data-side='left'], [data-side='right'])`<br>`is([data-side='top'], [data-side='bottom'])`<br>`side=bottom`<br>`side=left`<br>`side=right`<br>`side=top` | `--xh-stroke-strong` | drawer 的 resize-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-drawer-resize-trigger-bg` | `resize-trigger` | `background` | `default` | `--xh-border-control` | drawer 的 resize-trigger 部件 background 覆盖槽。 |
| `--xh-drawer-resize-trigger-bg-active` | `resize-trigger` | `background` | `resizing` | `--xh-bg-brand` | drawer 的 resize-trigger 部件 background 覆盖槽。 |
| `--xh-drawer-resize-trigger-bg-hover` | `resize-trigger` | `background` | `hover` | `--xh-border-control-hover` | drawer 的 resize-trigger 部件 background 覆盖槽。 |
| `--xh-drawer-resize-trigger-radius` | `resize-trigger` | `border-radius` | `default` | `--xh-shape-pill` | drawer 的 resize-trigger 部件 border-radius 覆盖槽。 |
| `--xh-drawer-resize-trigger-size` | `resize-trigger` | `block-size`<br>`inline-size` | `side=bottom`<br>`side=left`<br>`side=right`<br>`side=top` | `--xh-space-2` | drawer 的 resize-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-drawer-separator` | `content`<br>`footer`<br>`header` | `border-block-end`<br>`border-block-start` | `has([data-scope='drawer'][data-part='body'])` | `--xh-material-elevated-separator` | drawer 的 content、footer、header 部件 border-block-end、border-block-start 覆盖槽。 |
| `--xh-drawer-shadow` | `content` | `box-shadow` | `default` | `--xh-material-elevated-shadow` | drawer 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-drawer-size` | `content` | `block-size`<br>`inline-size` | `side=bottom`<br>`side=left`<br>`side=right`<br>`side=top` | `--xh-_drawer-size` | drawer 的 content 部件 block-size、inline-size 覆盖槽。 |
| `--xh-drawer-title-fg` | `title` | `color` | `default` | `--xh-fg-default` | drawer 的 title 部件 color 覆盖槽。 |
| `--xh-drawer-title-font-size` | `title` | `font-size` | `default` | `--xh-text-heading-3-size` | drawer 的 title 部件 font-size 覆盖槽。 |
| `--xh-drawer-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-heading-3-weight` | drawer 的 title 部件 font-weight 覆盖槽。 |
| `--xh-drawer-trigger-bg` | `trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`focus-visible`<br>`xh-ink-surface` | `--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-rest` | drawer 的 trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-drawer-trigger-bg-active` | `trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | drawer 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-drawer-trigger-bg-hover` | `trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | drawer 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-drawer-trigger-bg-open` | `trigger` | `--xh-ink-surface`<br>`background-color` | `focus-visible`<br>`state=open`<br>`xh-ink-surface` | `--xh-bg-subtle` | drawer 的 trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-drawer-trigger-border` | `trigger` | `border`<br>`border-color` | `default`<br>`focus-visible` | `--xh-_action-variant-border-focus-visible`<br>`--xh-_action-variant-border-rest` | drawer 的 trigger 部件 border、border-color 覆盖槽。 |
| `--xh-drawer-trigger-border-hover` | `trigger` | `border-color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-border-hover`<br>`--xh-_action-variant-border-pressed` | drawer 的 trigger 部件 border-color 覆盖槽。 |
| `--xh-drawer-trigger-border-open` | `trigger` | `border`<br>`border-color` | `focus-visible`<br>`state=open` | `--xh-border-control-hover` | drawer 的 trigger 部件 border、border-color 覆盖槽。 |
| `--xh-drawer-trigger-fg` | `trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | drawer 的 trigger 部件 color 覆盖槽。 |
| `--xh-drawer-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_action-profile-font-size` | drawer 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-drawer-trigger-font-weight` | `trigger` | `font-weight` | `default` | `--xh-text-label-weight` | drawer 的 trigger 部件 font-weight 覆盖槽。 |
| `--xh-drawer-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_action-profile-gap` | drawer 的 trigger 部件 gap 覆盖槽。 |
| `--xh-drawer-trigger-h` | `trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | drawer 的 trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-drawer-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | drawer 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-drawer-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | drawer 的 trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 出现 · 导航（整幅滑入） · 循环（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-fade-in` · `xh-fade-out` · `xh-slide-fade-in` · `xh-slide-fade-out` · `xh-slide-in` · `xh-slide-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`background-color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；只认物理方向的量乘 `--xh-direction-sign` 换向，按就近的 `dir` 走；另有按 `dir` 分支的规则。
