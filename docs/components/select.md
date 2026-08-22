# 选择器 <Badge type="info" text="select" />

从一份已知清单里选一个或多个值，选项收在浮层里。

## 何时使用

- 选项五个以上、且都能列举出来。
- 需要多选并把选中项显示成标签。

## 何时不用

- 选项二到五个且都值得同时可见：用[单选组](./radio-group)。
- 用户需要输入自由文本或搜索候选：用[组合框](./combobox)。
- 选项是层级的：用[级联选择](./cascader)或[树选择](./tree-select)。

## 特性

- `hidden-select` 承担表单参与。
- 多选可以把选中项显示成标签，`maxTagCount` 折叠超出的部分。
- 浮层里可以有分组、底部操作区与滚动加载。
- 大量选项时列表可以只渲可视区。

## 示例

### 基础用法

选中值恒是数组，条目按 value 标识身份；禁用的条目方向键会跳过

<XhDemo src="select/01-basic" />

### 多选

multiple 下点中即在集合里增删该项、浮层不收起，触发器上的文本把选中项连起来

<XhDemo src="select/02-multiple" />

### 受控

传了 value 就由宿主说了算：组件只发 value-change，宿主写回它才变，这里把樱桃挡在门外

<XhDemo src="select/03-controlled" />

### 禁用

根部件的 disabled 把触发器转成原生 disabled，浮层展不开、也不占 Tab 位

<XhDemo src="select/04-disabled" />

### 形态

variant 只改触发器的颜色槽位，浮层与键盘行为三档一致

<XhDemo src="select/05-variant" />

### 语气

tone 决定用哪族颜色，与 variant 正交；这里固定 outline 只看语气的差别

<XhDemo src="select/06-tone" />

### 尺寸

触发器与浮层条目一起换档，不传 size 即默认档

<XhDemo src="select/07-size" />

### 异步加载选项

首次展开才去取数据：open-change 报出展开意图，数据到达前用一条禁用条目占位

<XhDemo src="select/08-async" />

### 宽度

触发器与浮层各有自己的宽度槽位，写在根部件上即可；装不下的文本在行内以省略号收口

<XhDemo src="select/09-width" />

### 选项里的自定义内容

条目与触发器显示的内容都由你写：想写什么写什么，选中与键盘行为不变

<XhDemo src="select/10-custom-content" />

### 插槽里的操作入口

根部件把 open、value 与 setOpen、setValue 交给插槽，浮层之外的按钮据此展开或清空

<XhDemo src="select/11-actions" />

### 大量选项

浮层高度封顶后自行滚动；敲首字母连打检索直接跳到该字母开头的条目，方向键照常可用

<XhDemo src="select/12-many-options" />

### 分组

条目分段展示：段落壳与段标题由作者写，条目照旧归到同一份集合，方向键与连打检索跨段贯通

<XhDemo src="select/13-group" />

### 多选标签

内建标签形态：api 的 tags 受 maxTagCount 截断、余数在 overflowCount；触发器里 XhSelectTag 纯展示，触发器外配 XhSelectTagRemove 即可删

<XhDemo src="select/14-tags" />

### 校验状态

校验结论由宿主给出：invalid 让触发器标红并输出 aria-invalid，错误文案用 aria-describedby 挂到触发器上

<XhDemo src="select/15-invalid" />

### 滚动加载

浮层的滚动容器就是 content：滚动事件直接落在它身上，滚到底就把下一页并进选项

<XhDemo src="select/16-scroll-load" />

### 命令式聚焦

触发器就是你写的那个按钮，focus 与 blur 直接调它

<XhDemo src="select/17-focus" />

### 清空按钮

清空钮是触发器的兄弟节点，一起收在 control 里并排（Vue 的 collection 自动渲染加 clearable 即带上它）；有选中才出现、出现即顶替下拉箭头，不占 Tab 位（键盘清空走 Delete / Backspace）；点按清空全部选中、不展开浮层，焦点回到触发器；可及名走 translations.clearTrigger

<XhDemo src="select/18-clear" />

### 浮层底部的操作区

footer 是 list 的兄弟：不随条目滚走，也不会被方向键与连打检索走到

<XhDemo src="select/19-footer" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-select>` |
| Vue 组件 | `XhSelectClearTrigger` `XhSelectContent` `XhSelectControl` `XhSelectFooter` `XhSelectIndicator` `XhSelectItem` `XhSelectItemIndicator` `XhSelectItemText` `XhSelectLabel` `XhSelectList` `XhSelectPositioner` `XhSelectRoot` `XhSelectTag` `XhSelectTagRemove` `XhSelectTrigger` `XhSelectValueText` |
| 组合式函数 | `useSelect` |
| 状态机 | `selectMachine` |
| 皮肤 | `@xihan-ui/styles/select.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="select"`：`root` · `label` · `control` · **`trigger`** · `value-text` · `indicator` · `clear-trigger` · `tag` · `tag-remove` · `positioner` · **`content`** · **`list`** · `footer` · **`item`** · `item-text` · `item-indicator` · `hidden-select`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `SelectNode[]` |  | 条目数据，显示文本与禁用的事实源。给了它，条目部件只需报 value， 显示文本也不再从活 DOM 现查。缺省即回到「文本写在条目里、现查 DOM」的老路。 |
| `value` | `string \| string[] \| null` |  | 选中值。裸串是单选的简写，null 是「受控且无选中」，缺省（undefined）才是非受控；内部一律按数组处理。 受控时 cell 直读 prop，写只发 onValueChange 不落内部值。 |
| `defaultValue` | `string \| string[] \| null` |  | 非受控初始选中值。与 value 同样接受裸串与 null。 |
| `multiple` | `boolean` |  | 允许选中多项。单选时选完即收起，多选时保持展开继续选。 |
| `open` | `boolean` |  | 展开态。给定即受控：内部不再自改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `disabled` | `boolean` |  | 整个控件禁用：trigger 用原生 disabled，隐藏 select 不参与提交。 |
| `readOnly` | `boolean` |  | 只读：浮层照常展开与浏览，但选中值改不动、也清不掉。 |
| `invalid` | `boolean` |  | 校验错误态：trigger 标红并输出 aria-invalid。 |
| `translations` | `Partial<SelectTranslations>` |  | 读屏用的文案，默认英文。 |
| `maxTagCount` | `number` |  | 多选标签最多摆几个，其余折进 overflowCount；缺省全摆。 |
| `required` | `boolean` |  | 原生表单校验：无选中值时提交被拦下。 |
| `name` | `string` |  | 表单字段名。给定后隐藏 select 才带 name，选中值随表单一并提交。 |
| `placeholder` | `string` |  | 无选中时 value-text 显示的占位文字。 |
| `placement` | `Placement` |  |  |
| `offset` | `number` |  |  |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定触发器的描边与底色怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定触发器高度、内边距与字号档位。 |
| `onValueChange` | `(details: SelectValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onOpenChange` | `(details: SelectOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `SelectValueChangeDetails` | 选中值变化；detail 为 `{ value: string[] }` |
| `open-change` | `SelectOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSelectRoot` | `default` | `SelectRootSlotProps` |  |
| `XhSelectRoot` | `label` | — |  |
| `XhSelectRoot` | `item` | `SelectNodeMeta` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `control` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `list` | 'open' \| 'closed' |
| `footer` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ITEM.HIGHLIGHT` · `HIGHLIGHT.CLEAR` · `ITEM.LOST` · `ITEM.SELECT` · `VALUE.SET` · `VALUE.CLEAR` · `FORM.RESET`

**判据**：`isOpenControlled` · `isMultiple` · `isReadOnly`

## connect API

`useSelect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `collection` | `readonly SelectNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `value` | `string[]` | 选中集合，按选中先后排列而非文档顺序。单选恒为长度 ≤ 1。 |
| `valueText` | `string[]` | 选中项的文本，与 value 逐项等长对应；某项在 DOM 里查不到条目时该项退回值本身。 |
| `displayText` | `string` | value-text 实际显示的文字：有选中取其文本（多选按半角逗号加空格连起来），否则取 placeholder。 |
| `multiple` | `boolean` | 是否允许多选。 |
| `invalid` | `boolean` | 校验错误态。 |
| `readOnly` | `boolean` | 只读态。 |
| `canClear` | `boolean` | 此刻能否清空：有选中且既不禁用也不只读。 |
| `tags` | `SelectTagMeta[]` | 可见标签（受 maxTagCount 截断），与 value/valueText 同序。 |
| `overflowCount` | `number` | 被 maxTagCount 折起来的标签数；作者据此渲染 +N。 |
| `highlightedValue` | `string \| null` | 高亮锚点；收起时为 null。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string \| string[]) => void` |  |
| `clear` | `() => void` | 清空全部选中。 |
| `deselect` | `(value: string) => void` | 摘掉一个选中值。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` | 触发器与清空按钮的收纳容器：两者在里面并排，有值时清空钮顶替展开指示符。 |
| `getTriggerProps` | `() => T['button']` |  |
| `getValueTextProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getClearTriggerProps` | `() => T['button']` | 清空按钮：不占 Tab 位；清不了时整个藏掉；点按清空全部选中、不展开浮层，焦点送回 trigger。 |
| `getTagProps` | `(props: SelectTagProps) => T['element']` | 标签：一个选中值一枚；放触发器里就是纯展示，放外面配 tag-remove 可删。 |
| `getTagRemoveProps` | `(props: SelectTagProps) => T['button']` | 标签删除按钮：点按摘掉所在标签的选中值；须放在 tag 部件里。 |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` | 浮层外壳：描边、底色、阴影与键盘收口都在它身上。 |
| `getListProps` | `() => T['element']` | 列表框本体，滚动在这一层；role=listbox 与条目的拥有关系都归它。 |
| `getFooterProps` | `() => T['element']` | 浮层底部的操作区，是 list 的兄弟；不在列表框的拥有关系里，也不参与方向键与连打检索。 |
| `getItemProps` | `(props: SelectItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: SelectItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: SelectItemProps) => T['element']` |  |
| `getHiddenSelectProps` | `() => T['select']` | 表单出口：一份视觉隐藏的原生 select，由根部件自行渲染（作者不必手写）。 选项由适配器按当前值补齐，原生提交与 required 校验据此拿到值。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | closed, focus in trigger | 展开列表并把高亮落到当前选中项（无选中则落首个可用条目） |
| `ArrowDown` | closed, focus in trigger | 展开列表并把高亮落到选中项的下一个可用条目 |
| `ArrowUp` | closed, focus in trigger | 展开列表并把高亮落到选中项的上一个可用条目 |
| `单个可打印字符` | closed, focus in trigger | 连打检索命中的条目直接成为选中值（多选是加进集合，已在集合里则不动），列表不展开 |
| `Delete` | closed, focus in trigger, 有选中值且未禁用、未只读 | 清空全部选中，列表不展开 |
| `Backspace` | closed, focus in trigger, 有选中值且未禁用、未只读 | 单选清空；多选去掉最后一个选中值，列表不展开 |
| `ArrowDown` | open, focus in content | 高亮移到下一个条目（禁用项跳过、尽头按 loop 回绕） |
| `ArrowUp` | open, focus in content | 高亮移到上一个条目（禁用项跳过、尽头按 loop 回绕） |
| `Home` | open, focus in content | 高亮移到首个可用条目 |
| `End` | open, focus in content | 高亮移到末个可用条目 |
| `单个可打印字符` | open, focus in content | 连打检索移动高亮，不改选中值 |
| `Enter` / `Space` | open, 单选, 高亮条目未禁用 | 选中高亮条目并关闭列表，焦点归还 trigger |
| `Enter` / `Space` | open, 多选, 高亮条目未禁用 | 切换高亮条目的选中态，列表不收起、焦点留在条目上 |
| `Escape` | open | 关闭列表并把焦点归还 trigger，选中值不变 |
| `Tab` / `Shift+Tab` | open | 关闭列表，焦点不归还 trigger，按 Tab 序列自然离开 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'listbox' |
| `trigger` | `aria-invalid` | 'true' \| 'false' |
| `trigger` | `aria-labelledby` | `label` 部件的 id `value-text` 部件的 id |
| `trigger` | `aria-readonly` | 'true' \| 'false' |
| `trigger` | `role` | 'combobox' |
| `indicator` | `aria-hidden` | 'true' |
| `clear-trigger` | `aria-label` | props.translations.clearTrigger |
| `tag-remove` | `aria-label` | (prop('translations')?.removeTag ?? 'Remove {label}')… |
| `list` | `aria-label` | props.translations.content |
| `list` | `aria-labelledby` | `label` 部件的 id `value-text` 部件的 id |
| `list` | `aria-multiselectable` | 'true' \| 'false' |
| `list` | `role` | 'listbox' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-indicator` | `aria-hidden` | 'true' |
| `hidden-select` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/select.css` 按部件选择：`[data-scope="select"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-invalid` | ''（条件成立时才出现） |
| `trigger` | `data-placeholder` | ''（条件成立时才出现） |
| `trigger` | `data-readonly` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `value-text` | `data-disabled` | ''（条件成立时才出现） |
| `value-text` | `data-placeholder` | ''（条件成立时才出现） |
| `indicator` | `data-clearable` | ''（条件成立时才出现） |
| `indicator` | `data-disabled` | ''（条件成立时才出现） |
| `indicator` | `data-state` | 'open' \| 'closed' |
| `tag` | `data-disabled` | ''（条件成立时才出现） |
| `tag` | `data-value` | v |
| `tag-remove` | `data-disabled` | ''（条件成立时才出现） |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `positioner` | `data-variant` | props.variant |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-state` | 'open' \| 'closed' |
| `list` | `data-state` | 'open' \| 'closed' |
| `footer` | `data-state` | 'open' \| 'closed' |
| `item` | `data-highlighted` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-select-action-bg` · `--xh-select-action-bg-active` · `--xh-select-action-bg-hover` · `--xh-select-action-fg` · `--xh-select-action-fg-hover` · `--xh-select-action-font-size` · `--xh-select-action-radius` · `--xh-select-action-size` · `--xh-select-content-bg` · `--xh-select-content-border` · `--xh-select-content-fg` · `--xh-select-content-max-h` · `--xh-select-content-max-w` · `--xh-select-content-min-w` · `--xh-select-content-px` · `--xh-select-content-py` · `--xh-select-content-radius` · `--xh-select-content-shadow` · `--xh-select-control-gap` · `--xh-select-footer-border` · `--xh-select-footer-fg` · `--xh-select-footer-font-size` · `--xh-select-footer-gap` · `--xh-select-footer-px` · `--xh-select-footer-py` · `--xh-select-gap` · `--xh-select-icon-size` · `--xh-select-indicator-fg` · `--xh-select-item-bg-hover` · `--xh-select-item-fg` · `--xh-select-item-fg-selected` · `--xh-select-item-font-size` · `--xh-select-item-font-weight-selected` · `--xh-select-item-gap` · `--xh-select-item-indicator-fg` · `--xh-select-item-indicator-size` · `--xh-select-item-leading` · `--xh-select-item-px` · `--xh-select-item-py` · `--xh-select-item-radius` · `--xh-select-label-fg` · `--xh-select-label-font-size` · `--xh-select-label-font-weight` · `--xh-select-layer` · `--xh-select-placeholder-fg` · `--xh-select-tag-bg` · `--xh-select-tag-fg` · `--xh-select-tag-font-size` · `--xh-select-tag-gap` · `--xh-select-tag-px` · `--xh-select-tag-radius` · `--xh-select-tag-remove-bg-active` · `--xh-select-tag-remove-bg-hover` · `--xh-select-tag-remove-fg` · `--xh-select-tag-remove-fg-hover` · `--xh-select-tag-remove-radius` · `--xh-select-tag-remove-size` · `--xh-select-trigger-bg` · `--xh-select-trigger-bg-readonly` · `--xh-select-trigger-border` · `--xh-select-trigger-border-focus` · `--xh-select-trigger-border-hover` · `--xh-select-trigger-border-invalid` · `--xh-select-trigger-fg` · `--xh-select-trigger-font-size` · `--xh-select-trigger-gap` · `--xh-select-trigger-h` · `--xh-select-trigger-max-w` · `--xh-select-trigger-min-w` · `--xh-select-trigger-px` · `--xh-select-trigger-radius`

## 动效

关键帧 `xh-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 外面套[表单字段](./field)；选项文字过长时里面用[文本省略](./ellipsis)。

## 最佳实践

- 触发器的宽度固定，别随选中项的长度变——整行布局会跟着抖。
- 选项超过约二十条就该加搜索，也就是换成[组合框](./combobox)。

## 反模式

- 用它承载动作（"导出"、"删除"）：那是[菜单](./menu)。
- 异步加载选项时浮层里什么都不显示：给一个加载态或空态。
