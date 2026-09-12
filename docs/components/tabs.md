# Tabs <Badge type="info" text="标签页" />

在同一块区域里切换几组并列的内容，同时只显示一组。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tabs" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tabs.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tabs" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tabs" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tabs.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

default-value 指定初始选中项，禁用的标签方向键会跳过；面板常挂，靠 hidden 显隐

<XhDemo src="tabs/01-basic" />

## 示例

### 受控

传了 value 就由宿主说了算，组件自己不再改选中值；切换意图从 value-change 出来，写回才真的切

<XhDemo src="tabs/02-controlled" />

### 手动激活

activation-mode="manual" 时方向键只搬焦点，按 Enter 或空格才真的切面板

<XhDemo src="tabs/03-manual" />

### 竖排

orientation 换掉方向键收哪一对键：竖排认上下键，左右键原样放行给页面

<XhDemo src="tabs/04-vertical" />

### 形态

variant 只改选中态怎么画，切换行为与键盘操作三档一致；不写 variant 即 line 档

<XhDemo src="tabs/05-variant" />

### 语气

tone 决定选中态用哪族颜色，与 variant 正交；这里固定 card 形态只看语气的差别

<XhDemo src="tabs/06-tone" />

### 尺寸

size 换标签的高度、内边距与字号，不传 size 即默认档

<XhDemo src="tabs/07-size" />

### 标签栏前后缀

list 里只收 trigger；要在标签栏两侧摆东西，把它们与 list 排进同一行

<XhDemo src="tabs/08-prefix-suffix" />

### 拦截切换

受控下 value-change 只是意图，宿主校验不过就不写回 value，标签页原地不动

<XhDemo src="tabs/09-guard" />

### 动态增删

标签清单归宿主维护；关掉当前这页时把选中值挪到相邻一项，全关完选中值是 null

<XhDemo src="tabs/10-dynamic" />

### 可滚动的标签栏

标签多到一行放不下时，把 list 装进作者自建的横滚容器，两端各摆一个滚动按钮

<XhDemo src="tabs/11-scrollable" />

### 切换后滚进视野

每个标签都带 data-value 身份标记，选中值一变就按它取到那个标签，滚到视口正中

<XhDemo src="tabs/12-active-into-view" />

### 标签栏摆在哪一边

root 按书写顺序渲染子节点：把面板写在 list 前面，标签栏就落到内容之后，基线换到另一边

<XhDemo src="tabs/13-placement" />

### 拖拽换位

整个标签都是拖动源：按住往旁边拖，落点画成一条线、被拖的标签原地不动；也可以聚焦标签带后按 Alt + 左右键挪一位（竖排是 Alt + 上下键），到首末就不动。库不拥有标签序，只报一次重排好的新顺序连同读屏播报，照它写回数组归使用者

<XhDemo src="tabs/14-reorder" />

## 设计指引

### 何时使用

- 内容属于同一个对象的不同侧面（详情 / 权限 / 日志），用户会来回看。
- 各组内容量相当，且不需要同时对照。

### 何时不用

- 各组需要同时看见或互相对照：并排摆，别切换。
- 有先后顺序、必须走完：用[步骤条](./steps)。
- 只是切换一个显示开关：用[切换按钮组](./toggle-group)。

### 特性

- `activationMode` 决定方向键移动焦点时是否顺带切换：内容加载昂贵时改 `manual`，方向键只搬焦点、按 Enter 才切。
- `variant` 三档（`line` / `card` / `segment`）只改选中态怎么画，切换行为与键盘操作三档一致。
- 面板常挂，靠 `hidden` 显隐。
- `root` 按书写顺序渲染子节点：把面板写在标签栏前面，标签栏就落到内容之后。
- `reorderable` 打开后标签可以拖着换位，键盘走 Alt + 主轴方向键。**只给 `collection` 时代铺的那套标记里没有播报区与拖动把手**：要读屏播报与触屏拖动，得写默认插槽并自己渲 `live-region` 与 `tab-drag-trigger`。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tabs>` |
| Vue 组件 | `XhTabsContent` `XhTabsIndicator` `XhTabsList` `XhTabsLiveRegion` `XhTabsRoot` `XhTabsSeparator` `XhTabsTabDragTrigger` `XhTabsTrigger` |
| 组合式函数 | `useTabs` |
| 状态机 | `tabsMachine` |
| 皮肤 | `@xihan-ui/styles/tabs.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="tabs"`：`root` · **`list`** · **`trigger`** · `indicator` · `separator` · **`content`** · `tab-drag-trigger` · `live-region`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `TabsNode[]` |  | 条目数据，标签文本与禁用的事实源。给了它，trigger 部件只需报 value。 缺省即回到「文本与禁用都写在 trigger 上」的老路。 |
| `value` | `string \| null` |  | 选中值。给定即受控：内部不再自改，只发 onValueChange。 |
| `defaultValue` | `string \| null` |  |  |
| `orientation` | `Orientation` |  | 方向键轴向，默认 horizontal；不同轴的方向键放行给页面滚动与读屏。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只影响水平轴上 ArrowLeft/ArrowRight 的前后语义。 |
| `activationMode` | `TabsActivationMode` |  | 方向键移动焦点时是否顺带切换选中，默认 automatic。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `variant` | `TabsVariant` |  | 形态：line / card / segment，决定选中态怎么画。缺省是 line。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `reorderable` | `boolean` |  | 标签可以拖着换位。整个标签都是拖动源，不另出把手。 顺序不进机器：collection 是 prop，库没有一份自己的标签序可写，只发 onTabMove。 |
| `onTabMove` | `(details: TabsMoveDetails) => void` |  |  |
| `closable` | `boolean` |  | 标签可关闭：trigger 上按 Delete / Backspace 即发 onTabClose。 库不持有标签序，只发意图，删不删由数据源那边决定。 |
| `onTabClose` | `(details: TabsCloseDetails) => void` |  | 标签被关闭。 |
| `translations` | `Partial<TabsTranslations>` |  |  |
| `onValueChange` | `(details: TabsValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TabsValueChangeDetails` | 选中值变化；detail 为 `{ value: string \| null }` |
| `tab-move` | `TabsMoveDetails` | 标签换了位；detail 为 `{ value, from, to, values }`，values 是重排好的整份标签序 |
| `tab-close` | `TabsCloseDetails` | 标签被关闭；detail 为 `{ value, values }`，values 是关掉这一条之后余下的标签序 |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'active' \| 'inactive' |
| `content` | 'active' \| 'inactive' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `TRIGGER.SELECT` · `TRIGGER.FOCUS` · `TRIGGER.NAVIGATE` · `LIST.BLUR` · `TAB_DRAG.START` · `TAB_DRAG.MOVE` · `TAB_DRAG.END` · `TAB_DRAG.CANCEL` · `TAB.MOVE_BY` · `TAB.CLOSE`

**判据**：`isAutomatic`

## connect API

`useTabs` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` |  |
| `collection` | `readonly TabsNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `focusedValue` | `string \| null` | 焦点在组外时为 null。 |
| `dropTarget` | `DropTarget \| null` | 此刻的落点；松手就落在这儿。没落在任何标签上时是 null。 |
| `announcement` | `string` | 读屏播报文本。渲进 live-region，不进视觉版面。 |
| `setValue` | `(next: string \| null) => void` | 传 null 清空选中：context.value 与受控 value 都能表达"无选中"，写入侧同样收得下。 |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getTriggerProps` | `(props: TabsTriggerProps) => T['button']` |  |
| `getIndicatorProps` | `() => T['element']` | 选中标签下的滑条；位置由机器量好写成内联样式，没有选中项时 hidden。 |
| `getSeparatorProps` | `() => T['element']` | 标签之间的细分隔线，纯装饰。 |
| `getContentProps` | `(props: TabsContentProps) => T['element']` |  |
| `getTabDragTriggerProps` | `(props: TabsTriggerProps) => T['element']` | 标签拖动把手。触屏那一路唯一的入口，不占 Tab 位。 常挂即可：reorderable 关着或这个标签禁用时它自报 data-disabled、也不再让出滚动， 渲了不会错。按拖不拖得动来决定渲不渲，会让 DOM 结构随状态变。 |
| `getLiveRegionProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowDown` | focus in list, 按键与 orientation 同轴 | 焦点移到下一个 trigger（禁用项跳过、尽头按 loop 回绕）；automatic 模式顺带切换选中 |
| `ArrowLeft` / `ArrowUp` | focus in list, 按键与 orientation 同轴 | 焦点移到上一个 trigger；automatic 模式顺带切换选中 |
| `Home` | focus in list | 焦点移到首个可停留 trigger |
| `End` | focus in list | 焦点移到末个可停留 trigger |
| `Enter` / `Space` | focus in trigger, not disabled | 把选中切到焦点所在 trigger（manual 模式的确认键） |
| `Tab` / `Shift+Tab` | focus in list | 整组只有锚点 trigger 留在 Tab 序列内，一次 Tab 进出；无锚点时由 list 兜底，焦点进来后转投锚点 trigger（即选中项），锚点缺席或被禁用才落首个可停留项 |
| `Alt+ArrowLeft` / `Alt+ArrowRight` / `Alt+ArrowUp` / `Alt+ArrowDown` | focus in list, reorderable 开着, 按键与 orientation 同轴 | 把焦点标签在标签带里往前 / 往后挪一位，按一下就是一次完整提交，不进拖动态；横轴跟着文字方向翻、rtl 下左右两键对调，竖排的上下两键不对调；已是首位 / 末位就不动，也不回绕；标签序不进库，只报一次重排好的新顺序。裸方向键仍是导航、Enter/Space 仍是确认 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `list` | `aria-orientation` | props.orientation |
| `list` | `role` | 'tablist' |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-selected` | 'true' \| 'false' |
| `trigger` | `role` | 'tab' |
| `indicator` | `aria-hidden` | 'true' |
| `separator` | `aria-hidden` | 'true' |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `role` | 'tabpanel' |
| `tab-drag-trigger` | `aria-hidden` | 'true' |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |
| `live-region` | `role` | 'status' |

## 样式

默认皮肤 `@xihan-ui/styles/tabs.css` 按部件选择：`[data-scope="tabs"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `trigger` | `data-closable` | ''（条件成立时才出现） |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-draggable` | ''（条件成立时才出现） |
| `trigger` | `data-dragging` | ''（条件成立时才出现） |
| `trigger` | `data-drop` | 'before' \| 'after' |
| `trigger` | `data-state` | 'active' \| 'inactive' |
| `indicator` | `data-orientation` | props.orientation |
| `indicator` | `data-value` | item.value |
| `separator` | `data-orientation` | props.orientation |
| `content` | `data-state` | 'active' \| 'inactive' |
| `tab-drag-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `tab-drag-trigger` | `data-dragging` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
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
| `--xh-tabs-gap` | `root` | `gap` | `default` | `--xh-stack-gap-md` | tabs 的 root 部件 gap 覆盖槽。 |
| `--xh-tabs-indicator-color` | `indicator` | `background` | `default` | `--xh-_tabs-accent` | tabs 的 indicator 部件 background 覆盖槽。 |
| `--xh-tabs-indicator-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-pill` | tabs 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-tabs-indicator-thickness` | `indicator` | `block-size`<br>`inline-size`<br>`inset-block-end`<br>`inset-inline-end` | `default`<br>`orientation=vertical` | `--xh-stroke-thick` | tabs 的 indicator 部件 block-size、inline-size、inset-block-end、inset-inline-end 覆盖槽。 |
| `--xh-tabs-list-bg` | `list` | `background` | `default` | `--xh-_tabs-list-bg` | tabs 的 list 部件 background 覆盖槽。 |
| `--xh-tabs-list-border` | `list` | `border-block-end`<br>`border-inline-end` | `default` | `--xh-border-default` | tabs 的 list 部件 border-block-end、border-inline-end 覆盖槽。 |
| `--xh-tabs-list-gap` | `list` | `gap` | `default` | `--xh-_tabs-list-gap` | tabs 的 list 部件 gap 覆盖槽。 |
| `--xh-tabs-list-p` | `list` | `padding` | `default` | `--xh-_tabs-list-p` | tabs 的 list 部件 padding 覆盖槽。 |
| `--xh-tabs-list-radius` | `list` | `border-radius` | `default` | `--xh-_tabs-list-radius` | tabs 的 list 部件 border-radius 覆盖槽。 |
| `--xh-tabs-separator-color` | `separator` | `background` | `default` | `--xh-border-default` | tabs 的 separator 部件 background 覆盖槽。 |
| `--xh-tabs-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` | tabs 的 separator 部件 border-radius 覆盖槽。 |
| `--xh-tabs-separator-size` | `separator` | `block-size` | `default` | `--xh-space-4` | tabs 的 separator 部件 block-size 覆盖槽。 |
| `--xh-tabs-separator-thickness` | `separator` | `block-size`<br>`inline-size` | `default`<br>`orientation=vertical` | `--xh-stroke-thin` | tabs 的 separator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tabs-trigger-bg` | `trigger` | `background` | `default` | `transparent` | tabs 的 trigger 部件 background 覆盖槽。 |
| `--xh-tabs-trigger-bg-active` | `trigger` | `background` | `state=active` | `--xh-_tabs-trigger-bg-active` | tabs 的 trigger 部件 background 覆盖槽。 |
| `--xh-tabs-trigger-bg-active-hover` | `trigger` | `background` | `disabled`<br>`hover`<br>`not([data-disabled])`<br>`state=active` | `--xh-_tabs-trigger-bg-active-hover` | tabs 的 trigger 部件 background 覆盖槽。 |
| `--xh-tabs-trigger-bg-hover` | `trigger` | `background` | `disabled`<br>`hover`<br>`not([data-disabled])` | `--xh-bg-subtle-hover` | tabs 的 trigger 部件 background 覆盖槽。 |
| `--xh-tabs-trigger-border` | `trigger` | `border` | `default` | `--xh-_tabs-trigger-border` | tabs 的 trigger 部件 border 覆盖槽。 |
| `--xh-tabs-trigger-border-active` | `trigger` | `border-color` | `state=active` | `--xh-_tabs-trigger-border-active` | tabs 的 trigger 部件 border-color 覆盖槽。 |
| `--xh-tabs-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-muted` | tabs 的 trigger 部件 color 覆盖槽。 |
| `--xh-tabs-trigger-fg-active` | `trigger` | `color` | `state=active` | `--xh-_tabs-accent-text` | tabs 的 trigger 部件 color 覆盖槽。 |
| `--xh-tabs-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_tabs-trigger-font-size` | tabs 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-tabs-trigger-font-weight` | `trigger` | `font-weight` | `default` | `--xh-text-label-weight` | tabs 的 trigger 部件 font-weight 覆盖槽。 |
| `--xh-tabs-trigger-gap` | `trigger` | `gap` | `default` | `--xh-control-gap-md` | tabs 的 trigger 部件 gap 覆盖槽。 |
| `--xh-tabs-trigger-h` | `trigger` | `block-size` | `default` | `--xh-_tabs-trigger-h` | tabs 的 trigger 部件 block-size 覆盖槽。 |
| `--xh-tabs-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_tabs-trigger-px` | tabs 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-tabs-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | tabs 的 trigger 部件 border-radius 覆盖槽。 |
| `--xh-tabs-trigger-shadow-active` | `trigger` | `box-shadow` | `state=active` | `--xh-_tabs-trigger-shadow-active` | tabs 的 trigger 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`block-size` · `box-shadow` · `color` · `inline-size` · `inset-block-start` · `inset-inline-start` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[卡片](./card)配合；标签多到一行放不下时把标签栏装进自建的横滚容器。

## 最佳实践

- 标签数控制在七个以内，超过就该换成[侧栏导航](./side-nav)。
- 把当前标签写进地址，刷新后才回得到原处。

## 反模式

- 标签页里再套标签页：用户分不清哪一层在切。
- 面板高度随内容剧烈变化，切换时整页跳动。
