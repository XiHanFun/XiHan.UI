# Accordion 手风琴

一列可展开的区块，标题常驻、内容按需展开。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/accordion" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/accordion.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/accordion" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/accordion" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/accordion.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

默认单开：展开一项即收起其余，defaultValue 只给初始值，之后由组件自己维护

<XhDemo src="accordion/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="accordion"`：`root` · `item` · `item-separator` · `header` · **`trigger`** · **`content`** · `indicator`

## 示例

### 多项展开

multiple 允许多项并存，展开集合恒为 string[]，受控绑定即可拿到它

<XhDemo src="accordion/02-multiple" />

### 允许全收

单开模式下最后一项默认收不起来，加 collapsible 才能把它也收上

<XhDemo src="accordion/03-collapsible" />

### 指示器与禁用

indicator 的朝向由 data-state 驱动，禁用项点不动、方向键也跳过它

<XhDemo src="accordion/04-indicator" />

### 语气

tone 落在展开态的标题上，六种语气各预置一项展开做对照

<XhDemo src="accordion/05-tone" />

### 尺寸

size 换的是标题栏的高度、内边距与字号，三档并排对照

<XhDemo src="accordion/06-size" />

### 嵌套

content 里再放一组手风琴，内外两组各自维护展开集合，方向键也各管各的

<XhDemo src="accordion/07-nested" />

### 标题栏附加信息

标题栏里的节点全归作者，把计数与指示器包成一组排在末尾

<XhDemo src="accordion/08-header-extra" />

### 指示器在前

指示器写在标题之前就落到起始缘，标题拿 auto 外边距吃掉余量

<XhDemo src="accordion/09-indicator-start" />

### 缩小触发区域

trigger 只包住指示器，标题文字留在 header 里，点标题不再展开

<XhDemo src="accordion/10-trigger-area" />

### 自定义展开图标

indicator 是可选部件，不渲染它就没有默认字形；标记由作者按展开集合自己画

<XhDemo src="accordion/11-custom-icon" />

### 形态

plain 不画壳，surface 给整块一层面，bordered 逐条画边；三档只改怎么与页面分开

<XhDemo src="accordion/12-variant" />

## 设计指引

### 何时使用

- 常见问题、设置分组这类"标题足以判断要不要看"的内容。
- 内容很长，一次全铺开会让页面失去结构。

### 何时不用

- 只有一块内容：用[折叠区域](./collapsible)。
- 各块内容需要对照着看：直接铺开。
- 各块是并列视图、同时只看一个：用[标签页](./tabs)。

### 特性

- `multiple` 决定能不能同时展开多项，`collapsible` 决定能不能全部收起。
- 指示器可以放前也可以放后，图形自定。
- 可以嵌套；触发区大小由作者决定。

### 组合

- 标题栏里可以挂附加信息（计数、状态[徽标](./badge)）。

### 最佳实践

- 标题写清楚里面是什么，用户不该靠展开来发现。
- 默认展开第一项，让用户看见内容长什么样。

### 反模式

- 把关键信息藏进折叠：用户不会逐个点开。
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
| `collection` | `AccordionNode[]` |  | 条目数据，标题文本、正文与禁用的事实源。给了它，条目部件只需报 value。 缺省即回到「文本写在部件里、禁用写在条目上」的老路。 |
| `value` | `string[]` |  | 展开集合，给定即受控。 |
| `defaultValue` | `string[]` |  |  |
| `multiple` | `boolean` |  | 允许多项同时展开；false 时展开一项即收起其余。 |
| `collapsible` | `boolean` |  | 允许把最后一个展开项收起，默认 false。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 false。 |
| `disabled` | `boolean` |  | 整组禁用：所有条目都不可切换，条目上写的 disabled 只能更严不能放宽。 |
| `variant` | `AccordionVariant` |  | 形态：plain / surface / bordered，决定条目怎么与页面分开。缺省 plain。 |
| `orientation` | `Orientation` |  | 方向键轴向，默认 vertical。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；影响水平轴上 ArrowLeft/ArrowRight 的语义。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: AccordionValueChangeDetails) => void` |  | 展开集合变化回调。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `AccordionValueChangeDetails` | 展开集合变化；detail 为 `{ value: string[] }` |

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

**事件**：`ITEM.TOGGLE` · `VALUE.SET`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` | 当前展开集合，单开模式下长度 ≤ 1。 |
| `collection` | `readonly AccordionNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
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
| `trigger` | `data-state` | 'open' \| 'closed' |
| `content` | `data-state` | 'open' \| 'closed' |
| `indicator` | `data-disabled` | ''（条件成立时才出现） |
| `indicator` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-accordion-content-fg` | `content` | `color` | `default` | `--xh-fg-default` | accordion 的 content 部件 color 覆盖槽。 |
| `--xh-accordion-content-px` | `content` | `padding-inline` | `default` | `--xh-control-px-md` | accordion 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-accordion-content-py` | `*`<br>`content` | `padding-block` | `@keyframes xh-accordion-collapse`<br>`@keyframes xh-accordion-expand`<br>`default` | `--xh-stack-gap-md` | accordion 的 *、content 部件 padding-block 覆盖槽。 |
| `--xh-accordion-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | accordion 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-accordion-item-bg` | `item`<br>`root` | `background` | `variant=surface` | `--xh-bg-surface` | accordion 的 item、root 部件 background 覆盖槽。 |
| `--xh-accordion-item-border` | `item`<br>`item-separator`<br>`root` | `background`<br>`border`<br>`border-block-start`<br>`border-inline-start` | `default`<br>`orientation=horizontal`<br>`variant=bordered` | `--xh-border-subtle` | accordion 的 item、item-separator、root 部件 background、border、border-block-start、border-inline-start 覆盖槽。 |
| `--xh-accordion-item-gap` | `root` | `gap` | `is([data-variant='surface'], [data-variant='bordered'])`<br>`variant=bordered`<br>`variant=surface` | `--xh-space-2` | accordion 的 root 部件 gap 覆盖槽。 |
| `--xh-accordion-item-radius` | `item`<br>`root` | `border-radius` | `variant=bordered`<br>`variant=surface` | `--xh-shape-surface` | accordion 的 item、root 部件 border-radius 覆盖槽。 |
| `--xh-accordion-item-shadow` | `item`<br>`root` | `box-shadow` | `variant=surface` | `--xh-elevation-raised` | accordion 的 item、root 部件 box-shadow 覆盖槽。 |
| `--xh-accordion-trigger-bg` | `trigger` | `background` | `default` | `transparent` | accordion 的 trigger 部件 background 覆盖槽。 |
| `--xh-accordion-trigger-bg-hover` | `trigger` | `background` | `disabled`<br>`hover`<br>`not([data-disabled])` | `--xh-bg-subtle` | accordion 的 trigger 部件 background 覆盖槽。 |
| `--xh-accordion-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` | accordion 的 trigger 部件 color 覆盖槽。 |
| `--xh-accordion-trigger-fg-open` | `trigger` | `color` | `state=open` | `--xh-_accordion-open-fg` | accordion 的 trigger 部件 color 覆盖槽。 |
| `--xh-accordion-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_accordion-trigger-font-size` | accordion 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-accordion-trigger-font-weight` | `trigger` | `font-weight` | `default` | `--xh-text-label-weight` | accordion 的 trigger 部件 font-weight 覆盖槽。 |
| `--xh-accordion-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_accordion-trigger-gap` | accordion 的 trigger 部件 gap 覆盖槽。 |
| `--xh-accordion-trigger-h` | `trigger` | `block-size` | `default` | `--xh-_accordion-trigger-h` | accordion 的 trigger 部件 block-size 覆盖槽。 |
| `--xh-accordion-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_accordion-trigger-px` | accordion 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-accordion-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | accordion 的 trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-accordion-collapse` · `xh-accordion-expand` 随皮肤自带，不引用别处文件里的名字；`rotate` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
