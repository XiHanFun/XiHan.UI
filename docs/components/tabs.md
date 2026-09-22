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

`data-scope="tabs"`：`root` · **`list`** · **`trigger`** · `indicator` · `separator` · `prev-trigger` · `next-trigger` · **`content`** · `tab-drag-trigger` · `live-region`

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

<XhDemo src="tabs/06-dynamic" />

### 放不下时滚动

标签带只裁主轴，两端翻页钮与滚轮把被裁掉的标签挪进视野

<XhDemo src="tabs/07-scroll" />

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
- 面板常驻并通过 `hidden` 切换，内部状态不会丢失。
- 标签带放不下时不折行：标签整体沿主轴位移露出被裁掉的那截，两端的 `prev-trigger` / `next-trigger` 按页翻，横向滚轮（触控板两指横划、Shift + 滚轮）按滚了多少挪多少，触屏手指按在标签带上沿主轴拖即跟手平移（交叉轴仍让给页面滚动，抬手后紧跟的那次 click 不算点选），选中或聚焦的标签被裁在外面时自动挪进视野；放得下时两只翻页钮收起，`api.overflow` 为 `null`。
- `reorderable` 支持指针拖动与 Alt + 方向键换位。

### 组合

- `indicator` 是滑动的当前标记：`line` 变体下是一条指示线，不放它时选中标签自画静态线，放了它静态线收起、不重复画；`segment` 变体下是那块白色抬起面，放了它选中标签自己透空、面跟着滑，不放则面长在选中标签身上；`card` 变体不用它。
- `separator` 在相邻标签之间增加分隔线。
- `prev-trigger` / `next-trigger` 放在 `list` 里、与标签平级（通常一头一尾），是标签带放不下时的翻页钮：鼠标专用的辅助入口，对读屏隐藏、不占 Tab 位——键盘用方向键在标签间移动，标签带自己跟着焦点挪；不放它们时滚轮与焦点跟随照常工作。不写内容时由皮肤画一枚 chevron，盖底缺省取 surface，标签页坐在别的面上时改 `--xh-tabs-scroll-trigger-bg`。

### 最佳实践

- 标签数量控制在七个以内；确实更多（按数据生成的标签）时放上两端翻页钮，并把选中标签同步给 `value`，让它首帧就露在视野里。
- 需要保留选择时，将当前标签同步到地址。

### 反模式

- 不要嵌套标签页。
- 避免面板高度差异过大造成布局跳动。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tabs>` |
| Vue 组件 | `XhTabsContent` `XhTabsIndicator` `XhTabsList` `XhTabsLiveRegion` `XhTabsNextTrigger` `XhTabsPrevTrigger` `XhTabsRoot` `XhTabsSeparator` `XhTabsTabDragTrigger` `XhTabsTrigger` |
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
| `closable` | `boolean` |  | 标签可关闭：trigger 上按 Delete / Backspace 即发 onTabClose。 库不持有标签序，只发意图，是否删除由数据源决定。 |
| `onTabClose` | `(details: TabsCloseDetails) => void` |  | 标签被关闭。 |
| `translations` | `Partial<TabsTranslations>` |  |  |
| `onValueChange` | `(details: TabsValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TabsValueChangeDetails` | 选中值变化；detail 为 `{ value: string \| null }` |
| `tab-move` | `TabsMoveDetails` | 标签换位；detail 为 `{ value, from, to, values }`，values 是重排后的整份标签序 |
| `tab-close` | `TabsCloseDetails` | 标签被关闭；detail 为 `{ value, values }`，values 是关闭该标签之后剩余的标签序 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'active' \| 'inactive' |
| `content` | 'active' \| 'inactive' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `TRIGGER.SELECT` · `TRIGGER.FOCUS` · `TRIGGER.NAVIGATE` · `LIST.BLUR` · `TAB_DRAG.START` · `TAB_DRAG.MOVE` · `TAB_DRAG.END` · `TAB_DRAG.CANCEL` · `TAB.MOVE_BY` · `TAB.CLOSE` · `PRESS.START` · `PRESS.END` · `SCROLL.PREV` · `SCROLL.NEXT` · `SCROLL.BY` · `SCROLL.FRAME` · `PAN.START` · `PAN.MOVE` · `PAN.END` · `PAN.CANCEL`

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
| `setValue` | `(next: string \| null) => void` | 传 null 清空选中：context.value 与受控 value 都能表达无选中，写入侧同样接受。 |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getTriggerProps` | `(props: TabsTriggerProps) => T['button']` |  |
| `getIndicatorProps` | `() => T['element']` | 选中标签下的滑条；位置由状态机测量后写为内联样式，没有选中项时 hidden。 |
| `getSeparatorProps` | `() => T['element']` | 标签之间的细分隔线，纯装饰。 |
| `getPrevTriggerProps` | `() => T['button']` | 标签带的前后翻页钮：标签带放不下时显示，挪到尽头的那一侧禁用；不占 Tab 位、对读屏隐藏—— 键盘用户用方向键在标签间移动，焦点落到被裁掉的标签上时标签带自己挪过去。 |
| `getNextTriggerProps` | `() => T['button']` |  |
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
| `Tab` / `Shift+Tab` | focus in list | 整组只有锚点 trigger 留在 Tab 序列内，一次 Tab 进出；无锚点时由 list 兜底，焦点进来后转投锚点 trigger（即选中项），锚点缺席或被禁用才落首个可停留项 |
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
| `indicator` | `aria-hidden` | 'true' |
| `separator` | `aria-hidden` | 'true' |
| `prev-trigger` | `aria-hidden` | 'true' |
| `next-trigger` | `aria-hidden` | 'true' |
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
| `--xh-tabs-gap` | `root` | `gap` | `default` | `--xh-stack-gap-md` | tabs 的 root 部件 gap 覆盖槽。 |
| `--xh-tabs-indicator-color` | `indicator`<br>`root`<br>`trigger` | `background` | `current`<br>`default`<br>`drop`<br>`not([data-drop])`<br>`variant=line` | `--xh-_tabs-accent` | tabs 的 indicator、root、trigger 部件 background 覆盖槽。 |
| `--xh-tabs-indicator-radius` | `indicator`<br>`root`<br>`trigger` | `border-radius` | `current`<br>`default`<br>`drop`<br>`not([data-drop])`<br>`variant=line` | `--xh-shape-pill` | tabs 的 indicator、root、trigger 部件 border-radius 覆盖槽。 |
| `--xh-tabs-indicator-thickness` | `indicator`<br>`root`<br>`trigger` | `block-size`<br>`inline-size` | `current`<br>`default`<br>`drop`<br>`not([data-drop])`<br>`not([data-variant='segment'])`<br>`orientation=horizontal`<br>`orientation=vertical`<br>`variant=line`<br>`variant=segment` | `--xh-stroke-thick` | tabs 的 indicator、root、trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tabs-list-bg` | `list` | `background` | `default` | `--xh-_tabs-list-bg` | tabs 的 list 部件 background 覆盖槽。 |
| `--xh-tabs-list-border` | `list`<br>`root` | `border`<br>`border-block-end`<br>`border-inline-end` | `default`<br>`variant=segment` | `--xh-border-default`<br>`transparent` | tabs 的 list、root 部件 border、border-block-end、border-inline-end 覆盖槽。 |
| `--xh-tabs-list-gap` | `list` | `gap` | `default` | `--xh-_tabs-list-gap` | tabs 的 list 部件 gap 覆盖槽。 |
| `--xh-tabs-list-p` | `list`<br>`next-trigger`<br>`prev-trigger` | `inset-block-end`<br>`inset-block-start`<br>`inset-inline`<br>`inset-inline-end`<br>`inset-inline-start`<br>`padding` | `default`<br>`orientation=vertical` | `--xh-_tabs-list-p` | tabs 的 list、next-trigger、prev-trigger 部件 inset-block-end、inset-block-start、inset-inline、inset-inline-end、inset-inline-start、padding 覆盖槽。 |
| `--xh-tabs-list-radius` | `list` | `border-radius` | `default` | `--xh-_tabs-list-radius` | tabs 的 list 部件 border-radius 覆盖槽。 |
| `--xh-tabs-scroll-icon-size` | `next-trigger`<br>`prev-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` | tabs 的 next-trigger、prev-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-tabs-scroll-trigger-bg` | `next-trigger`<br>`prev-trigger` | `background-color` | `default`<br>`disabled`<br>`focus-visible` | `--xh-_tabs-scroll-trigger-bg` | tabs 的 next-trigger、prev-trigger 部件 background-color 覆盖槽。 |
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
| `--xh-tabs-trigger-h` | `next-trigger`<br>`prev-trigger`<br>`trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_tabs-trigger-h` | tabs 的 next-trigger、prev-trigger、trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tabs-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_tabs-trigger-px` | tabs 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-tabs-trigger-radius` | `indicator`<br>`trigger` | `border-radius` | `default`<br>`variant=segment` | `--xh-_tabs-trigger-radius` | tabs 的 indicator、trigger 部件 border-radius 覆盖槽。 |
| `--xh-tabs-trigger-shadow-active` | `indicator`<br>`root`<br>`trigger` | `box-shadow` | `is([data-variant='card'], [data-variant='segment'])`<br>`state=active`<br>`variant=card`<br>`variant=segment` | `--xh-_tabs-trigger-shadow-active`<br>`--xh-elevation-raised` | tabs 的 indicator、root、trigger 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background-color` · `block-size` · `box-shadow` · `color` · `inline-size` · `inset-block-start` · `inset-inline-start` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：值由内核逐帧算出（`frameLoop` · `isTweenDone` · `tweenValueAt`），皮肤里看不到这段；内核读系统的减弱动效偏好，据此决定要不要动。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
