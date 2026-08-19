# 手风琴 <Badge type="info" text="accordion" />

一列可展开的区块，标题常驻、内容按需展开。

## 何时使用

- 常见问题、设置分组这类"标题足以判断要不要看"的内容。
- 内容很长，一次全铺开会让页面失去结构。

## 何时不用

- 只有一块内容：用[折叠区域](./collapsible)。
- 各块内容需要对照着看：直接铺开。
- 各块是并列视图、同时只看一个：用[标签页](./tabs)。

## 特性

- `multiple` 决定能不能同时展开多项，`collapsible` 决定能不能全部收起。
- 指示器可以放前也可以放后，图形自定。
- 可以嵌套；触发区大小由作者决定。

## 示例

### 基础用法

默认单开：展开一项即收起其余，defaultValue 只给初始值，之后由组件自己维护

<XhDemo src="accordion/01-basic" />

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

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-accordion>` |
| Vue 组件 | `XhAccordionContent` `XhAccordionHeader` `XhAccordionIndicator` `XhAccordionItem` `XhAccordionRoot` `XhAccordionTrigger` |
| 组合式函数 | `useAccordion` |
| 状态机 | `accordionMachine` |
| 皮肤 | `@xihan-ui/styles/accordion.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="accordion"`：`root` · `item` · `header` · **`trigger`** · **`content`** · `indicator`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `AccordionNode[]` |  | 条目数据，标题文本、正文与禁用的事实源。给了它，条目部件只需报 value。 缺省即回到「文本写在部件里、禁用写在条目上」的老路。 |
| `value` | `string[]` |  | 展开集合，给定即受控。 |
| `defaultValue` | `string[]` |  |  |
| `multiple` | `boolean` |  | 允许多项同时展开；false 时展开一项即收起其余。 |
| `collapsible` | `boolean` |  | 允许把最后一个展开项收起，默认 false。 |
| `orientation` | `Orientation` |  | 方向键轴向，默认 vertical。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；影响水平轴上 ArrowLeft/ArrowRight 的语义。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: AccordionValueChangeDetails) => void` |  | 展开集合变化回调。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `AccordionValueChangeDetails` | 展开集合变化；detail 为 `{ value: string[] }` |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `item` | 'open' \| 'closed' |
| `header` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`ITEM.TOGGLE` · `VALUE.SET`

## connect API

`useAccordion` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` | 当前展开集合，单开模式下长度 ≤ 1。 |
| `collection` | `readonly AccordionNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `setValue` | `(next: string[]) => void` |  |
| `isOpen` | `(value: string) => boolean` |  |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(props: AccordionItemProps) => T['element']` |  |
| `getHeaderProps` | `(props: AccordionItemProps) => T['element']` |  |
| `getTriggerProps` | `(props: AccordionItemProps) => T['button']` |  |
| `getContentProps` | `(props: AccordionItemProps) => T['element']` |  |
| `getIndicatorProps` | `(props: AccordionItemProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in trigger, not disabled | 展开/收起该条目的 content |
| `ArrowDown` / `ArrowRight` | focus in trigger, 按键与 orientation 同轴（dir=rtl 时左右键语义互换） | 焦点移到下一个 trigger，末条不回绕 |
| `ArrowUp` / `ArrowLeft` | focus in trigger, 按键与 orientation 同轴（dir=rtl 时左右键语义互换） | 焦点移到上一个 trigger，首条不回绕 |
| `Home` | focus in trigger | 焦点移到首个 trigger |
| `End` | focus in trigger | 焦点移到末个 trigger |
| `Tab` / `Shift+Tab` | focus in trigger | 按文档序进出：每个 trigger 都是独立 Tab 停靠点，无 roving tabindex |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `header` | `aria-level` | 3 |
| `header` | `role` | 'heading' |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `role` | 'region' |
| `indicator` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/accordion.css` 按部件选择：`[data-scope="accordion"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-state` | 'open' \| 'closed' |
| `header` | `data-disabled` | ''（条件成立时才出现） |
| `header` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `content` | `data-state` | 'open' \| 'closed' |
| `indicator` | `data-disabled` | ''（条件成立时才出现） |
| `indicator` | `data-state` | 'open' \| 'closed' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-accordion-content-fg` · `--xh-accordion-content-px` · `--xh-accordion-content-py` · `--xh-accordion-item-border` · `--xh-accordion-trigger-bg` · `--xh-accordion-trigger-bg-hover` · `--xh-accordion-trigger-fg` · `--xh-accordion-trigger-font-size` · `--xh-accordion-trigger-font-weight` · `--xh-accordion-trigger-gap` · `--xh-accordion-trigger-h` · `--xh-accordion-trigger-px` · `--xh-accordion-trigger-radius`

## 动效

关键帧 `xh-accordion-collapse` · `xh-accordion-expand` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 标题栏里可以挂附加信息（计数、状态[徽标](./badge)）。

## 最佳实践

- 标题写清楚里面是什么，用户不该靠展开来发现。
- 默认展开第一项，让用户看见内容长什么样。

## 反模式

- 把关键信息藏进折叠：用户不会逐个点开。
- 展开时页面下方内容大幅跳动而没有滚动补偿。
