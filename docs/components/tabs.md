# Tabs 标签页

用于在同一区域内切换并列内容。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tabs" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tabs.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tabs" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tabs" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tabs.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

在并列内容之间切换

<XhDemo src="tabs/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="tabs"`：`root` · **`list`** · **`trigger`** · `close-trigger` · `indicator` · `separator` · `prev-trigger` · `next-trigger` · `overflow-trigger` · **`content`** · `tab-drag-trigger` · `live-region`

## 示例

### 垂直布局

用于侧栏式内容导航

<XhDemo src="tabs/02-vertical" />

### 分段变体

使用浅色标签带与浮起的选中面

<XhDemo src="tabs/03-variant" />

### 图标标签

图标辅助识别内容类别

<XhDemo src="tabs/04-prefix-suffix" />

### 禁用标签

保留暂不可用的内容入口

<XhDemo src="tabs/05-guard" />

### 分隔线

在相邻标签之间增加视觉分组

<XhDemo src="tabs/06-separator" />

### 放不下时滚动

标签带只裁主轴，两端翻页钮与滚轮把被裁掉的标签挪进视野

<XhDemo src="tabs/07-scroll" />

### 增删标签

关闭钮或 Delete 键关掉标签，新建按钮追加一枚；标签序由数据源持有

<XhDemo src="tabs/08-editable" />

### 拖拽排序

按住标签拖到新位置，或焦点在标签上按 Alt + 方向键挪一位

<XhDemo src="tabs/09-reorderable" />

### 更多下拉

标签带放不下时，行尾的更多按钮列出可见区外的标签，选中即切过去

<XhDemo src="tabs/10-overflow" />

## 设计指引

### 何时使用

- 内容属于同一对象的不同类别。
- 用户需要在少量内容面板之间切换。

### 何时不用

- 内容需要同时比较时并排展示。
- 存在先后顺序时使用[步骤条](./steps)。
- 切换单个状态时使用[切换按钮组](./toggle-group)。

### 特性

- 默认 `line` 变体使用透明标签带与底部指示线，当前页由品牌字色与指示线表达：不放 `indicator` 部件时选中标签自带一条静态线（横向贴底、纵向贴行向末端），放了部件则由部件滑动；`segment` 提供浅色标签带，选中项为带描边的白色抬起面。
- `card` 用于文档式标签。
- 支持水平、垂直、禁用与手动激活模式。
- 面板常驻并通过 `hidden` 切换，内部状态不会丢失。面板内容开销大时用 `lazyMount` 推迟到第一次选中才渲染，用 `unmountOnExit` 在选走时卸掉；两者只管面板里的内容，面板节点本身常在，标签的 `aria-controls` 始终指得到它。
- `closable` 让标签可关闭：点 `close-trigger`，或焦点在标签上按 Delete / Backspace，发出同一个 `tab-close`。库不持有标签序，只交出被关的标签与剩下的标签序，由数据源删掉；关掉的是选中标签时，选中改到哪一个也由数据源决定。
- 标签带放不下时不折行：标签整体沿主轴位移露出被裁掉的那截，两端的 `prev-trigger` / `next-trigger` 按页翻，横向滚轮（触控板两指横划、Shift + 滚轮）按滚了多少挪多少，触屏手指按在标签带上沿主轴拖即跟手平移（交叉轴仍让给页面滚动，抬手后紧跟的那次 click 不算点选），选中或聚焦的标签被裁在外面时自动挪进视野；放得下时两只翻页钮收起，`api.overflow` 为 `null`。
- 放了 `overflow-trigger` 时，标签带放不下就在它之后露出一颗「更多」按钮，点开是一张菜单，列出此刻没有整个露在可见区里的标签；选中其中一项即选中那个标签并把它挪进可见区。宽度够时按钮收起。
- 「更多」与收纳式的工具条不同：标签不会被收起。标签始终留在标签带与 tablist 里，方向键、读屏与翻页钮照样走得到；菜单只是可见区外标签的一份索引。可见区是标签带此刻露出的那一段，两端显示着的翻页钮盖住的那一截不算，半露的标签也列进菜单。所以菜单里的项随位移而换：往后翻一页，前面的标签进了菜单、后面的出来；按钮的有无只取决于全部标签放不放得下，与翻页钮同进同退。
- `reorderable` 支持指针拖动与 Alt + 方向键换位。

### 组合

- `indicator` 是滑动的当前标记：`line` 变体下是一条指示线，不放它时选中标签自画静态线，放了它静态线收起、不重复画；`segment` 变体下是那块白色抬起面，放了它选中标签自己透空、面跟着滑，不放则面长在选中标签身上；`card` 变体不用它。
- `separator` 在相邻标签之间增加分隔线。
- `close-trigger` 紧跟在所属 `trigger` 之后、与它平级（不嵌进标签按钮里），写同一个 `value`；皮肤把它收进标签面的行尾。禁用随 `collection`；不给 `collection` 时，禁用的标签在关闭钮上同样写 `disabled`。它是鼠标与触屏的入口，对读屏隐藏、不占 Tab 位，键盘用标签上的 Delete / Backspace。不写内容时由皮肤画一枚叉。
- Web Components 的面板内容由作者直接写在 DOM 里，本就已渲染；要 `lazy-mount` / `unmount-on-exit` 生效，把面板内容包进面板里的 `<template>`，元素在该渲染时把模板克隆进面板、该卸掉时移除克隆出来的节点。
- `prev-trigger` / `next-trigger` 放在 `list` 里、与标签平级（通常一头一尾），是标签带放不下时的翻页钮：鼠标专用的辅助入口，对读屏隐藏、不占 Tab 位——键盘用方向键在标签间移动，标签带自己跟着焦点挪；不放它们时滚轮与焦点跟随照常工作。不写内容时由皮肤画一枚 chevron，盖底缺省取 surface，标签页坐在别的面上时改 `--xh-tabs-scroll-trigger-bg`。
- `overflow-trigger` 放在 `root` 里、紧跟 `list` 之后，不放进 `list`：tablist 只收标签。它排在标签带的行尾（竖排是列尾），可以与翻页钮同时使用，也可以单独使用。它自占一个 Tab 位，不是方向键走位的一站：从标签带往后按 Tab 先到它、再到面板，方向键只在标签之间走。Enter、Space 或下方向键展开菜单并落到首项，上方向键落到末项；Escape 收起菜单，焦点回到按钮；选中一项后菜单收起，焦点同样回到按钮。菜单里的文字取标签的 `aria-label`，没有时取标签文字；禁用的标签在菜单里同样禁用。不写内容时由皮肤画一枚横排三点，可及名缺省为 `More tabs`，用 `translations.overflowTrigger` 换成本地文案。
- Web Components 只写一颗空的 `<button data-xh-part="overflow-trigger">`，菜单的浮层与条目由元素自己建。

### 最佳实践

- 标签数量控制在七个以内；确实更多（按数据生成的标签）时放上两端翻页钮，并把选中标签同步给 `value`，让它首帧就露在视野里。
- 标签很多、用户需要直接跳到远处的某一个时再放 `overflow-trigger`：翻页钮适合顺序浏览，「更多」菜单适合按名字直达。
- 需要保留选择时，将当前标签同步到地址。

### 反模式

- 不要嵌套标签页。
- 不要把 `overflow-trigger` 放进 `list`：tablist 里只能有标签，放进去是无效的 ARIA 结构。
- 避免面板高度差异过大造成布局跳动。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tabs>` |
| Vue 组件 | `XhTabsCloseTrigger` `XhTabsContent` `XhTabsIndicator` `XhTabsList` `XhTabsLiveRegion` `XhTabsNextTrigger` `XhTabsOverflowTrigger` `XhTabsPrevTrigger` `XhTabsRoot` `XhTabsSeparator` `XhTabsTabDragTrigger` `XhTabsTrigger` |
| 组合式函数 | `useTabs` |
| 状态机 | `tabsMachine` |
| 皮肤 | `@xihan-ui/styles/tabs.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `TabsNode[]` |  | 条目数据，标签文本与禁用的事实源。提供后 trigger 部件只需声明 value。 未提供时回到文本与禁用都写在 trigger 上的方式。 |
| `value` | `string \| null` |  | 选中值。提供即受控：内部不再自行修改，只发 onValueChange。 |
| `defaultValue` | `string \| null` |  |  |
| `orientation` | `Orientation` |  | 方向键轴向，默认 horizontal；不同轴的方向键放行给页面滚动与读屏。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只影响水平轴上 ArrowLeft / ArrowRight 的前后语义。 |
| `activationMode` | `TabsActivationMode` |  | 方向键移动焦点时是否同时切换选中，默认 automatic。 |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 true。 |
| `variant` | `TabsVariant` |  | 变体：line / card / segment，决定选中态的绘制方式。默认 line。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `reorderable` | `boolean` |  | 标签可以拖动换位。整个标签都是拖动源，不另设把手。 顺序不进入状态机：collection 是 prop，库没有自己的标签序可写，只发 onTabMove。 |
| `onTabMove` | `(details: TabsMoveDetails) => void` |  |  |
| `closable` | `boolean` |  | 标签可关闭：点 close-trigger，或焦点在标签上按 Delete / Backspace，即发 onTabClose。 库不持有标签序，只发意图，是否删除由数据源决定。 |
| `onTabClose` | `(details: TabsCloseDetails) => void` |  | 标签被关闭。 |
| `lazyMount` | `boolean` |  | 面板内容等到对应标签第一次被选中才渲染，默认 false（全部面板首帧即渲染）。 面板节点本身常在，只推迟里面的内容。 |
| `unmountOnExit` | `boolean` |  | 标签被选走后卸掉面板内容，默认 false（选走只 hidden，内容与其状态留着）。 与 lazyMount 同开时只有选中面板有内容。 |
| `translations` | `Partial<TabsTranslations>` |  |  |
| `onValueChange` | `(details: TabsValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 |

### TabsNode

`collection` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | 是 |  |
| `label` | `string` |  | 标签上的文本；默认回退为 value。 |
| `disabled` | `boolean` |  | 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TabsValueChangeDetails` | 选中值变化；detail 为 `{ value: string \| null }` |
| `tab-move` | `TabsMoveDetails` | 标签换位；detail 为 `{ value, from, to, values }`，values 是重排后的整份标签序 |
| `tab-close` | `TabsCloseDetails` | 标签被关闭；detail 为 `{ value, values }`，values 是关闭该标签之后剩余的标签序 |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhTabsCloseTrigger` | `value` | `string` | 是 | 所属标签的 value。 |
| `XhTabsCloseTrigger` | `disabled` | `boolean` |  | 默认交给 connect 查询 collection，与所属标签同一条来路。 |
| `XhTabsContent` | `value` | `string` | 是 |  |
| `XhTabsRoot` | `renderPanel` | `(node: TabsNodeMeta) => ReactNode` |  | 每块面板的内容；未提供时为空面板。 |
| `XhTabsRoot` | `children` | `ReactNode` |  |  |
| `XhTabsTabDragTrigger` | `value` | `string` | 是 | 所属标签的 value。 |
| `XhTabsTrigger` | `value` | `string` | 是 |  |
| `XhTabsTrigger` | `disabled` | `boolean` |  | 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'active' \| 'inactive' |
| `content` | 'active' \| 'inactive' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `TRIGGER.SELECT` · `TRIGGER.FOCUS` · `TRIGGER.NAVIGATE` · `LIST.BLUR` · `TAB_DRAG.START` · `TAB_DRAG.MOVE` · `TAB_DRAG.END` · `TAB_DRAG.CANCEL` · `TAB.MOVE_BY` · `TAB.CLOSE` · `PRESS.START` · `PRESS.END` · `SCROLL.PREV` · `SCROLL.NEXT` · `SCROLL.BY` · `SCROLL.FRAME` · `PAN.START` · `PAN.MOVE` · `PAN.END` · `PAN.CANCEL` · `OVERFLOW.SELECT`

**判据**：`isAutomatic` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` |  |
| `collection` | `readonly TabsNodeMeta[]` | 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `focusedValue` | `string \| null` | 焦点在组外时为 null。 |
| `dropTarget` | `DropTarget \| null` | 当前的落点；松手即落在此处。未落在任何标签上时为 null。 |
| `announcement` | `string` | 读屏播报文本。渲染进 live-region，不进入视觉版面。 |
| `overflow` | `TabsOverflow \| null` | 标签带放不放得下：放得下时为 null，放不下时记两端各还有没有被裁掉的标签。 |
| `overflowItems` | `readonly TabsOverflowItem[]` | 列在「更多」下拉里的标签（此刻没有整个露在可见区里的），文档序；放得下时为空数组。 |
| `setValue` | `(next: string \| null) => void` | 传 null 清空选中：context.value 与受控 value 都能表达无选中，写入侧同样接受。 |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getTriggerProps` | `(props: TabsTriggerProps) => T['button']` |  |
| `getCloseTriggerProps` | `(props: TabsTriggerProps) => T['button']` | 标签的关闭钮：紧跟在所属 trigger 之后、与它平级。点按发 onTabClose，与标签上按 Delete / Backspace 同一个意图。 鼠标与触屏专用：对读屏隐藏、不占 Tab 位，键盘那一路在标签自己身上。closable 关闭时 hidden，所属标签禁用时 disabled。 |
| `isContentMounted` | `(value: string) => boolean` | 该面板此刻是否渲染内容：选中的面板总是渲染；未选中的面板按 lazyMount / unmountOnExit 判—— 从没被选中过且开了 lazyMount 的不渲染，被选中过又被选走且开了 unmountOnExit 的不渲染，其余照常渲染（只 hidden）。 |
| `getIndicatorProps` | `() => T['element']` | 选中标签下的滑条；位置由状态机测量后写为内联样式，没有选中项时 hidden。 |
| `getSeparatorProps` | `() => T['element']` | 标签之间的细分隔线，纯装饰。 |
| `getPrevTriggerProps` | `() => T['button']` | 标签带的前后翻页钮：标签带放不下时显示，挪到尽头的那一侧禁用；不占 Tab 位、对读屏隐藏—— 键盘用户用方向键在标签间移动，焦点落到被裁掉的标签上时标签带自己挪过去。 |
| `getNextTriggerProps` | `() => T['button']` |  |
| `getOverflowTriggerProps` | `() => T['button']` | 标签带之后的「更多」钮，也是「更多」下拉（一张 Menu）的触发器：放不下时露面，放得下时 hidden。 它在 tablist 之外、自占一个 Tab 位，不是方向键走位的一站。适配器按 asChild 的规则把菜单的开合接线合进来， 解剖标记归标签页。 |
| `getContentProps` | `(props: TabsContentProps) => T['element']` |  |
| `getTabDragTriggerProps` | `(props: TabsTriggerProps) => T['element']` | 标签拖动把手。触屏路径唯一的入口，不占 Tab 位。 常驻即可：reorderable 关闭或该标签禁用时它声明 data-disabled、也不再让出滚动， 渲染不会出错。按是否可拖动决定是否渲染，会使 DOM 结构随状态变化。 |
| `getLiveRegionProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowDown` | focus in list, 按键与 orientation 同轴 | 焦点移到下一个 trigger（禁用项跳过、尽头按 loop 回绕）；automatic 模式顺带切换选中 |
| `ArrowLeft` / `ArrowUp` | focus in list, 按键与 orientation 同轴 | 焦点移到上一个 trigger；automatic 模式顺带切换选中 |
| `Home` | focus in list | 焦点移到首个可停留 trigger |
| `End` | focus in list | 焦点移到末个可停留 trigger |
| `Enter` / `Space` | focus in trigger, not disabled | 把选中切到焦点所在 trigger（manual 模式的确认键） |
| `Enter` / `Space` | held in trigger, not disabled | 按住期间该 trigger 投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下。选中与按压互相独立，确认语义照旧由这一次按键承担 |
| `Delete` / `Backspace` | focus in trigger, closable 开启, not disabled | 关闭焦点所在标签：发 onTabClose（被关的标签与剩余标签序），与点 close-trigger 同一个意图；库不改标签序，标签由数据源删掉 |
| `Tab` / `Shift+Tab` | focus in list | 整组只有锚点 trigger 留在 Tab 序列内，一次 Tab 进出；无锚点时由 list 兜底，焦点进来后转投锚点 trigger（即选中项），锚点缺席或被禁用才落首个可停留项 |
| `Tab` / `Shift+Tab` | 标签带放不下、「更多」钮露面 | 「更多」钮在标签带之后自占一个 Tab 位：从标签带往后 Tab 先落到它、再到面板。它在 tablist 之外、不是方向键走位的一站，方向键只在标签之间走，尽头按 loop 回绕到另一端的标签 |
| `Enter` / `Space` / `ArrowDown` / `ArrowUp` | 焦点在「更多」钮上 | 展开「更多」下拉：Enter / Space / ArrowDown 落到首项，ArrowUp 落到末项；下拉里选中一项即选中那个标签并把它挪进可见区，下拉收起、焦点回到钮上 |
| `Escape` | 「更多」下拉展开 | 收起下拉，焦点回到「更多」钮 |
| `Alt+ArrowLeft` / `Alt+ArrowRight` / `Alt+ArrowUp` / `Alt+ArrowDown` | focus in list, reorderable 开启, 按键与 orientation 同轴 | 把焦点标签在标签带里往前 / 往后挪一位，按一下就是一次完整提交，不进拖动态；横轴跟着文字方向翻、rtl 下左右两键对调，竖排的上下两键不对调；已是首位 / 末位就不动，也不回绕；标签序不进库，只报一次重排好的新顺序。裸方向键仍是导航、Enter/Space 仍是确认 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `list` | `aria-orientation` | props.orientation |
| `list` | `role` | 'tablist' |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-selected` | 'true' \| 'false' |
| `trigger` | `role` | 'tab' |
| `close-trigger` | `aria-hidden` | 'true' |
| `indicator` | `aria-hidden` | 'true' |
| `separator` | `aria-hidden` | 'true' |
| `prev-trigger` | `aria-hidden` | 'true' |
| `next-trigger` | `aria-hidden` | 'true' |
| `overflow-trigger` | `aria-label` | translations.overflowTrigger |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `role` | 'tabpanel' |
| `tab-drag-trigger` | `aria-hidden` | 'true' |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |
| `live-region` | `role` | 'status' |

## 样式参考

### 皮肤

`@xihan-ui/styles/tabs.css` 使用 `[data-scope="tabs"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `trigger` | `data-closable` | ''（条件成立时才出现） |
| `trigger` | `data-current` | ''（条件成立时才出现） |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-draggable` | ''（条件成立时才出现） |
| `trigger` | `data-dragging` | ''（条件成立时才出现） |
| `trigger` | `data-drop` | 'before' \| 'after' |
| `trigger` | `data-pressed` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'active' \| 'inactive' |
| `trigger` | `data-xh-collection-context` | 'nav' \| undefined |
| `trigger` | `data-xh-collection-item` | ''（条件成立时才出现） |
| `trigger` | `data-xh-collection-size` | props.size \| undefined |
| `close-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `close-trigger` | `data-xh-action-control` | '' |
| `close-trigger` | `data-xh-action-display` | 'always' |
| `close-trigger` | `data-xh-action-profile` | 'icon' |
| `close-trigger` | `data-xh-action-size` | 'xs' |
| `close-trigger` | `data-xh-action-variant` | 'ghost' |
| `indicator` | `data-instant` | ''（条件成立时才出现） |
| `indicator` | `data-orientation` | props.orientation |
| `indicator` | `data-value` | item.value |
| `indicator` | `data-variant` | props.variant |
| `separator` | `data-orientation` | props.orientation |
| `prev-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `prev-trigger` | `data-orientation` | props.orientation |
| `prev-trigger` | `data-xh-action-control` | '' |
| `prev-trigger` | `data-xh-action-display` | 'always' |
| `prev-trigger` | `data-xh-action-profile` | 'icon' |
| `prev-trigger` | `data-xh-action-size` | props.size |
| `prev-trigger` | `data-xh-action-variant` | 'ghost' |
| `next-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `next-trigger` | `data-orientation` | props.orientation |
| `next-trigger` | `data-xh-action-control` | '' |
| `next-trigger` | `data-xh-action-display` | 'always' |
| `next-trigger` | `data-xh-action-profile` | 'icon' |
| `next-trigger` | `data-xh-action-size` | props.size |
| `next-trigger` | `data-xh-action-variant` | 'ghost' |
| `overflow-trigger` | `data-orientation` | props.orientation |
| `overflow-trigger` | `data-xh-action-control` | '' |
| `overflow-trigger` | `data-xh-action-display` | 'always' |
| `overflow-trigger` | `data-xh-action-profile` | 'icon' |
| `overflow-trigger` | `data-xh-action-size` | props.size |
| `overflow-trigger` | `data-xh-action-variant` | 'ghost' |
| `content` | `data-state` | 'active' \| 'inactive' |
| `tab-drag-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `tab-drag-trigger` | `data-dragging` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-tabs-content-fg` | `content` | `color` | `default` | `--xh-fg-default` | tabs 的 content 部件 color 覆盖槽。 |
| `--xh-tabs-content-py` | `content` | `padding-block` | `default` | `--xh-stack-gap-md` | tabs 的 content 部件 padding-block 覆盖槽。 |
| `--xh-tabs-drag-fg` | `tab-drag-trigger` | `color` | `default` | `--xh-fg-subtle` | tabs 的 tab-drag-trigger 部件 color 覆盖槽。 |
| `--xh-tabs-drag-fg-active` | `tab-drag-trigger` | `color` | `disabled`<br>`dragging`<br>`hover`<br>`not([data-disabled])` | `--xh-fg-default` | tabs 的 tab-drag-trigger 部件 color 覆盖槽。 |
| `--xh-tabs-drag-fg-disabled` | `tab-drag-trigger` | `color` | `disabled` | `--xh-fg-disabled` | tabs 的 tab-drag-trigger 部件 color 覆盖槽。 |
| `--xh-tabs-drag-grip-long` | `root`<br>`tab-drag-trigger` | `block-size`<br>`inline-size` | `empty`<br>`orientation=vertical` | `--xh-space-2` | tabs 的 root、tab-drag-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tabs-drag-grip-short` | `root`<br>`tab-drag-trigger` | `block-size`<br>`inline-size` | `empty`<br>`orientation=vertical` | `--xh-space-1` | tabs 的 root、tab-drag-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tabs-drag-radius` | `tab-drag-trigger` | `border-radius` | `default` | `--xh-shape-control` | tabs 的 tab-drag-trigger 部件 border-radius 覆盖槽。 |
| `--xh-tabs-drag-size` | `tab-drag-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | tabs 的 tab-drag-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tabs-dragging-opacity` | `trigger` | `opacity` | `dragging` | `--xh-state-dragging-opacity` | tabs 的 trigger 部件 opacity 覆盖槽。 |
| `--xh-tabs-drop-fg` | `trigger` | `background` | `drop=after`<br>`drop=before`<br>`is([data-drop='before'], [data-drop='after'])` | `--xh-bg-brand` | tabs 的 trigger 部件 background 覆盖槽。 |
| `--xh-tabs-drop-line` | `root`<br>`trigger` | `block-size`<br>`inline-size` | `drop=after`<br>`drop=before`<br>`is([data-drop='before'], [data-drop='after'])`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-stroke-thick` | tabs 的 root、trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tabs-gap` | `root` | `column-gap`<br>`gap`<br>`row-gap` | `default`<br>`has(> [data-scope='tabs'][data-part='overflow-trigger'])`<br>`orientation=vertical` | `--xh-stack-gap-md` | tabs 的 root 部件 column-gap、gap、row-gap 覆盖槽。 |
| `--xh-tabs-indicator-color` | `indicator`<br>`root`<br>`trigger` | `background` | `current`<br>`default`<br>`drop`<br>`not([data-drop])`<br>`variant=line` | `--xh-_tabs-accent` | tabs 的 indicator、root、trigger 部件 background 覆盖槽。 |
| `--xh-tabs-indicator-radius` | `indicator`<br>`root`<br>`trigger` | `border-radius` | `current`<br>`default`<br>`drop`<br>`not([data-drop])`<br>`variant=line` | `--xh-shape-pill` | tabs 的 indicator、root、trigger 部件 border-radius 覆盖槽。 |
| `--xh-tabs-indicator-thickness` | `indicator`<br>`root`<br>`trigger` | `block-size`<br>`inline-size` | `current`<br>`default`<br>`drop`<br>`not([data-drop])`<br>`not([data-variant='segment'])`<br>`orientation=horizontal`<br>`orientation=vertical`<br>`variant=line`<br>`variant=segment` | `--xh-stroke-thick` | tabs 的 indicator、root、trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tabs-list-bg` | `list` | `background` | `default` | `--xh-_tabs-list-bg` | tabs 的 list 部件 background 覆盖槽。 |
| `--xh-tabs-list-border` | `list`<br>`root` | `border`<br>`border-block-end`<br>`border-inline-end` | `default`<br>`variant=segment` | `--xh-border-default`<br>`transparent` | tabs 的 list、root 部件 border、border-block-end、border-inline-end 覆盖槽。 |
| `--xh-tabs-list-gap` | `close-trigger`<br>`list`<br>`root` | `gap`<br>`margin-block-start`<br>`margin-inline-start` | `default`<br>`orientation=vertical` | `--xh-_tabs-list-gap` | tabs 的 close-trigger、list、root 部件 gap、margin-block-start、margin-inline-start 覆盖槽。 |
| `--xh-tabs-list-p` | `list`<br>`next-trigger`<br>`prev-trigger` | `inset-block-end`<br>`inset-block-start`<br>`inset-inline`<br>`inset-inline-end`<br>`inset-inline-start`<br>`padding` | `default`<br>`orientation=vertical` | `--xh-_tabs-list-p` | tabs 的 list、next-trigger、prev-trigger 部件 inset-block-end、inset-block-start、inset-inline、inset-inline-end、inset-inline-start、padding 覆盖槽。 |
| `--xh-tabs-list-radius` | `list` | `border-radius` | `default` | `--xh-_tabs-list-radius` | tabs 的 list 部件 border-radius 覆盖槽。 |
| `--xh-tabs-scroll-icon-size` | `next-trigger`<br>`prev-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` | tabs 的 next-trigger、prev-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-tabs-scroll-trigger-bg` | `next-trigger`<br>`prev-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`disabled`<br>`focus-visible`<br>`xh-ink-surface` | `--xh-_tabs-scroll-trigger-bg` | tabs 的 next-trigger、prev-trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-tabs-scroll-trigger-fg` | `next-trigger`<br>`prev-trigger` | `color` | `default` | `--xh-fg-muted` | tabs 的 next-trigger、prev-trigger 部件 color 覆盖槽。 |
| `--xh-tabs-separator-color` | `separator` | `background` | `default` | `--xh-border-default` | tabs 的 separator 部件 background 覆盖槽。 |
| `--xh-tabs-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` | tabs 的 separator 部件 border-radius 覆盖槽。 |
| `--xh-tabs-separator-size` | `separator` | `block-size` | `default` | `--xh-space-4` | tabs 的 separator 部件 block-size 覆盖槽。 |
| `--xh-tabs-separator-thickness` | `separator` | `block-size`<br>`inline-size` | `default`<br>`orientation=vertical` | `--xh-stroke-thin` | tabs 的 separator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tabs-trigger-bg` | `root`<br>`trigger` | `background`<br>`background-color` | `is([data-variant='card'], [data-variant='segment'])`<br>`variant=card`<br>`variant=line`<br>`variant=segment`<br>`xh-collection-context=nav` | `transparent` | tabs 的 root、trigger 部件 background、background-color 覆盖槽。 |
| `--xh-tabs-trigger-bg-active` | `indicator`<br>`root`<br>`trigger` | `background`<br>`background-color` | `current`<br>`disabled`<br>`error`<br>`is([data-variant='card'], [data-variant='segment'])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`state=active`<br>`variant=card`<br>`variant=line`<br>`variant=segment`<br>`xh-collection-context=nav` | `--xh-_tabs-trigger-bg-active`<br>`--xh-_tone-subtle`<br>`transparent` | tabs 的 indicator、root、trigger 部件 background、background-color 覆盖槽。 |
| `--xh-tabs-trigger-bg-active-hover` | `root`<br>`trigger` | `background`<br>`background-color` | `current`<br>`disabled`<br>`error`<br>`hover`<br>`is([data-variant='card'], [data-variant='segment'])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`not([data-disabled])`<br>`state=active`<br>`variant=card`<br>`variant=line`<br>`variant=segment`<br>`xh-collection-context=nav` | `--xh-_tabs-trigger-bg-active-hover`<br>`--xh-bg-subtle` | tabs 的 root、trigger 部件 background、background-color 覆盖槽。 |
| `--xh-tabs-trigger-bg-hover` | `root`<br>`trigger` | `background`<br>`background-color` | `disabled`<br>`error`<br>`hover`<br>`is([data-variant='card'], [data-variant='segment'])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`not([data-disabled])`<br>`variant=card`<br>`variant=line`<br>`variant=segment`<br>`xh-collection-context=nav` | `--xh-_tabs-trigger-bg-hover`<br>`--xh-bg-subtle` | tabs 的 root、trigger 部件 background、background-color 覆盖槽。 |
| `--xh-tabs-trigger-bg-pressed` | `root`<br>`trigger` | `background`<br>`background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([data-variant='card'], [data-variant='segment'])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`not([data-disabled])`<br>`not([data-state='active'])`<br>`pressed`<br>`state=active`<br>`variant=card`<br>`variant=line`<br>`variant=segment`<br>`xh-collection-context=nav` | `--xh-_tabs-trigger-bg-pressed`<br>`--xh-bg-subtle-hover` | tabs 的 root、trigger 部件 background、background-color 覆盖槽。 |
| `--xh-tabs-trigger-border` | `trigger` | `border` | `default` | `--xh-_tabs-trigger-border` | tabs 的 trigger 部件 border 覆盖槽。 |
| `--xh-tabs-trigger-border-active` | `indicator`<br>`root`<br>`trigger` | `border`<br>`border-color` | `is([data-variant='card'], [data-variant='segment'])`<br>`state=active`<br>`variant=card`<br>`variant=segment` | `--xh-_tabs-trigger-border-active`<br>`--xh-_tone-border` | tabs 的 indicator、root、trigger 部件 border、border-color 覆盖槽。 |
| `--xh-tabs-trigger-fg` | `root`<br>`trigger` | `color` | `is([data-variant='card'], [data-variant='segment'])`<br>`variant=card`<br>`variant=line`<br>`variant=segment`<br>`xh-collection-context=nav` | `--xh-fg-muted` | tabs 的 root、trigger 部件 color 覆盖槽。 |
| `--xh-tabs-trigger-fg-active` | `root`<br>`trigger` | `color` | `current`<br>`disabled`<br>`error`<br>`is([data-variant='card'], [data-variant='segment'])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`state=active`<br>`variant=card`<br>`variant=line`<br>`variant=segment`<br>`xh-collection-context=nav` | `--xh-_tabs-accent-text` | tabs 的 root、trigger 部件 color 覆盖槽。 |
| `--xh-tabs-trigger-fg-hover` | `root`<br>`trigger` | `color` | `disabled`<br>`error`<br>`hover`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`variant=line`<br>`xh-collection-context=nav` | `--xh-fg-default` | tabs 的 root、trigger 部件 color 覆盖槽。 |
| `--xh-tabs-trigger-fg-pressed` | `root`<br>`trigger` | `color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`variant=line`<br>`xh-collection-context=nav` | `--xh-fg-default` | tabs 的 root、trigger 部件 color 覆盖槽。 |
| `--xh-tabs-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_tabs-trigger-font-size` | tabs 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-tabs-trigger-font-weight` | `root`<br>`trigger` | `font-weight` | `is([data-variant='card'], [data-variant='segment'])`<br>`variant=card`<br>`variant=line`<br>`variant=segment`<br>`xh-collection-context=nav` | `--xh-font-weight-regular`<br>`--xh-text-label-weight` | tabs 的 root、trigger 部件 font-weight 覆盖槽。 |
| `--xh-tabs-trigger-font-weight-active` | `root`<br>`trigger` | `font-weight` | `current`<br>`disabled`<br>`error`<br>`is([data-variant='card'], [data-variant='segment'])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`state=active`<br>`variant=card`<br>`variant=line`<br>`variant=segment`<br>`xh-collection-context=nav` | `--xh-font-weight-medium` | tabs 的 root、trigger 部件 font-weight 覆盖槽。 |
| `--xh-tabs-trigger-gap` | `trigger` | `gap` | `default` | `--xh-control-gap-md` | tabs 的 trigger 部件 gap 覆盖槽。 |
| `--xh-tabs-trigger-h` | `close-trigger`<br>`next-trigger`<br>`overflow-trigger`<br>`prev-trigger`<br>`root`<br>`trigger` | `block-size`<br>`inline-size`<br>`margin-block-end`<br>`margin-block-start`<br>`margin-inline-end`<br>`margin-inline-start`<br>`padding-inline-end` | `default`<br>`has(+ [data-scope='tabs'][data-part='close-trigger']:not([hidden])`<br>`orientation=vertical`<br>`xh-action-profile=icon` | `--xh-_tabs-trigger-h` | tabs 的 close-trigger、next-trigger、overflow-trigger、prev-trigger、root、trigger 部件 block-size、inline-size、margin-block-end、margin-block-start、margin-inline-end、margin-inline-start、padding-inline-end 覆盖槽。 |
| `--xh-tabs-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_tabs-trigger-px` | tabs 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-tabs-trigger-radius` | `indicator`<br>`trigger` | `border-radius` | `default`<br>`variant=segment` | `--xh-_tabs-trigger-radius` | tabs 的 indicator、trigger 部件 border-radius 覆盖槽。 |
| `--xh-tabs-trigger-shadow-active` | `indicator`<br>`root`<br>`trigger` | `box-shadow` | `is([data-variant='card'], [data-variant='segment'])`<br>`state=active`<br>`variant=card`<br>`variant=segment` | `--xh-_tabs-trigger-shadow-active`<br>`--xh-elevation-raised` | tabs 的 indicator、root、trigger 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 指示与换位（见[动效规范](../design/motion#角色)）。

`background-color` · `block-size` · `box-shadow` · `color` · `inline-size` · `transform` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：值由内核逐帧算出（`frameLoop` · `isTweenDone` · `tweenValueAt`），皮肤里看不到这段；退场由适配器的退场闸门把关，动画播完才真收起；内核按组件所在的作用域判断减弱动效（最近的 `data-motion`、应用级覆盖、系统偏好），据此决定要不要动。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断；内核驱动的那段不经令牌层，由内核按元素判断后自行降级。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
