# 选择器 <Badge type="info" text="select" />

从一份已知清单里选一个或多个值，选项收在浮层里。

## 何时使用

- 选项五个以上、且都能列举出来。
- 需要多选并把选中项显示成标签。

## 何时不用

- 选项二到五个且都值得同时可见：用[单选组](./radio-group)。
- 用户需要输入自由文本或搜索候选：用[组合框](./combobox)。
- 选项是层级的：用[级联选择](./cascader)或[树选择](./tree-select)。
- 值不随表单提交、只是就地切一个视图参数：把[列表框](./listbox)装进[浮层](./popover)，那一套组合更轻，也不占 `name`。

## 特性

- `hidden-select` 承担表单参与。
- 多选可以把选中项显示成标签行：最多摆 `maxTagCount` 枚（缺省 3），其余合成一枚 +N，触发器始终是一行。每枚标签都是库里的 tag；摆在触发器外时可以配删除钮，那颗钮就是 tag 的 `close-trigger`。
- 浮层里可以有分组、底部操作区与滚动加载。
- 三种非条目相位各有部件：空（`empty`）与在途（`loading`）。`loading` 为真时列表报 `aria-busy`，在途占位顶上来、空态让位。
- 大量选项时列表可以只渲可视区。
- 触发盒保持实体 Field Chrome，选项浮层使用 M2 磨砂表面；面板落位后按实际 placement 从锚点一侧
  淡入短移，退出沿原方向收回，不缩放整张列表。
- 逻辑关闭时列表立即 `inert` 并退出可访问树；Layer、DismissableLayer 与焦点域会保留到
  content 的全部有限退场动画完成。退场中重开复用原 Layer 并重新激活焦点域，卸载立即释放。
- 选项按作者给出的 DOM 顺序排布；正式 `item-text` 弹性占据剩余宽度并负责长文省略，
  `item-indicator` 固定在逻辑末端。单选、多选统一由对号表示选中，正文保持正常颜色和字重；
  悬停与键盘高亮使用中性底，键盘焦点另有独立焦点环。选中本身不铺品牌底。
- `item` 由 Headless 投影 Collection Item 的角色、尺寸、selected/checked/disabled 事实；`item-text`
  与 `item-indicator` 投影固定内容列。三端适配器只展开这些属性，不各自判断视觉状态。
- 相邻分组之间自动画材质分隔线，分组标题、空态、加载态与 footer 使用浮层的次要前景节奏。

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

variant 只改盒的颜色槽位，浮层与键盘行为三档一致

<XhDemo src="select/05-variant" />

### 语气

tone 决定用哪族颜色，与 variant 正交；这里固定 outline 只看语气的差别

<XhDemo src="select/06-tone" />

### 尺寸

盒与浮层条目一起换档，不传 size 即默认档

<XhDemo src="select/07-size" />

### 异步加载选项

首次展开才去取数据：open-change 报出展开意图，数据到达前使用正式加载状态

<XhDemo src="select/08-async" />

### 宽度

盒与浮层各有自己的宽度槽位，写在根部件上即可；装不下的文本在行内以省略号收口

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

条目分段展示：group 是 role=group 的段落壳，group-label 是它的可及名字；条目照旧归到同一份集合，方向键与连打检索跨段贯通

<XhDemo src="select/13-group" />

### 多选标签

内建标签形态：触发器里的标签行最多摆 maxTagCount 枚（缺省 3），其余合成一枚 +N；每枚标签与 +N 都是库里的 tag（语气与尺寸随控件，形态按控件的面派），触发器里纯展示，触发器外配删除钮即可删，那颗钮就是 tag 的 close-trigger

<XhDemo src="select/14-tags" />

### 校验状态

校验结论由宿主给出：invalid 让盒标红并输出 aria-invalid，错误文案用 aria-describedby 挂到触发器上

<XhDemo src="select/15-invalid" />

### 滚动加载

list 承担选项滚动：滚到底追加下一页，独立加载状态不会混入可选项

<XhDemo src="select/16-scroll-load" />

### 命令式聚焦

触发器就是你写的那个按钮，focus 与 blur 直接调它

<XhDemo src="select/17-focus" />

### 清空按钮

清空钮是触发器的兄弟节点，一起收在盒里并排（Vue 的 collection 自动渲染加 clearable 即带上它）；有选中才出现、出现即顶替下拉箭头，不占 Tab 位（键盘清空走 Delete / Backspace）；点按清空全部选中、不展开浮层，焦点回到触发器；可及名走 translations.clearTrigger

<XhDemo src="select/18-clear" />

### 浮层底部的操作区

footer 是 list 的兄弟：不随条目滚走，也不会被方向键与连打检索走到

<XhDemo src="select/19-footer" />

### 官方组合：浮层 + 列表框

值不进表单、只是就地切一个视图参数时用这一套：popover 管开合与定位，listbox 管条目与键盘，没有 hidden-select，也不占 name

<XhDemo src="select/20-listbox-popover" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-select>` |
| Vue 组件 | `XhSelectClearTrigger` `XhSelectContent` `XhSelectControl` `XhSelectEmpty` `XhSelectFooter` `XhSelectGroup` `XhSelectGroupLabel` `XhSelectIndicator` `XhSelectItem` `XhSelectItemDeleteTrigger` `XhSelectItemIndicator` `XhSelectItemText` `XhSelectLabel` `XhSelectList` `XhSelectLoading` `XhSelectOverflowTag` `XhSelectPositioner` `XhSelectRoot` `XhSelectTag` `XhSelectTagLabel` `XhSelectTagList` `XhSelectTrigger` `XhSelectValueText` |
| 组合式函数 | `useSelect` |
| 状态机 | `selectMachine` |
| 皮肤 | `@xihan-ui/styles/select.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="select"`：`root` · `label` · `control` · **`trigger`** · `value-text` · `indicator` · `clear-trigger` · `tag-list` · `positioner` · **`content`** · **`list`** · `footer` · `group` · `group-label` · `item` · `item-text` · `item-indicator` · `empty` · `loading` · `hidden-select`

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
| `loading` | `boolean` |  | 条目还在取：列表报 aria-busy，在途占位顶上来、空态占位让位。 |
| `translations` | `Partial<SelectTranslations>` |  | 读屏用的文案，默认英文。 |
| `maxTagCount` | `number` |  | 多选标签最多摆几枚，其余折进 overflowCount、合成 +N 那一枚；缺省 3（SELECT_DEFAULT_MAX_TAG_COUNT）。 |
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
| `empty` | 'open' \| 'closed' |
| `loading` | 'open' \| 'closed' |

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
| `overflowCount` | `number` | 被 maxTagCount 折起来的标签数。 |
| `overflowText` | `string` | +N 那一枚显示的文字（translations.overflowTag 算出）；没有折起的标签时为空串。 |
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
| `getTagListProps` | `() => T['element']` | 标签行：收着可见标签与 +N 那一枚，放在触发器里；无选中时整个 hidden。 |
| `getTagProps` | `(props: SelectTagProps) => T['element']` | 标签：一个选中值一枚，就是库里 tag 的 root（data-scope="tag"）：语气、尺寸与禁用从本控件传下去，形态按控件的面派（outline / ghost / 缺省摆淡底标签，subtle 摆描边标签），另带 data-value 记它代表哪个值。放触发器里就是纯展示（不渲关闭钮），放外面配删除钮可删。 |
| `getTagLabelProps` | `() => T['element']` | 标签文字所在的块（tag 的 label）：截断落在这一层；标签与 +N 共用。 |
| `getOverflowTagProps` | `() => T['element']` | 被折起的标签合成的那一枚：同样是 tag 的 root，显示 overflowText、带 data-count；没有折起的标签时 hidden。 |
| `getItemDeleteTriggerProps` | `(props: SelectTagProps) => T['button']` | 标签删除按钮：就是所在标签那份 tag 的 close-trigger（data-scope="tag"），可及名走 translations.deleteItem，禁用时留位、原生 disabled；点按摘掉所在标签的选中值；须放在标签里。 |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` | 浮层外壳：描边、底色、阴影与键盘收口都在它身上。 |
| `getListProps` | `() => T['element']` | 列表框本体，滚动在这一层；role=listbox 与条目的拥有关系都归它。 |
| `getFooterProps` | `() => T['element']` | 浮层底部的操作区，是 list 的兄弟；不在列表框的拥有关系里，也不参与方向键与连打检索。 |
| `getEmptyProps` | `() => T['element']` | 空态占位：放在 content 里、list 的兄弟。 给了 collection 时由连接层按条数收放；条目手写时不写 hidden，露不露面归作者。 |
| `getLoadingProps` | `() => T['element']` | 在途占位：与空态占位同一个位置，两者不同屏——取数期间它顶上来，空态让位。 给了 collection 时由连接层按条数收放；条目手写时只按 loading 收放。 |
| `getGroupProps` | `(props: SelectGroupProps) => T['element']` | 分组容器：role=group，条目挂在它里面；分组标题经 aria-labelledby 关联。 |
| `getGroupLabelProps` | `(props: SelectGroupProps) => T['element']` | 分组标题：不是选项、不进导航，只作为本组的可及名字。 |
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
| `content` | `aria-hidden` | !open \|\| undefined |
| `list` | `aria-busy` | 'true' \| undefined |
| `list` | `aria-label` | props.translations.content |
| `list` | `aria-labelledby` | `label` 部件的 id `value-text` 部件的 id |
| `list` | `aria-multiselectable` | 'true' \| 'false' |
| `list` | `role` | 'listbox' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |
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
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
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
| `tag-list` | `data-disabled` | ''（条件成立时才出现） |
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
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `item-text` | `data-xh-collection-slot` | 'text' |
| `item-indicator` | `data-xh-collection-slot` | 'indicator' |
| `empty` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-state` | 'open' \| 'closed' |
| `overflow-tag` | `data-count` | String(overflowCount) |
| `tag` | `data-value` | v |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-select-action-bg` | `clear-trigger` | `background` | `default` | `transparent` | select 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-select-action-bg-active` | `clear-trigger` | `background` | `active` | `--xh-bg-subtle-active` | select 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-select-action-bg-hover` | `clear-trigger` | `background` | `hover` | `--xh-bg-subtle-hover` | select 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-select-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-muted` | select 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-select-action-fg-hover` | `clear-trigger` | `color` | `hover` | `--xh-fg-default` | select 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-select-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-text-secondary-size` | select 的 clear-trigger 部件 font-size 覆盖槽。 |
| `--xh-select-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-control` | select 的 clear-trigger 部件 border-radius 覆盖槽。 |
| `--xh-select-action-size` | `clear-trigger`<br>`indicator` | `block-size`<br>`inline-size` | `default` | `--xh-control-action-size` | select 的 clear-trigger、indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-select-content-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-backdrop` | select 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-select-content-bg` | `content` | `background` | `default` | `--xh-material-frosted-bg` | select 的 content 部件 background 覆盖槽。 |
| `--xh-select-content-border` | `content` | `border` | `default` | `--xh-material-frosted-border` | select 的 content 部件 border 覆盖槽。 |
| `--xh-select-content-fg` | `content` | `color` | `default` | `--xh-material-frosted-fg` | select 的 content 部件 color 覆盖槽。 |
| `--xh-select-content-highlight` | `content` | `background` | `default` | `--xh-material-frosted-highlight` | select 的 content 部件 background 覆盖槽。 |
| `--xh-select-content-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-menu-max-h` | select 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-select-content-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` | select 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-select-content-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-menu-min-w` | select 的 content 部件 min-inline-size 覆盖槽。 |
| `--xh-select-content-px` | `content` | `padding-inline` | `default` | `--xh-space-1` | select 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-select-content-py` | `content` | `padding-block` | `default` | `--xh-space-1` | select 的 content 部件 padding-block 覆盖槽。 |
| `--xh-select-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | select 的 content 部件 border-radius 覆盖槽。 |
| `--xh-select-content-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | select 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-select-control-bg` | `control` | `background` | `default` | `--xh-_select-control-bg` | select 的 control 部件 background 覆盖槽。 |
| `--xh-select-control-bg-disabled` | `control` | `background` | `disabled` | `--xh-bg-subtle` | select 的 control 部件 background 覆盖槽。 |
| `--xh-select-control-bg-hover` | `control` | `background` | `disabled`<br>`hover`<br>`not([data-disabled], [data-readonly])`<br>`readonly` | `--xh-_select-control-bg-hover` | select 的 control 部件 background 覆盖槽。 |
| `--xh-select-control-bg-readonly` | `control` | `background` | `readonly` | `--xh-bg-subtle` | select 的 control 部件 background 覆盖槽。 |
| `--xh-select-control-border` | `control` | `border` | `default` | `--xh-_select-control-border` | select 的 control 部件 border 覆盖槽。 |
| `--xh-select-control-border-focus` | `control` | `border-color` | `focus-within`<br>`invalid`<br>`not([data-invalid])` | `--xh-_tone` | select 的 control 部件 border-color 覆盖槽。 |
| `--xh-select-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled], [data-invalid])` | `--xh-_select-control-border-hover` | select 的 control 部件 border-color 覆盖槽。 |
| `--xh-select-control-border-invalid` | `control` | `border-color` | `invalid` | `--xh-border-invalid` | select 的 control 部件 border-color 覆盖槽。 |
| `--xh-select-control-gap` | `control` | `gap` | `default` | `--xh-_select-gap` | select 的 control 部件 gap 覆盖槽。 |
| `--xh-select-control-h` | `control` | `block-size` | `default` | `--xh-_select-h` | select 的 control 部件 block-size 覆盖槽。 |
| `--xh-select-control-min-w` | `control`<br>`root` | `min-inline-size` | `default` | `--xh-control-min-w` | select 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-select-control-px` | `control` | `padding-inline` | `default` | `--xh-_select-px` | select 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-select-control-radius` | `control` | `border-radius` | `default` | `--xh-shape-control` | select 的 control 部件 border-radius 覆盖槽。 |
| `--xh-select-control-shadow` | `control` | `box-shadow` | `default` | `--xh-_select-control-shadow` | select 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-select-empty-fg` | `empty` | `color` | `default` | `--xh-material-frosted-fg-muted` | select 的 empty 部件 color 覆盖槽。 |
| `--xh-select-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_select-font-size` | select 的 empty 部件 font-size 覆盖槽。 |
| `--xh-select-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_select-item-px` | select 的 empty 部件 padding-inline 覆盖槽。 |
| `--xh-select-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` | select 的 empty 部件 padding-block 覆盖槽。 |
| `--xh-select-footer-border` | `footer` | `border-block-start` | `default` | `--xh-material-frosted-separator` | select 的 footer 部件 border-block-start 覆盖槽。 |
| `--xh-select-footer-fg` | `footer` | `color` | `default` | `--xh-material-frosted-fg-muted` | select 的 footer 部件 color 覆盖槽。 |
| `--xh-select-footer-font-size` | `footer` | `font-size` | `default` | `--xh-text-secondary-size` | select 的 footer 部件 font-size 覆盖槽。 |
| `--xh-select-footer-gap` | `footer` | `gap` | `default` | `--xh-space-2` | select 的 footer 部件 gap 覆盖槽。 |
| `--xh-select-footer-px` | `footer` | `padding-inline` | `default` | `--xh-space-2` | select 的 footer 部件 padding-inline 覆盖槽。 |
| `--xh-select-footer-py` | `footer` | `padding-block` | `default` | `--xh-space-2` | select 的 footer 部件 padding-block 覆盖槽。 |
| `--xh-select-gap` | `root` | `gap` | `default` | `--xh-space-1` | select 的 root 部件 gap 覆盖槽。 |
| `--xh-select-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` | select 的 group 部件 gap 覆盖槽。 |
| `--xh-select-group-label-fg` | `group-label` | `color` | `default` | `--xh-material-frosted-fg-muted` | select 的 group-label 部件 color 覆盖槽。 |
| `--xh-select-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` | select 的 group-label 部件 font-size 覆盖槽。 |
| `--xh-select-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-medium` | select 的 group-label 部件 font-weight 覆盖槽。 |
| `--xh-select-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_select-item-px` | select 的 group-label 部件 padding-inline 覆盖槽。 |
| `--xh-select-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` | select 的 group-label 部件 padding-block 覆盖槽。 |
| `--xh-select-group-separator-color` | `group` | `border-block-start` | `default` | `--xh-material-frosted-separator` | select 的 group 部件 border-block-start 覆盖槽。 |
| `--xh-select-group-spacing` | `group` | `padding-block-start` | `default` | `--xh-space-1_5` | select 的 group 部件 padding-block-start 覆盖槽。 |
| `--xh-select-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | select 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-select-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-muted` | select 的 indicator 部件 color 覆盖槽。 |
| `--xh-select-item-bg-hover` | `item` | `background-color` | `error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [aria-busy='true'], [data-error])` | `--xh-bg-subtle` | select 的 item 部件 background-color 覆盖槽。 |
| `--xh-select-item-bg-pressed` | `item` | `background` | `active`<br>`disabled`<br>`not([data-disabled])` | `--xh-bg-subtle-active` | select 的 item 部件 background 覆盖槽。 |
| `--xh-select-item-fg` | `item` | `color` | `default`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [aria-busy='true'], [data-error])` | `--xh-material-frosted-fg` | select 的 item 部件 color 覆盖槽。 |
| `--xh-select-item-fg-selected` | `item` | `color` | `default`<br>`highlighted`<br>`is(:focus-visible, [data-highlighted])` | `--xh-select-item-fg` | select 的 item 部件 color 覆盖槽。 |
| `--xh-select-item-font-size` | `item` | `font-size` | `default` | `--xh-_select-font-size` | select 的 item 部件 font-size 覆盖槽。 |
| `--xh-select-item-font-weight-selected` | `item` | `font-weight` | `default`<br>`highlighted`<br>`is(:focus-visible, [data-highlighted])` | `--xh-font-weight-regular` | select 的 item 部件 font-weight 覆盖槽。 |
| `--xh-select-item-gap` | `item` | `margin-inline-end`<br>`margin-inline-start` | `xh-collection-slot=indicator`<br>`xh-collection-slot=prefix`<br>`xh-collection-slot=shortcut`<br>`xh-collection-slot=suffix` | `--xh-_select-gap` | select 的 item 部件 margin-inline-end、margin-inline-start 覆盖槽。 |
| `--xh-select-item-indicator-fg` | `item` | `color` | `state=checked`<br>`xh-collection-slot=indicator` | `--xh-_select-accent` | select 的 item 部件 color 覆盖槽。 |
| `--xh-select-item-indicator-size` | `item-indicator` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | select 的 item-indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-select-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` | select 的 item 部件 line-height 覆盖槽。 |
| `--xh-select-item-px` | `item` | `padding-inline` | `default` | `--xh-_select-item-px` | select 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-select-item-py` | `item` | `padding-block` | `default` | `--xh-_select-item-py` | select 的 item 部件 padding-block 覆盖槽。 |
| `--xh-select-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | select 的 item 部件 border-radius 覆盖槽。 |
| `--xh-select-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | select 的 label 部件 color 覆盖槽。 |
| `--xh-select-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | select 的 label 部件 color 覆盖槽。 |
| `--xh-select-label-font-size` | `label` | `font-size` | `default` | `--xh-_select-label-font-size` | select 的 label 部件 font-size 覆盖槽。 |
| `--xh-select-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | select 的 label 部件 font-weight 覆盖槽。 |
| `--xh-select-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | select 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-select-list-gap` | `list` | `gap` | `default` | `--xh-list-option-gap` | select 的 list 部件 gap 覆盖槽。 |
| `--xh-select-loading-fg` | `loading` | `color` | `default` | `--xh-material-frosted-fg-muted` | select 的 loading 部件 color 覆盖槽。 |
| `--xh-select-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_select-font-size` | select 的 loading 部件 font-size 覆盖槽。 |
| `--xh-select-loading-px` | `loading` | `padding-inline` | `default` | `--xh-_select-item-px` | select 的 loading 部件 padding-inline 覆盖槽。 |
| `--xh-select-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-3` | select 的 loading 部件 padding-block 覆盖槽。 |
| `--xh-select-placeholder-fg` | `value-text` | `color` | `placeholder` | `--xh-fg-subtle` | select 的 value-text 部件 color 覆盖槽。 |
| `--xh-select-tag-list-gap` | `tag-list` | `gap` | `default` | `--xh-space-1` | select 的 tag-list 部件 gap 覆盖槽。 |
| `--xh-select-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` | select 的 trigger 部件 color 覆盖槽。 |
| `--xh-select-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_select-font-size` | select 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-select-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_select-gap` | select 的 trigger 部件 gap 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `color` · `rotate` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 外面套[表单字段](./field)；选项文字过长时里面用[文本截断](./truncate)。
- **浮层 + 列表框**：值不进表单、只是就地切一个视图参数（排序方式、显示密度）时，用[浮层](./popover)装[列表框](./listbox)——浮层管开合与定位，列表框管条目与键盘，两边各自完整，不必另立组件。这是本库「浮层壳 + 条目层」的官方组合写法，示例见本页「官方组合：浮层 + 列表框」与[列表框](./listbox)页的同一例；要随表单提交、要 `name` 与 `hidden-select` 时才用本组件。

## 最佳实践

- 触发器的宽度固定，别随选中项的长度变——整行布局会跟着抖。
- 选项超过约二十条就该加搜索，也就是换成[组合框](./combobox)。
- 多选标签直接复用 Tag 的 M1 表面；调整标签外观应使用 `--xh-tag-*` 覆盖槽，不要在 Select 里重画。
- 自定义选项里的图标、头像、正文和尾部提示按作者 DOM 顺序写；需要截断的正文放进 `item-text`，
  不要靠皮肤猜测任意 span 的职责。

### 当前边界

- 当前 anatomy 尚无独立 `separator`、`viewport`、`scroll-up-button` 或 `scroll-down-button`。本次只在
  相邻 `group` 之间提供自动分隔，`list` 继续同时承担滚动视口；这些新部件需要独立行为与三端 API。

## 反模式

- 用它承载动作（"导出"、"删除"）：那是[菜单](./menu)。
- 异步加载选项时浮层里什么都不显示：给一个加载态或空态。
