# Listbox <Badge type="info" text="列表框" />

一份直接铺在页面上的可选列表，不带浮层。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/listbox" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/listbox.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/listbox" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/listbox" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/listbox.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

方向键只搬焦点，Enter 或空格才落值；整组只占一个 Tab 位

<XhDemo src="listbox/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="listbox"`：`root` · `label` · **`content`** · `item` · `item-text` · `item-indicator` · `group` · `group-label` · `empty` · `loading` · `load-more-trigger`

## 示例

### 多选

selection-mode="multiple" 下空格改成切换该条，Shift + 方向键顺手扩选，Ctrl / Cmd + A 全选或全不选

<XhDemo src="listbox/02-multiple" />

### 分组

group 把条目分段，group-label 是这一段的可及名字，不参与选中也不接方向键

<XhDemo src="listbox/03-group" />

### 选择模式

selection-mode="extended" 是「裸点换一条、Ctrl 与 Shift 才扩选」，与 multiple 档的区别就在裸点

<XhDemo src="listbox/04-selection-mode" />

### 弹出式选择

把列表装进浮层：触发器显示当前选中项，落值即收起，浮层底部还能放操作按钮

<XhDemo src="listbox/05-popover" />

### 定高滚动

用 --xh-listbox-content-max-h 压住列表高度，条目多了就在容器里滚；方向键走到哪条，视图跟到哪条

<XhDemo src="listbox/06-scroll" />

### 空态

条目筛空时收起列表、亮出空态节点：它挂在 content 之外，方向键、连打检索与全选都看不见它

<XhDemo src="listbox/07-empty" />

### 三种相位

空、在途、还有更多各有部件：给了 collection 时前两者的收放归组件，取下一页那颗钮点了做什么归你

<XhDemo src="listbox/08-phases" />

### 语气

tone 决定选中条目的勾选标记用哪族颜色，未选中的条目不受影响

<XhDemo src="listbox/09-tone" />

## 设计指引

### 何时使用

- 选项需要常驻可见（穿梭框的两侧、设置面板的左栏）。
- 需要多选、范围选（Shift）与全选（Cmd + A）。

### 何时不用

- 选项要收起来：用[选择器](./select)。
- 列表只是展示、不可选：用[列表](./list)。

### 特性

- 三种选择模式：单选、多选、以及带 Shift 范围扩展的模式。
- `typeahead` 连打检索。
- 定高滚动与三种非条目相位都有对应部件：空（`empty`）、在途（`loading`）、还有更多（`load-more-trigger`）。
- `loading` 为真时列表报 `aria-busy`，在途占位顶上来、空态占位让位；给了 `collection` 时两者的收放归连接层。
- `collection` 为空时，列表本体隐藏并退出 Tab 序列；不保留空描边。条目手写时，空白文本、只有标题的空组、带 `hidden` 的条目和分组都不算可见候选；禁用条目仍属于有效内容。
- `load-more-trigger` 是取下一页的入口：还有没有下一页、点了做什么都归作者，连接层只保证在途与整列禁用两档点不动。

### 组合

- 作为[穿梭框](./transfer)的内层；长列表配[虚拟滚动](./virtualizer)。
- **弹出式选择**：把本组件装进[浮层](./popover)——触发器显示当前选中项，落值时自己收起浮层，浮层底部还能放操作按钮。不参与表单、也不带输入框的那种就地切换（排序方式、显示密度）走这一种写法，不必另找组件；要随表单提交才用[选择器](./select)。这是本库「浮层壳 + 条目层」的官方组合写法：浮层只管开合与定位，条目、键盘导航、连打检索与选中语义全在本组件里，换一个浮层壳（[菜单](./menu)、[气泡卡片](./popover)）写法不变。示例见本页「弹出式选择」与[选择器](./select)页的同一例。

### 最佳实践

- 单选、多选与 Select 使用同一视觉规则：对号表示选中，中性底表示悬停或键盘高亮，正文不变色、不加粗。
- 自定义条目应显式组合 `item-indicator`；该部件固定在逻辑末端，未选中时保留空间，避免选择时文字移动。
- 空态和加载文案由作者通过 `Empty` / `Loading` 部件提供，放在 `root` 中作为 `content` 的兄弟。默认按 `collection` 渲染时没有额外状态文案，不会自动制造提示、假选项或空白状态块；需要提示时使用现有复合部件。
- 给了 `collection` 时用同一份数据表达当前候选，空态与首次加载自动互斥；手写条目时由作者控制状态部件的 `hidden`。条目过滤使用 `hidden` 或移除节点，隐藏分组不参与方向键、连打、区间选择和全选；任意样式类的可见性由作者自行管理。

- 多选时给出"已选 N 项"的回显，否则滚动后用户不知道选了多少。
- 定高，别让列表把页面撑到需要整页滚动。

### 反模式

- 用它承载命令：列表框的条目是选项不是动作。
- 选项超过几百条却不虚拟化。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-listbox>` |
| Vue 组件 | `XhListboxContent` `XhListboxEmpty` `XhListboxGroup` `XhListboxGroupLabel` `XhListboxItem` `XhListboxItemIndicator` `XhListboxItemText` `XhListboxLabel` `XhListboxLoadMoreTrigger` `XhListboxLoading` `XhListboxRoot` |
| 组合式函数 | `useListbox` |
| 状态机 | `listboxMachine` |
| 皮肤 | `@xihan-ui/styles/listbox.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `ListboxNode[]` |  | 条目数据，显示文本与禁用的事实源。给了它，条目部件只需报 value。 缺省即回到「文本与禁用都写在条目部件上」的老路。 |
| `value` | `string \| string[]` |  | 选中值，给定即受控；单选可写成裸串，内部归一成数组。 |
| `defaultValue` | `string \| string[]` |  |  |
| `selectionMode` | `ListboxSelectionMode` |  | 选择模式，默认 single。 |
| `disabled` | `boolean` |  | 整个列表禁用，键盘与点击都不再改选中值。 |
| `readOnly` | `boolean` |  | 只读：条目照常浏览与聚焦，但选中值改不动。禁用则连焦点带都退出。 |
| `loading` | `boolean` |  | 条目还在取：列表报 aria-busy，在途占位顶上来，空态占位让位。 |
| `invalid` | `boolean` |  | 校验失败：列表报 aria-invalid，各角色节点带 data-invalid。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定勾选标记用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定条目的几何档位。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `orientation` | `Orientation` |  | 方向键轴向，默认 vertical。 |
| `typeahead` | `boolean` |  | 连打检索，默认开。 |
| `onValueChange` | `(details: ListboxValueChangeDetails) => void` |  | value 变化意图回调。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ListboxValueChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhListboxRoot` | `default` | `ListboxRootSlotProps` |  |
| `XhListboxRoot` | `label` | — |  |
| `XhListboxRoot` | `item` | `ListboxNodeMeta` |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `VALUE.CLEAR` · `ITEM.SELECT` · `ITEM.TOGGLE` · `ITEM.FOCUS` · `FOCUS.CLEAR` · `LIST.BLUR`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` | 选中集合；单选模式下长度 ≤ 1。 |
| `collection` | `readonly ListboxNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `selectionMode` | `ListboxSelectionMode` | 生效的选择模式。 |
| `focusedValue` | `string \| null` | 焦点锚点；焦点不在列表内时为 null。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `loading` | `boolean` |  |
| `isSelected` | `(value: string) => boolean` |  |
| `setValue` | `(next: string[]) => void` |  |
| `select` | `(value: string) => void` | 只留这一个；加选用 toggle。 |
| `toggle` | `(value: string) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getEmptyProps` | `() => T['element']` | 空态占位：放在 root 里、content 的兄弟。 给了 collection 时由连接层按条数收放；条目手写时不写 hidden，露不露面归作者。 |
| `getLoadingProps` | `() => T['element']` | 在途占位：与空态占位同一个位置，两者不同屏——取数期间它顶上来，空态让位。 给了 collection 时由连接层按条数收放；条目手写时只按 loading 收放。 |
| `getLoadMoreTriggerProps` | `() => T['element']` | 取下一页的入口：库不知道还有没有下一页，露不露面与点了做什么都归作者， 连接层只保证取数在途与整列禁用两档点不动。 |
| `getGroupProps` | `(props: ListboxGroupProps) => T['element']` |  |
| `getGroupLabelProps` | `(props: ListboxGroupProps) => T['element']` |  |
| `getItemProps` | `(props: ListboxItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: ListboxItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: ListboxItemProps) => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the listbox | 整个列表只占一个 Tab 位：焦点进入锚点条目，无锚点时先落容器再由它转投 |
| `ArrowDown` | focus in listbox, orientation=vertical | 焦点移到下一个可停留条目（禁用项跳过、尽头按 loop 回绕）；orientation=horizontal 时改由 ArrowRight 承担，dir=rtl 再对调左右 |
| `ArrowUp` | focus in listbox, orientation=vertical | 焦点移到上一个可停留条目（禁用项跳过、尽头按 loop 回绕）；orientation=horizontal 时改由 ArrowLeft 承担，dir=rtl 再对调左右 |
| `Home` | focus in listbox | 焦点移到首个可停留条目 |
| `End` | focus in listbox | 焦点移到末个可停留条目 |
| `Enter` / `Space` | focus on item, selectionMode 为 single 或 extended | 只选中焦点条目，替换原有选中；条目自报禁用则不认 |
| `Space` / `Enter` / `Ctrl+Space` | focus on item, 可多选（multiple；extended 下须按住 Ctrl/Cmd） | 切换焦点条目的选中态，其余选中不动 |
| `Shift+ArrowDown` / `Shift+ArrowUp` | focus in listbox, 可多选 | 焦点移到相邻条目并切换它的选中态；往回走即把刚扩进来的那个摘掉 |
| `Ctrl+A` / `Cmd+A` | focus in listbox, 可多选 | 选中全部可选条目；已经全选则把它们一并取消（禁用但已选中的不动） |
| `单个可打印字符` | focus in listbox, typeahead 未关 | 连打检索把焦点移到首字母匹配的条目，不改选中值 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `content` | `aria-busy` | 'true' \| undefined |
| `content` | `aria-disabled` | 'true' \| 'false' |
| `content` | `aria-invalid` | 'true' \| 'false' |
| `content` | `aria-labelledby` | `label` 部件的 id |
| `content` | `aria-multiselectable` | 'true' \| 'false' |
| `content` | `aria-orientation` | props.orientation |
| `content` | `aria-readonly` | 'true' \| 'false' |
| `content` | `role` | 'listbox' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-indicator` | `aria-hidden` | 'true' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |

## 样式参考

### 皮肤

`@xihan-ui/styles/listbox.css` 使用 `[data-scope="listbox"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `content` | `data-disabled` | ''（条件成立时才出现） |
| `content` | `data-invalid` | ''（条件成立时才出现） |
| `content` | `data-orientation` | props.orientation |
| `content` | `data-readonly` | ''（条件成立时才出现） |
| `group` | `data-disabled` | ''（条件成立时才出现） |
| `group-label` | `data-disabled` | ''（条件成立时才出现） |
| `empty` | `data-disabled` | ''（条件成立时才出现） |
| `loading` | `data-disabled` | ''（条件成立时才出现） |
| `load-more-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `load-more-trigger` | `data-loading` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-listbox-content-bg` | `content` | `background` | `default` | `--xh-bg-surface` | listbox 的 content 部件 background 覆盖槽。 |
| `--xh-listbox-content-border` | `content` | `border` | `default` | `--xh-border-default` | listbox 的 content 部件 border 覆盖槽。 |
| `--xh-listbox-content-border-invalid` | `content` | `border-color` | `invalid` | `--xh-border-invalid` | listbox 的 content 部件 border-color 覆盖槽。 |
| `--xh-listbox-content-fg` | `content` | `color` | `default` | `--xh-fg-default` | listbox 的 content 部件 color 覆盖槽。 |
| `--xh-listbox-content-gap` | `content` | `gap` | `default` | `--xh-list-option-gap` | listbox 的 content 部件 gap 覆盖槽。 |
| `--xh-listbox-content-max-h` | `content` | `max-block-size` | `default` | `--xh-viewport-h-md` | listbox 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-listbox-content-px` | `content` | `padding-inline` | `default` | `--xh-space-1` | listbox 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-content-py` | `content` | `padding-block` | `default` | `--xh-space-1` | listbox 的 content 部件 padding-block 覆盖槽。 |
| `--xh-listbox-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | listbox 的 content 部件 border-radius 覆盖槽。 |
| `--xh-listbox-empty-fg` | `empty` | `color` | `default` | `--xh-fg-subtle` | listbox 的 empty 部件 color 覆盖槽。 |
| `--xh-listbox-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_listbox-font-size` | listbox 的 empty 部件 font-size 覆盖槽。 |
| `--xh-listbox-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_listbox-item-px` | listbox 的 empty 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` | listbox 的 empty 部件 padding-block 覆盖槽。 |
| `--xh-listbox-gap` | `root` | `gap` | `default` | `--xh-space-2` | listbox 的 root 部件 gap 覆盖槽。 |
| `--xh-listbox-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` | listbox 的 group 部件 gap 覆盖槽。 |
| `--xh-listbox-group-label-fg` | `group-label` | `color` | `default` | `--xh-fg-subtle` | listbox 的 group-label 部件 color 覆盖槽。 |
| `--xh-listbox-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` | listbox 的 group-label 部件 font-size 覆盖槽。 |
| `--xh-listbox-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-medium` | listbox 的 group-label 部件 font-weight 覆盖槽。 |
| `--xh-listbox-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_listbox-item-px` | listbox 的 group-label 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` | listbox 的 group-label 部件 padding-block 覆盖槽。 |
| `--xh-listbox-group-spacing` | `content`<br>`group`<br>`item` | `margin-block-start` | `has([data-scope='listbox'][data-part='item']:not([hidden])`<br>`not([data-scope='listbox'][data-part='content'] [hidden] *)` | `--xh-space-1_5` | listbox 的 content、group、item 部件 margin-block-start 覆盖槽。 |
| `--xh-listbox-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | listbox 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-listbox-item-bg-hover` | `item` | `background` | `disabled`<br>`highlighted`<br>`is(:hover, [data-highlighted], :focus-visible)`<br>`not([data-disabled])` | `--xh-bg-subtle` | listbox 的 item 部件 background 覆盖槽。 |
| `--xh-listbox-item-fg` | `item` | `color` | `default`<br>`state=checked` | `--xh-fg-default` | listbox 的 item 部件 color 覆盖槽。 |
| `--xh-listbox-item-fg-selected` | `item` | `color` | `state=checked` | `--xh-listbox-item-fg` | listbox 的 item 部件 color 覆盖槽。 |
| `--xh-listbox-item-font-size` | `item` | `font-size` | `default` | `--xh-_listbox-font-size` | listbox 的 item 部件 font-size 覆盖槽。 |
| `--xh-listbox-item-font-weight-selected` | `item` | `font-weight` | `state=checked` | `--xh-font-weight-regular` | listbox 的 item 部件 font-weight 覆盖槽。 |
| `--xh-listbox-item-gap` | `item` | `gap` | `default` | `--xh-_listbox-gap` | listbox 的 item 部件 gap 覆盖槽。 |
| `--xh-listbox-item-indicator-fg` | `item-indicator` | `color` | `default` | `--xh-_listbox-accent` | listbox 的 item-indicator 部件 color 覆盖槽。 |
| `--xh-listbox-item-indicator-size` | `item-indicator` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | listbox 的 item-indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-listbox-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` | listbox 的 item 部件 line-height 覆盖槽。 |
| `--xh-listbox-item-px` | `item` | `padding-inline` | `default` | `--xh-_listbox-item-px` | listbox 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-item-py` | `item` | `padding-block` | `default` | `--xh-_listbox-item-py` | listbox 的 item 部件 padding-block 覆盖槽。 |
| `--xh-listbox-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | listbox 的 item 部件 border-radius 覆盖槽。 |
| `--xh-listbox-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | listbox 的 label 部件 color 覆盖槽。 |
| `--xh-listbox-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | listbox 的 label 部件 font-size 覆盖槽。 |
| `--xh-listbox-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | listbox 的 label 部件 font-weight 覆盖槽。 |
| `--xh-listbox-load-more-trigger-bg-hover` | `load-more-trigger` | `background-color` | `hover` | `--xh-bg-subtle` | listbox 的 load-more-trigger 部件 background-color 覆盖槽。 |
| `--xh-listbox-load-more-trigger-fg` | `load-more-trigger` | `color` | `default` | `--xh-_tone-fg` | listbox 的 load-more-trigger 部件 color 覆盖槽。 |
| `--xh-listbox-load-more-trigger-font-size` | `load-more-trigger` | `font-size` | `default` | `--xh-_listbox-font-size` | listbox 的 load-more-trigger 部件 font-size 覆盖槽。 |
| `--xh-listbox-load-more-trigger-gap` | `load-more-trigger` | `gap` | `default` | `--xh-_listbox-gap` | listbox 的 load-more-trigger 部件 gap 覆盖槽。 |
| `--xh-listbox-load-more-trigger-px` | `load-more-trigger` | `padding-inline` | `default` | `--xh-_listbox-item-px` | listbox 的 load-more-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-load-more-trigger-py` | `load-more-trigger` | `padding-block` | `default` | `--xh-_listbox-item-py` | listbox 的 load-more-trigger 部件 padding-block 覆盖槽。 |
| `--xh-listbox-load-more-trigger-radius` | `load-more-trigger` | `border-radius` | `default` | `--xh-shape-control` | listbox 的 load-more-trigger 部件 border-radius 覆盖槽。 |
| `--xh-listbox-loading-fg` | `loading` | `color` | `default` | `--xh-fg-subtle` | listbox 的 loading 部件 color 覆盖槽。 |
| `--xh-listbox-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_listbox-font-size` | listbox 的 loading 部件 font-size 覆盖槽。 |
| `--xh-listbox-loading-px` | `loading` | `padding-inline` | `default` | `--xh-_listbox-item-px` | listbox 的 loading 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-3` | listbox 的 loading 部件 padding-block 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `background-color` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
