# Select <Badge type="info" text="选择器" />

从一份已知清单里选一个或多个值，选项收在浮层里。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/select" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/select.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/select" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/select" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/select.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

单选

<XhDemo src="select/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="select"`：`root` · `label` · `control` · **`trigger`** · `value-text` · `indicator` · `clear-trigger` · `tag-list` · `positioner` · **`content`** · **`list`** · `footer` · `group` · `group-label` · `item` · `item-text` · `item-indicator` · `empty` · `loading` · `hidden-select`

## 示例

### 多选

选择多个值

<XhDemo src="select/02-multiple" />

### 受控

由 value 和 value-change 控制

<XhDemo src="select/03-controlled" />

### 禁用

禁止展开和聚焦

<XhDemo src="select/04-disabled" />

### 形态

outline、subtle 和 ghost

<XhDemo src="select/05-variant" />

### 语气

六种语气

<XhDemo src="select/06-tone" />

### 尺寸

小、中、大三档

<XhDemo src="select/07-size" />

### 异步加载

展开时加载选项

<XhDemo src="select/08-async" />

### 宽度

分别设置控件和浮层宽度

<XhDemo src="select/09-width" />

### 自定义内容

自定义选项和当前值

<XhDemo src="select/10-custom-content" />

### 操作入口

通过插槽状态控制开合和值

<XhDemo src="select/11-actions" />

### 大量选项

列表内部滚动并支持连打检索

<XhDemo src="select/12-many-options" />

### 分组

跨分组保持键盘导航

<XhDemo src="select/13-group" />

### 多选标签

超出数量合并为 +N

<XhDemo src="select/14-tags" />

### 校验

显示无效状态和错误说明

<XhDemo src="select/15-invalid" />

### 滚动加载

到达列表底部加载下一页

<XhDemo src="select/16-scroll-load" />

### 命令式聚焦

聚焦触发器

<XhDemo src="select/17-focus" />

### 清空

有值时显示清空按钮

<XhDemo src="select/18-clear" />

### 底部操作区

固定在滚动列表下方

<XhDemo src="select/19-footer" />

### Popover + Listbox

不参与表单的选择

<XhDemo src="select/20-listbox-popover" />

## 设计指引

### 何时使用

- 从已知选项中选择一个或多个值。
- 需要分组、标签多选或异步加载。

### 何时不用

- 少量选项使用[单选组](./radio-group)。
- 可输入或可搜索场景使用[组合框](./combobox)。
- 层级选项使用[级联选择](./cascader)或[树选择](./tree-select)。
- 不参与表单的视图切换使用 [Popover](./popover) 与 [Listbox](./listbox)。

### 特性

- 通过 `hidden-select` 参与表单。
- 多选值可显示为标签，超出 `maxTagCount` 后合并为 `+N`。
- 支持分组、加载、空状态、底部操作区和滚动加载。
- 控件使用 Field Chrome，浮层使用 M2 磨砂表面。
- 选中项保留普通文字，通过末端对号表示状态。
- 关闭时立即退出交互，资源在退场动画结束后释放。

### 组合

- 与[表单字段](./field)组合。
- 不参与表单时使用 [Popover](./popover) 与 [Listbox](./listbox)。

### 最佳实践

- 固定触发器宽度，避免选中值改变布局。
- 选项较多或需要搜索时使用 Combobox。
- 自定义内容中的主要文字放在 `item-text` 中。

### 反模式

- 不要用 Select 承载“导出”“删除”等动作。
- 异步加载时不要省略加载和空状态。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-select>` |
| Vue 组件 | `XhSelectClearTrigger` `XhSelectContent` `XhSelectControl` `XhSelectEmpty` `XhSelectFooter` `XhSelectGroup` `XhSelectGroupLabel` `XhSelectIndicator` `XhSelectItem` `XhSelectItemDeleteTrigger` `XhSelectItemIndicator` `XhSelectItemText` `XhSelectLabel` `XhSelectList` `XhSelectLoading` `XhSelectOverflowTag` `XhSelectPositioner` `XhSelectRoot` `XhSelectTag` `XhSelectTagLabel` `XhSelectTagList` `XhSelectTrigger` `XhSelectValueText` |
| 组合式函数 | `useSelect` |
| 状态机 | `selectMachine` |
| 皮肤 | `@xihan-ui/styles/select.css` |

### Props

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

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `SelectValueChangeDetails` | 选中值变化；detail 为 `{ value: string[] }` |
| `open-change` | `SelectOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSelectRoot` | `default` | `SelectRootSlotProps` |  |
| `XhSelectRoot` | `label` | — |  |
| `XhSelectRoot` | `item` | `SelectNodeMeta` |  |

### 状态

公开状态写入 `data-state`。

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

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ITEM.HIGHLIGHT` · `HIGHLIGHT.CLEAR` · `ITEM.LOST` · `ITEM.SELECT` · `VALUE.SET` · `VALUE.CLEAR` · `FORM.RESET`

**判据**：`isOpenControlled` · `isMultiple` · `isReadOnly`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

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

## 无障碍

### 键盘

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

### ARIA

以下属性由 `connect` 生成。

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

## 样式参考

### 皮肤

`@xihan-ui/styles/select.css` 使用 `[data-scope="select"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

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
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-select-action-bg` | `clear-trigger` | `background` | `default` | `transparent` | select 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-select-action-bg-active` | `clear-trigger` | `background` | `active` | `--xh-bg-subtle-active` | select 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-select-action-bg-hover` | `clear-trigger` | `background` | `hover` | `--xh-bg-subtle-hover` | select 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-select-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-muted` | select 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-select-action-fg-hover` | `clear-trigger` | `color` | `hover` | `--xh-fg-default` | select 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-select-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-text-secondary-size` | select 的 clear-trigger 部件 font-size 覆盖槽。 |
| `--xh-select-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-inset` | select 的 clear-trigger 部件 border-radius 覆盖槽。 |
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
| `--xh-select-control-bg` | `control` | `background-color` | `default` | `--xh-_select-control-bg` | select 的 control 部件 background-color 覆盖槽。 |
| `--xh-select-control-bg-disabled` | `control` | `background-color` | `disabled` | `--xh-bg-subtle` | select 的 control 部件 background-color 覆盖槽。 |
| `--xh-select-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`not([data-disabled], [data-readonly])`<br>`readonly` | `--xh-_select-control-bg-hover` | select 的 control 部件 background-color 覆盖槽。 |
| `--xh-select-control-bg-readonly` | `control` | `background-color` | `readonly` | `--xh-bg-subtle` | select 的 control 部件 background-color 覆盖槽。 |
| `--xh-select-control-border` | `control` | `border` | `default` | `--xh-_select-control-border` | select 的 control 部件 border 覆盖槽。 |
| `--xh-select-control-border-focus` | `control` | `border-color` | `focus-within`<br>`invalid`<br>`not([data-invalid])` | `--xh-_tone` | select 的 control 部件 border-color 覆盖槽。 |
| `--xh-select-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled], [data-invalid])` | `--xh-_select-control-border-hover` | select 的 control 部件 border-color 覆盖槽。 |
| `--xh-select-control-border-invalid` | `control` | `border-color` | `invalid` | `--xh-border-invalid` | select 的 control 部件 border-color 覆盖槽。 |
| `--xh-select-control-gap` | `control` | `gap` | `default` | `--xh-_select-gap` | select 的 control 部件 gap 覆盖槽。 |
| `--xh-select-control-h` | `control` | `block-size` | `default` | `--xh-_select-h` | select 的 control 部件 block-size 覆盖槽。 |
| `--xh-select-control-min-w` | `control`<br>`root` | `min-inline-size` | `default` | `--xh-control-min-w` | select 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-select-control-px` | `control` | `padding-inline` | `default` | `--xh-_select-px` | select 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-select-control-radius` | `control` | `border-radius` | `default` | `--xh-shape-surface` | select 的 control 部件 border-radius 覆盖槽。 |
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
| `--xh-select-item-bg-pressed` | `item` | `background-color` | `active`<br>`disabled`<br>`not([data-disabled])` | `--xh-bg-subtle-active` | select 的 item 部件 background-color 覆盖槽。 |
| `--xh-select-item-check-fg` | `item` | `color` | `state=checked`<br>`xh-collection-slot=indicator` | `--xh-_select-accent` | select 的 item 部件 color 覆盖槽。 |
| `--xh-select-item-fg` | `item` | `color` | `default`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [aria-busy='true'], [data-error])` | `--xh-material-frosted-fg` | select 的 item 部件 color 覆盖槽。 |
| `--xh-select-item-fg-selected` | `item` | `color` | `default`<br>`highlighted`<br>`is(:focus-visible, [data-highlighted])` | `--xh-select-item-fg` | select 的 item 部件 color 覆盖槽。 |
| `--xh-select-item-font-size` | `item` | `font-size` | `default` | `--xh-_select-font-size` | select 的 item 部件 font-size 覆盖槽。 |
| `--xh-select-item-font-weight-selected` | `item` | `font-weight` | `default`<br>`highlighted`<br>`is(:focus-visible, [data-highlighted])` | `--xh-font-weight-regular` | select 的 item 部件 font-weight 覆盖槽。 |
| `--xh-select-item-gap` | `item` | `margin-inline-end`<br>`margin-inline-start` | `xh-collection-slot=indicator`<br>`xh-collection-slot=prefix`<br>`xh-collection-slot=shortcut`<br>`xh-collection-slot=suffix` | `--xh-_select-gap` | select 的 item 部件 margin-inline-end、margin-inline-start 覆盖槽。 |
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

### 动效

关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 随皮肤自带，不引用别处文件里的名字；`background` · `background-color` · `border-color` · `box-shadow` · `rotate` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
