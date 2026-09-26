# Accordion 手风琴

一列可展开的区块，标题常驻，内容按需展开。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/accordion" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/accordion.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/accordion" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/accordion" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/accordion.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

默认单开：展开一项即收起其余，defaultValue 只提供初始值，之后由组件自行维护

<XhDemo src="accordion/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="accordion"`：`root` · `item` · `item-separator` · `header` · **`trigger`** · **`content`** · `indicator`

## 示例

### 多项展开

multiple 允许多项并存，展开集合恒为 string[]，受控绑定即可获取它

<XhDemo src="accordion/02-multiple" />

### 允许全部收起

单开模式下最后一项默认无法收起，加 collapsible 后才能收起

<XhDemo src="accordion/03-collapsible" />

### 指示器与禁用

indicator 的朝向由 data-state 驱动，禁用项不可点击、方向键也跳过它

<XhDemo src="accordion/04-indicator" />

### 颜色

tone 落在展开态的标题上，六种颜色各预置一项展开做对照

<XhDemo src="accordion/05-tone" />

### 尺寸

size 改变标题栏的高度、内边距与字号，三档并排对照

<XhDemo src="accordion/06-size" />

### 嵌套

content 中再放一组手风琴，内外两组各自维护展开集合，方向键也各自独立

<XhDemo src="accordion/07-nested" />

### 标题栏附加信息

标题栏中的节点全部归作者，把计数与指示器包为一组排在末尾

<XhDemo src="accordion/08-header-extra" />

### 指示器在前

指示器写在标题之前即落到起始缘，标题用 auto 外边距占据余量

<XhDemo src="accordion/09-indicator-start" />

### 缩小触发区域

trigger 只包住指示器，标题文字留在 header 里，点标题不再展开

<XhDemo src="accordion/10-trigger-area" />

### 自定义展开图标

indicator 是可选部件，不渲染它就没有默认字形；标记由作者按展开集合自行绘制

<XhDemo src="accordion/11-custom-icon" />

### 变体

ghost 不绘制外壳，outline 连成单一表面，subtle 用淡底；三档只改变与页面分开的方式

<XhDemo src="accordion/12-variant" />

## 设计指引

### 何时使用

- 常见问题、设置分组等由标题即可判断是否需要展开的内容。
- 内容较长，一次全部铺开会使页面失去结构。

### 何时不用

- 只有一块内容时，使用[折叠区域](./collapsible)。
- 各块内容需要对照阅读时，直接铺开。
- 各块是并列视图且同一时间只看一个时，使用[标签页](./tabs)。

### 特性

- `multiple` 决定能否同时展开多项，`collapsible` 决定能否全部收起。
- 指示器可置于标题前或标题后，图形可自定义。
- 支持嵌套；触发区大小由作者决定。

### 组合

- 标题栏可以放置附加信息，如计数或状态[徽标](./badge)。

### 最佳实践

- 标题应说明区块内容，不依赖展开来发现。
- 默认展开第一项，让用户看到内容的形态。

### 反模式

- 将关键信息放进折叠区块，用户不会逐个展开。
- 展开时页面下方内容大幅跳动而没有滚动补偿。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-accordion>` |
| Vue 组件 | `XhAccordionContent` `XhAccordionHeader` `XhAccordionIndicator` `XhAccordionItem` `XhAccordionItemSeparator` `XhAccordionRoot` `XhAccordionTrigger` |
| 组合式函数 | `useAccordion` |
| 状态机 | `accordionMachine` |
| 皮肤 | `@xihan-ui/styles/accordion.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `AccordionNode[]` |  | 条目数据，标题文本、正文与禁用的事实源。提供后条目部件只需声明 value。 未提供时回到文本写在部件中、禁用写在条目上的方式。 |
| `value` | `string[]` |  | 展开集合，提供即受控。 |
| `defaultValue` | `string[]` |  |  |
| `multiple` | `boolean` |  | 允许多项同时展开；false 时展开一项即收起其余。 |
| `collapsible` | `boolean` |  | 允许收起最后一个展开项，默认 false。 |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 false。 |
| `disabled` | `boolean` |  | 整组禁用：所有条目都不可切换，条目上的 disabled 只能收紧不能放宽。 |
| `variant` | `ControlVariant` |  | 形态：ghost 条目直接相邻不画容器（默认），outline 为单一连续表面，subtle 为淡底。默认 ghost。 |
| `orientation` | `Orientation` |  | 方向键轴向，默认 vertical。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；影响水平轴上 ArrowLeft / ArrowRight 的语义。 |
| `tone` | `Tone` |  | 颜色：brand / neutral / success / warning / danger / info，决定使用哪组状态色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: AccordionValueChangeDetails) => void` |  | 展开集合变化回调。 |

### AccordionNode

`collection` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | 是 |  |
| `label` | `string` |  | 标题文本；默认回退为 value。 |
| `content` | `string` |  | 正文；需要放置纯文本以外的内容时改用 content 插槽。 |
| `disabled` | `boolean` |  | 条目禁用：方向键跳过该条目，但它仍可聚焦、仍是导航起点。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `AccordionValueChangeDetails` | 展开集合变化；detail 为 `{ value: string[] }` |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhAccordionItem` | `value` | `string` | 是 |  |
| `XhAccordionItem` | `disabled` | `boolean` |  | 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 |
| `XhAccordionRoot` | `renderContent` | `(node: AccordionNodeMeta) => ReactNode` |  | 每个条目正文的自定义内容；未提供时使用 collection 中的 content。 |
| `XhAccordionRoot` | `children` | `ReactNode` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `item` | 'open' \| 'closed' |
| `header` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`ITEM.TOGGLE` · `VALUE.SET` · `PRESS.START` · `PRESS.END`

**判据**：`canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` | 当前展开集合，单开模式下长度 ≤ 1。 |
| `collection` | `readonly AccordionNodeMeta[]` | 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `setValue` | `(next: string[]) => void` |  |
| `isOpen` | `(value: string) => boolean` |  |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(props: AccordionItemProps) => T['element']` |  |
| `getItemSeparatorProps` | `() => T['element']` |  |
| `getHeaderProps` | `(props: AccordionItemProps) => T['element']` |  |
| `getTriggerProps` | `(props: AccordionItemProps) => T['button']` |  |
| `getContentProps` | `(props: AccordionItemProps) => T['element']` |  |
| `getIndicatorProps` | `(props: AccordionItemProps) => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in trigger, not disabled | 展开/收起该条目的 content |
| `ArrowDown` / `ArrowRight` | focus in trigger, 按键与 orientation 同轴（dir=rtl 时左右键语义互换） | 焦点移到下一个 trigger，末条不回绕 |
| `ArrowUp` / `ArrowLeft` | focus in trigger, 按键与 orientation 同轴（dir=rtl 时左右键语义互换） | 焦点移到上一个 trigger，首条不回绕 |
| `Home` | focus in trigger | 焦点移到首个 trigger |
| `End` | focus in trigger | 焦点移到末个 trigger |
| `Tab` / `Shift+Tab` | focus in trigger | 按文档序进出：每个 trigger 都是独立 Tab 停靠点，无 roving tabindex |
| `Enter` / `Space` | held in trigger, not disabled | 按住期间该 trigger 投影 data-pressed，与指针 :active 同一副按压面（disclosure trigger 只换面不缩放）；抬起、失焦或整组转禁用撤下 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `item-separator` | `aria-hidden` | 'true' |
| `header` | `aria-level` | 3 |
| `header` | `role` | 'heading' |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `role` | 'region' |
| `indicator` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/accordion.css` 使用 `[data-scope="accordion"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-state` | 'open' \| 'closed' |
| `header` | `data-disabled` | ''（条件成立时才出现） |
| `header` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-pressed` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'disclosure-trigger' |
| `trigger` | `data-xh-action-size` | props.size |
| `trigger` | `data-xh-action-variant` | 'ghost' |
| `content` | `data-instant` | '' |
| `content` | `data-state` | 'open' \| 'closed' |
| `indicator` | `data-disabled` | ''（条件成立时才出现） |
| `indicator` | `data-instant` | '' |
| `indicator` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-accordion-border` | `root` | `border` | `variant=outline` | `--xh-border-default` | accordion 的 root 部件 border 覆盖槽。 |
| `--xh-accordion-content-fg` | `content` | `color` | `default` | `--xh-fg-muted` | accordion 的 content 部件 color 覆盖槽。 |
| `--xh-accordion-content-font-size` | `content` | `font-size` | `default` | `--xh-text-secondary-size` | accordion 的 content 部件 font-size 覆盖槽。 |
| `--xh-accordion-content-pb` | `content` | `padding-block-end` | `@keyframes xh-disclosure-collapse`<br>`@keyframes xh-disclosure-expand`<br>`default` | `--xh-_accordion-content-pb` | accordion 的 content 部件 padding-block-end 覆盖槽。 |
| `--xh-accordion-content-px` | `content` | `padding-inline` | `default` | `--xh-_accordion-content-px` | accordion 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-accordion-icon-size` | `root`<br>`trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md` | accordion 的 root、trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-accordion-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-muted` | accordion 的 indicator 部件 color 覆盖槽。 |
| `--xh-accordion-item-bg` | `root` | `background` | `variant=outline`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface` | accordion 的 root 部件 background 覆盖槽。 |
| `--xh-accordion-item-border` | `item`<br>`item-separator`<br>`root` | `background`<br>`border-block-start`<br>`border-inline-start` | `default`<br>`is([data-variant='outline'], [data-variant='subtle'])`<br>`not(:last-child)`<br>`orientation=horizontal`<br>`variant=outline`<br>`variant=subtle` | `--xh-border-subtle` | accordion 的 item、item-separator、root 部件 background、border-block-start、border-inline-start 覆盖槽。 |
| `--xh-accordion-item-radius` | `root` | `border-radius` | `variant=outline`<br>`variant=subtle` | `--xh-shape-surface` | accordion 的 root 部件 border-radius 覆盖槽。 |
| `--xh-accordion-item-shadow` | `root` | `box-shadow` | `variant=outline`<br>`variant=subtle` | `none` | accordion 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-accordion-trigger-bg` | `trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` | accordion 的 trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-accordion-trigger-bg-hover` | `trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | accordion 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-accordion-trigger-fg` | `trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | accordion 的 trigger 部件 color 覆盖槽。 |
| `--xh-accordion-trigger-fg-disabled` | `trigger` | `color` | `disabled` | `--xh-_action-variant-fg-disabled` | accordion 的 trigger 部件 color 覆盖槽。 |
| `--xh-accordion-trigger-fg-open` | `trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=open` | `--xh-_accordion-open-fg` | accordion 的 trigger 部件 color 覆盖槽。 |
| `--xh-accordion-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_action-profile-font-size` | accordion 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-accordion-trigger-font-weight` | `trigger` | `font-weight` | `default` | `--xh-text-label-weight` | accordion 的 trigger 部件 font-weight 覆盖槽。 |
| `--xh-accordion-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_action-profile-gap` | accordion 的 trigger 部件 gap 覆盖槽。 |
| `--xh-accordion-trigger-h` | `trigger` | `block-size`<br>`min-block-size` | `default`<br>`xh-action-profile=disclosure-trigger` | `--xh-_action-profile-visual-size` | accordion 的 trigger 部件 block-size、min-block-size 覆盖槽。 |
| `--xh-accordion-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | accordion 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-accordion-trigger-py` | `trigger` | `padding-block` | `xh-action-profile=disclosure-trigger` | `--xh-_action-profile-padding-block` | accordion 的 trigger 部件 padding-block 覆盖槽。 |
| `--xh-accordion-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-_action-profile-radius` | accordion 的 trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 披露（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-disclosure-collapse` · `xh-disclosure-expand` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`rotate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
