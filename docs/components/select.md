# Select 选择器 <Badge type="info" text="alpha" />

从已知清单中选择一个或多个值，选项收在浮层内。

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

### 变体

outline、subtle 和 ghost

<XhDemo src="select/05-variant" />

### 颜色

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
- 不参与表单的视图切换使用 [气泡卡片](./popover) 与 [列表框](./listbox)。

### 特性

- 通过 `hidden-select` 参与表单。
- 多选值可显示为标签，超出 `maxTagCount` 后合并为 `+N`。
- 支持分组、加载、空状态、底部操作区和滚动加载。
- 控件使用 Field Chrome，浮层使用 M2 磨砂表面。
- 选中项保留普通文字，通过末端对号表示状态。
- 关闭时立即退出交互，资源在退场动画结束后释放。

### 组合

- 与[表单字段](./field)组合。
- 不参与表单时使用 [气泡卡片](./popover) 与 [列表框](./listbox)。

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
| `collection` | `SelectNode[]` |  | 条目数据，显示文本与禁用的事实源。提供后条目部件只需声明 value， 显示文本也不再从 DOM 查询。未提供时回到文本写在条目中、从 DOM 查询的方式。 |
| `value` | `string \| string[] \| null` |  | 选中值。裸串是单选的简写，null 是受控且无选中，未提供（undefined）才是非受控；内部一律按数组处理。 受控时 cell 直读 prop，写入只发 onValueChange 不落内部值。 |
| `defaultValue` | `string \| string[] \| null` |  | 非受控初始选中值。与 value 同样接受裸串与 null。 |
| `multiple` | `boolean` |  | 允许选中多项。单选时选完即收起，多选时保持展开继续选。 |
| `open` | `boolean` |  | 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `disabled` | `boolean` |  | 整个控件禁用：trigger 使用原生 disabled，隐藏 select 不参与提交。 |
| `readOnly` | `boolean` |  | 只读：浮层照常展开与浏览，但选中值不可修改、也不可清空。 |
| `invalid` | `boolean` |  | 校验错误态：trigger 标红并输出 aria-invalid。 |
| `loading` | `boolean` |  | 条目加载中：列表报告 aria-busy，显示在途占位、隐藏空态占位。 |
| `translations` | `Partial<SelectTranslations>` |  | 读屏文案，默认英文。 |
| `maxTagCount` | `number` |  | 多选标签最多显示的数量，其余折叠进 overflowCount、合成 +N 标签；默认 3（SELECT_DEFAULT_MAX_TAG_COUNT）。 |
| `required` | `boolean` |  | 原生表单校验：无选中值时提交被拦截。 |
| `name` | `string` |  | 表单字段名。提供后隐藏 select 才带 name，选中值随表单一并提交。 |
| `placeholder` | `string` |  | 无选中时 value-text 显示的占位文字。 |
| `placement` | `Placement` |  |  |
| `offset` | `number` |  |  |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定触发器的描边与底色使用方式。默认 outline。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定触发器高度、内边距与字号档位。 |
| `onValueChange` | `(details: SelectValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 |
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
| `collection` | `readonly SelectNodeMeta[]` | 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `value` | `string[]` | 选中集合，按选中先后排列而非文档顺序。单选恒为长度 ≤ 1。 |
| `valueText` | `string[]` | 选中项的文本，与 value 逐项等长对应；某项在 DOM 中查询不到条目时该项回退为值本身。 |
| `displayText` | `string` | value-text 实际显示的文字：有选中时取其文本（多选按半角逗号加空格连接），否则取 placeholder。 |
| `multiple` | `boolean` | 是否允许多选。 |
| `invalid` | `boolean` | 校验错误态。 |
| `readOnly` | `boolean` | 只读态。 |
| `canClear` | `boolean` | 当前能否清空：有选中且既不禁用也不只读。 |
| `tags` | `SelectTagMeta[]` | 可见标签（受 maxTagCount 截断），与 value / valueText 同序。 |
| `overflowCount` | `number` | 被 maxTagCount 折叠的标签数。 |
| `overflowText` | `string` | +N 标签显示的文字（由 translations.overflowTag 计算）；没有折叠的标签时为空串。 |
| `highlightedValue` | `string \| null` | 高亮锚点；收起时为 null。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string \| string[]) => void` |  |
| `clear` | `() => void` | 清空全部选中。 |
| `deselect` | `(value: string) => void` | 移除一个选中值。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` | 触发器与清空按钮的收纳容器：两者在其中并排，有值时清空按钮替代展开指示符。 |
| `getTriggerProps` | `() => T['button']` |  |
| `getValueTextProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getClearTriggerProps` | `() => T['button']` | 清空按钮：不占 Tab 位；无法清空时整体隐藏；点击清空全部选中、不展开浮层，焦点送回 trigger。 |
| `getTagListProps` | `() => T['element']` | 标签行：收纳可见标签与 +N 标签，放在触发器中；无选中时整体 hidden。 |
| `getTagProps` | `(props: SelectTagProps) => T['element']` | 标签：一个选中值一个，即库内 tag 的 root（data-scope="tag"）：语气、尺寸与禁用从本控件传下，形态按控件的面派生（outline / ghost / 默认使用淡底标签，subtle 使用描边标签），另带 data-value 记录代表的值。放在触发器中即纯展示（不渲染关闭按钮），放在外部配删除按钮可删除。 |
| `getTagLabelProps` | `() => T['element']` | 标签文字所在的块（tag 的 label）：截断落在这一层；标签与 +N 共用。 |
| `getOverflowTagProps` | `() => T['element']` | 被折叠的标签合成的一个：同样是 tag 的 root，显示 overflowText、带 data-count；没有折叠的标签时 hidden。 |
| `getItemDeleteTriggerProps` | `(props: SelectTagProps) => T['button']` | 标签删除按钮：即所在标签那份 tag 的 close-trigger（data-scope="tag"），可及名使用 translations.deleteItem，禁用时保留位置、原生 disabled；点击移除所在标签的选中值；须放在标签中。 |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` | 浮层外壳：描边、底色、阴影与键盘收口都在它身上。 |
| `getListProps` | `() => T['element']` | 列表框本体，滚动在这一层；role=listbox 与条目的拥有关系都归它。 |
| `getFooterProps` | `() => T['element']` | 浮层底部的操作区，是 list 的兄弟；不在列表框的拥有关系中，也不参与方向键与连打检索。 |
| `getEmptyProps` | `() => T['element']` | 空态占位：放在 content 中、list 的兄弟。 提供 collection 时由连接层按条数收放；条目手写时不写 hidden，是否显示由作者决定。 |
| `getLoadingProps` | `() => T['element']` | 在途占位：与空态占位同一位置，两者不同时显示：加载期间显示它，空态让位。 提供 collection 时由连接层按条数收放；条目手写时只按 loading 收放。 |
| `getGroupProps` | `(props: SelectGroupProps) => T['element']` | 分组容器：role=group，条目挂在其中；分组标题经 aria-labelledby 关联。 |
| `getGroupLabelProps` | `(props: SelectGroupProps) => T['element']` | 分组标题：不是选项、不进入导航，只作为本组的可及名。 |
| `getItemProps` | `(props: SelectItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: SelectItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: SelectItemProps) => T['element']` |  |
| `getHiddenSelectProps` | `() => T['select']` | 表单出口：一份视觉隐藏的原生 select，由根部件自行渲染（作者不必手写）。 选项由适配器按当前值补齐，原生提交与 required 校验据此获取值。 |

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

`@xihan-ui/styles/select.css` 使用 `[data-scope="select"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

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
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-size` | props.size |
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
| `clear-trigger` | `data-xh-action-control` | '' |
| `clear-trigger` | `data-xh-action-display` | 'has-value' |
| `clear-trigger` | `data-xh-action-has-value` | ''（条件成立时才出现） |
| `clear-trigger` | `data-xh-action-profile` | 'field-inset' |
| `clear-trigger` | `data-xh-action-size` | props.size |
| `clear-trigger` | `data-xh-action-variant` | 'ghost' |
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
| `item` | `data-xh-collection-context` | 'overlay' |
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

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-select-action-bg` | `clear-trigger` | `background-color` | `default` | `--xh-_action-variant-bg-rest` | select 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-select-action-bg-active` | `clear-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | select 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-select-action-bg-hover` | `clear-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | select 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-select-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-muted` | select 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-select-action-fg-hover` | `clear-trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` | select 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-select-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-text-secondary-size` | select 的 clear-trigger 部件 font-size 覆盖槽。 |
| `--xh-select-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-inset` | select 的 clear-trigger 部件 border-radius 覆盖槽。 |
| `--xh-select-action-size` | `clear-trigger`<br>`indicator` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size`<br>`--xh-control-action-size` | select 的 clear-trigger、indicator 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
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
| `--xh-select-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` | select 的 content 部件 border-radius 覆盖槽。 |
| `--xh-select-content-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | select 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-select-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` | select 的 control 部件 background-color 覆盖槽。 |
| `--xh-select-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` | select 的 control 部件 background-color 覆盖槽。 |
| `--xh-select-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` | select 的 control 部件 background-color 覆盖槽。 |
| `--xh-select-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` | select 的 control 部件 background-color 覆盖槽。 |
| `--xh-select-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` | select 的 control 部件 border 覆盖槽。 |
| `--xh-select-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` | select 的 control 部件 border-color 覆盖槽。 |
| `--xh-select-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` | select 的 control 部件 border-color 覆盖槽。 |
| `--xh-select-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` | select 的 control 部件 border-color 覆盖槽。 |
| `--xh-select-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` | select 的 control 部件 color 覆盖槽。 |
| `--xh-select-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_select-gap` | select 的 control 部件 gap 覆盖槽。 |
| `--xh-select-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_select-h` | select 的 control 部件 block-size、min-block-size 覆盖槽。 |
| `--xh-select-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` | select 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-select-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_select-px` | select 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-select-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` | select 的 control 部件 border-radius 覆盖槽。 |
| `--xh-select-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` | select 的 control 部件 box-shadow 覆盖槽。 |
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
| `--xh-select-icon-size` | `control`<br>`root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | select 的 control、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-select-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-muted` | select 的 indicator 部件 color 覆盖槽。 |
| `--xh-select-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` | select 的 item 部件 background-color 覆盖槽。 |
| `--xh-select-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` | select 的 item 部件 background-color 覆盖槽。 |
| `--xh-select-item-check-fg` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`xh-collection-context=overlay`<br>`xh-collection-slot=indicator` | `--xh-_select-accent` | select 的 item 部件 color 覆盖槽。 |
| `--xh-select-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-material-frosted-fg` | select 的 item 部件 color 覆盖槽。 |
| `--xh-select-item-fg-selected` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-select-item-fg` | select 的 item 部件 color 覆盖槽。 |
| `--xh-select-item-font-size` | `item` | `font-size` | `default` | `--xh-_select-font-size` | select 的 item 部件 font-size 覆盖槽。 |
| `--xh-select-item-font-weight-selected` | `item` | `font-weight` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-font-weight-regular` | select 的 item 部件 font-weight 覆盖槽。 |
| `--xh-select-item-gap` | `item` | `margin-inline-end`<br>`margin-inline-start` | `xh-collection-slot=indicator`<br>`xh-collection-slot=prefix`<br>`xh-collection-slot=shortcut`<br>`xh-collection-slot=suffix` | `--xh-_select-gap` | select 的 item 部件 margin-inline-end、margin-inline-start 覆盖槽。 |
| `--xh-select-item-indicator-size` | `item-indicator` | `block-size`<br>`inline-size` | `default` | `--xh-icon-size` | select 的 item-indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-select-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` | select 的 item 部件 line-height 覆盖槽。 |
| `--xh-select-item-px` | `item` | `padding-inline` | `default` | `--xh-_select-item-px` | select 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-select-item-py` | `item` | `padding-block` | `default` | `--xh-_select-item-py` | select 的 item 部件 padding-block 覆盖槽。 |
| `--xh-select-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | select 的 item 部件 border-radius 覆盖槽。 |
| `--xh-select-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | select 的 label 部件 color 覆盖槽。 |
| `--xh-select-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | select 的 label 部件 color 覆盖槽。 |
| `--xh-select-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | select 的 label 部件 font-size 覆盖槽。 |
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

共享关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`rotate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
