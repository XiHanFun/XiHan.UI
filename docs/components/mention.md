# Mention 提及 <Badge type="info" text="alpha" />

在正文中输入前缀字符后弹出候选，选中后把引用插入文本。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/mention" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/mention.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/mention" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/mention" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/mention.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

在正文中输入 @ 才打开候选，选中的条目被插入光标处，前后文不变

<XhDemo src="mention/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="mention"`：**`root`** · `label` · **`input`** · `positioner` · **`content`** · `empty` · `loading` · `item` · `item-text`

## 示例

### 多种前缀

@ 提及成员、# 添加标签共用一个输入框，query-change 会报告是哪个前缀触发的

<XhDemo src="mention/02-multi-prefix" />

### 候选中的自定义内容

手写各部件即可在候选行中放置头像与职位；插回正文的文字取自 item-text

<XhDemo src="mention/03-custom-item" />

### 受控正文与选中回调

正文由宿主持有，select 事件报告插入的是哪一条，用于收集收件人名单

<XhDemo src="mention/04-controlled" />

### 异步候选

查询串每次变化都重新向远端查询，加载、空结果和候选共用一张浮层表面

<XhDemo src="mention/05-async" />

### 变体

variant 更换正文框的描边与底色，候选面板不受影响

<XhDemo src="mention/06-variant" />

## 设计指引

### 何时使用

- 评论、聊天、任务描述中 @ 某个人或 # 某个条目。
- 需要多种前缀各自对应一份候选。

### 何时不用

- 整个输入框的值就是选中项时，使用[组合框](./combobox)。
- 只补全普通词汇时，使用[组合框](./combobox)或原生自动补全。
- 正文需要跨行时，本组件的输入框是单行的，不提供多行形态。

### 特性

- 单行输入框，与其他输入控件使用同一档行高与内衬。
- 多种前缀各自映射一份候选。
- `onQueryChange` 给出当前查询串，异步候选据此拉取。
- 正文可受控，选中时另有回调。
- `label` 部件为输入框提供可点击的标题；提供 `translations.input` 时仍使用 `aria-label`。
- 提供 `collection` 但没有任何候选时显示 `empty` 部件。
- `content` 是候选、空态与加载态共用的唯一浮层表面；`empty` / `loading` 是 listbox 之外的同级 `role=status`，只在零可见候选时把文字覆盖到该表面。自动结构保留 `No results`，手写结构没有状态文案时不绘制空框。
- 候选仍在加载且当前没有可见项时由 `loading` 显示，空态让位；已有候选时列表保持可见可操作，只通过 `aria-busy` 报告后台刷新。
- 带 `hidden` 的候选不参与计数、高亮、方向键或 Enter；全部隐藏后清除 `aria-activedescendant`，不提交不可见的旧项。
- `name` 让整段正文随表单提交，表单重置回落到 `defaultValue`。
- 正文输入保持实体，唯一候选面使用 M2 磨砂面与细顶光；空态和加载文字位于材质之上，不另绘框。浮层使用四向短位移，不缩放文字；增强对比度时切为实体，减弱动效时取消位移。

### 组合

- 正文只有一行，与[文本字段](./text-field)的单行档并排时等高。
- 在多行正文中 @ 人的场景，本库当前没有对应组件。

### 最佳实践

- 候选按最近使用排序，@ 的对象高度重复。
- 插入后的引用应能整体删除，不让用户逐字退格。
- 异步示例应显式组合 `empty` 与 `loading`，不用外部文字代替浮层内的正式状态，也不把状态伪装成 option。

### 反模式

- 候选异步且没有在途反馈，用户会以为没有可 @ 的对象。
- 前缀字符在正文中本就常用（如代码中的 `#`）却不提供退出方式。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-mention>` |
| Vue 组件 | `XhMentionContent` `XhMentionEmpty` `XhMentionInput` `XhMentionItem` `XhMentionItemText` `XhMentionLabel` `XhMentionLoading` `XhMentionPositioner` `XhMentionRoot` |
| 组合式函数 | `useMention` |
| 状态机 | `mentionMachine` |
| 皮肤 | `@xihan-ui/styles/mention.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `triggerPrefix` | `string \| string[]` |  | 打开候选的前缀字符，默认 '@'。提供数组即多种前缀并存，宿主按 onQueryChange 报回的 prefix 分流。 前缀必须紧跟在行首或空白之后，邮箱地址中的 @ 因此不会误触发。 |
| `collection` | `MentionNode[]` |  | 候选数据，显示文本与禁用的事实源。过滤仍由调用方完成：传入的即当前应显示的候选。 组件不负责筛选，只负责交出查询串。 |
| `value` | `string` |  | 整段正文。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。 |
| `defaultValue` | `string` |  |  |
| `disabled` | `boolean` |  | 整个控件禁用：输入框使用原生 disabled，候选一概不打开。 |
| `readOnly` | `boolean` |  | 只读：正文仍可聚焦与复制，不可修改，候选也不打开。 |
| `invalid` | `boolean` |  | 校验失败标注：描边与聚焦环换为失败色，同时经 aria-invalid 上报。 |
| `loading` | `boolean` |  | 候选加载中：候选面板报告 aria-busy，显示在途占位、隐藏空态占位。 |
| `placeholder` | `string` |  | 输入框占位文字。未提供时整条不输出，作者写在 input 部件上的声明因此得以保留。 |
| `name` | `string` |  | 表单字段名；提供后输入框才带 name，整段正文随表单一并提交。 |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 true。 |
| `placement` | `Placement` |  |  |
| `dir` | `Direction` |  | 文字方向，默认 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  |  |
| `translations` | `MentionTranslations` |  |  |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定输入框的描边与底色使用方式。默认 outline。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与高亮使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定输入框内边距与字号档位。 |
| `onValueChange` | `(details: MentionValueChangeDetails) => void` |  | 正文变化回调；受控时是唯一出口。 |
| `onQueryChange` | `(details: MentionQueryChangeDetails) => void` |  | 查询串变化回调：调用方据此重新过滤候选。收起时报告 null。 |
| `onSelect` | `(details: MentionSelectDetails) => void` |  | 候选被插入正文时回调，附带是哪一条。 |
| `onOpenChange` | `(details: MentionOpenChangeDetails) => void` |  | 浮层开合回调。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `MentionValueChangeDetails` | 正文变化；detail 为 `{ value: string }` |
| `query-change` | `MentionQueryChangeDetails` | 查询串变化；detail 为 `{ query, prefix }`，作者据此过滤候选；收起时报告 null |
| `select` | `MentionSelectDetails` | 候选被插入正文；detail 为 `{ value, label, prefix }` |
| `open-change` | `MentionOpenChangeDetails` | 浮层开合；detail 为 `{ open: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhMentionRoot` | `default` | `MentionRootSlotProps` |  |
| `XhMentionRoot` | `item` | `MentionNodeMeta` | 铺开 collection 时每条候选的文本插槽。 |
| `XhMentionRoot` | `empty` | — | 铺开 collection 时空态中的文案；未写时使用内建英文。 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `input` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `empty` | 'open' \| 'closed' |
| `loading` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `ESCAPE` · `INPUT.CHANGE` · `CARET.SYNC` · `VALUE.SET` · `ITEM.HIGHLIGHT` · `ITEM.SELECT` · `ITEMS.SYNC` · `FORM.RESET`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `collection` | `readonly MentionNodeMeta[]` | 由 collection 推导的候选元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `value` | `string` | 整段正文。 |
| `query` | `string \| null` | 当前查询串；没有触发时为 null。 |
| `activePrefix` | `string \| null` | 触发本次查询的前缀；没有触发时为 null。 |
| `highlightedValue` | `string \| null` | 高亮候选；收起时为 null。焦点不在它身上，只经 aria-activedescendant 上报。 |
| `disabled` | `boolean` |  |
| `empty` | `boolean` | 没有候选可显示：提供了 collection 且没有剩余条目。作者据此显示空态部件。 |
| `isHighlighted` | `(value: string) => boolean` |  |
| `setValue` | `(next: string) => void` | 整段改写正文，浮层随之收起。 |
| `close` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` | 标题；`for` 恒指向 input，因此须是原生 `&lt;label&gt;`。 |
| `getInputProps` | `() => T['input']` | 单行输入框；正文写在它身上。 |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getEmptyProps` | `() => T['element']` | 没有任何候选时显示的空态；有候选时带 hidden 收起。 |
| `getLoadingProps` | `() => T['element']` | 在途占位：与空态占位同一位置，两者不同时显示：加载期间显示它，空态让位。 同样是 content 的兄弟，不进入 role=listbox。 |
| `getItemProps` | `(props: MentionItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: MentionItemProps) => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `前缀字符` | 光标前是行首或空白 | 开候选浮层，并把前缀到光标之间那段作为查询串交给宿主 |
| `可打印字符` | open | 查询串跟着变长，过滤由调用方按 onQueryChange 自己做 |
| `ArrowDown` | open | 高亮移到下一个候选（禁用项跳过、尽头按 loop 回绕），焦点不动 |
| `ArrowUp` | open | 高亮移到上一个候选（禁用项跳过、尽头按 loop 回绕），焦点不动 |
| `Enter` | open, 有高亮且未禁用 | 把候选文本插到光标处替换查询串，光标落到插入内容之后，浮层收起；这次回车被吞掉，不落到表单上 |
| `Enter` | open, 无可提交候选 | 不吞按键，只把浮层收起来；摆在表单里时这次回车照常提交表单 |
| `Escape` | open | 收起浮层且正文不变；光标不离开这个触发点就不再自动展开 |
| `Tab` / `Shift+Tab` | open | 收起浮层且不拦按键，焦点按 Tab 序列自然离开 |
| `ArrowLeft` / `ArrowRight` / `Home` / `End` | 任意时候 | 一律不接管：光标照常移动，触发按新的光标位置重算，挪出查询串即收起 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `input` | `aria-activedescendant` | `item` 部件的 id \| undefined |
| `input` | `aria-autocomplete` | 'list' |
| `input` | `aria-controls` | `content` 部件的 id |
| `input` | `aria-expanded` | 'true' \| 'false' |
| `input` | `aria-haspopup` | 'listbox' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-label` | props.translations.input |
| `input` | `aria-labelledby` | `label` 部件的 id |
| `input` | `role` | 'combobox' |
| `content` | `aria-busy` | 'true' \| undefined |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-label` | props.translations.content |
| `content` | `role` | 'listbox' |
| `empty` | `role` | 'status' |
| `loading` | `role` | 'status' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |

## 样式参考

### 皮肤

`@xihan-ui/styles/mention.css` 使用 `[data-scope="mention"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

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
| `input` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-invalid` | ''（条件成立时才出现） |
| `input` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-readonly` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `positioner` | `data-variant` | props.variant |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-state` | 'open' \| 'closed' |
| `empty` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-mention-content-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-backdrop` | mention 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-mention-content-bg` | `content` | `background` | `default` | `--xh-material-frosted-bg` | mention 的 content 部件 background 覆盖槽。 |
| `--xh-mention-content-border` | `content` | `border` | `default` | `--xh-material-frosted-border` | mention 的 content 部件 border 覆盖槽。 |
| `--xh-mention-content-fg` | `content` | `color` | `default` | `--xh-material-frosted-fg` | mention 的 content 部件 color 覆盖槽。 |
| `--xh-mention-content-gap` | `content` | `gap` | `default` | `--xh-list-option-gap` | mention 的 content 部件 gap 覆盖槽。 |
| `--xh-mention-content-highlight` | `content` | `background` | `default` | `--xh-material-frosted-highlight` | mention 的 content 部件 background 覆盖槽。 |
| `--xh-mention-content-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-max-h` | mention 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-mention-content-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` | mention 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-mention-content-min-h` | `content` | `min-block-size` | `default` | `--xh-_mention-h` | mention 的 content 部件 min-block-size 覆盖槽。 |
| `--xh-mention-content-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-min-w` | mention 的 content 部件 min-inline-size 覆盖槽。 |
| `--xh-mention-content-px` | `content` | `padding-inline` | `default` | `--xh-space-1` | mention 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-mention-content-py` | `content` | `padding-block` | `default` | `--xh-space-1` | mention 的 content 部件 padding-block 覆盖槽。 |
| `--xh-mention-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` | mention 的 content 部件 border-radius 覆盖槽。 |
| `--xh-mention-content-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | mention 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-mention-empty-fg` | `empty` | `color` | `default` | `--xh-material-frosted-fg-muted` | mention 的 empty 部件 color 覆盖槽。 |
| `--xh-mention-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_mention-font-size` | mention 的 empty 部件 font-size 覆盖槽。 |
| `--xh-mention-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_mention-item-px` | mention 的 empty 部件 padding-inline 覆盖槽。 |
| `--xh-mention-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` | mention 的 empty 部件 padding-block 覆盖槽。 |
| `--xh-mention-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-bg-canvas` | mention 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-mention-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-fg-default` | mention 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-mention-input-bg` | `input` | `background` | `default` | `--xh-_mention-input-bg` | mention 的 input 部件 background 覆盖槽。 |
| `--xh-mention-input-bg-disabled` | `input` | `background` | `disabled` | `--xh-bg-subtle` | mention 的 input 部件 background 覆盖槽。 |
| `--xh-mention-input-bg-hover` | `input` | `background` | `hover`<br>`invalid`<br>`not(:disabled, [readonly], [data-invalid])` | `--xh-_mention-input-bg-hover` | mention 的 input 部件 background 覆盖槽。 |
| `--xh-mention-input-bg-readonly` | `input` | `background` | `default` | `--xh-bg-subtle` | mention 的 input 部件 background 覆盖槽。 |
| `--xh-mention-input-border` | `input` | `border` | `default` | `--xh-_mention-input-border` | mention 的 input 部件 border 覆盖槽。 |
| `--xh-mention-input-border-focus` | `input` | `border-color` | `focus-visible` | `--xh-_tone` | mention 的 input 部件 border-color 覆盖槽。 |
| `--xh-mention-input-border-hover` | `input` | `border-color` | `hover`<br>`invalid`<br>`not(:disabled, [readonly], [data-invalid])` | `--xh-_mention-input-border-hover` | mention 的 input 部件 border-color 覆盖槽。 |
| `--xh-mention-input-border-invalid` | `input` | `border-color` | `invalid` | `--xh-border-invalid` | mention 的 input 部件 border-color 覆盖槽。 |
| `--xh-mention-input-fg` | `input` | `color` | `default` | `--xh-fg-default` | mention 的 input 部件 color 覆盖槽。 |
| `--xh-mention-input-font-size` | `input` | `font-size` | `default` | `--xh-_mention-font-size` | mention 的 input 部件 font-size 覆盖槽。 |
| `--xh-mention-input-h` | `input` | `block-size` | `default` | `--xh-_mention-h` | mention 的 input 部件 block-size 覆盖槽。 |
| `--xh-mention-input-min-w` | `input`<br>`root` | `min-inline-size` | `default` | `--xh-control-min-w` | mention 的 input、root 部件 min-inline-size 覆盖槽。 |
| `--xh-mention-input-px` | `input` | `padding-inline` | `default` | `--xh-_mention-px` | mention 的 input 部件 padding-inline 覆盖槽。 |
| `--xh-mention-input-radius` | `input` | `border-radius` | `default` | `--xh-shape-control` | mention 的 input 部件 border-radius 覆盖槽。 |
| `--xh-mention-input-shadow` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill`<br>`default` | `--xh-_mention-input-shadow` | mention 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-mention-item-bg-hover` | `item` | `background` | `disabled`<br>`highlighted`<br>`not([data-disabled])` | `--xh-bg-subtle` | mention 的 item 部件 background 覆盖槽。 |
| `--xh-mention-item-fg` | `item` | `color` | `default` | `--xh-material-frosted-fg` | mention 的 item 部件 color 覆盖槽。 |
| `--xh-mention-item-font-size` | `item` | `font-size` | `default` | `--xh-_mention-font-size` | mention 的 item 部件 font-size 覆盖槽。 |
| `--xh-mention-item-gap` | `item` | `gap` | `default` | `--xh-_mention-gap` | mention 的 item 部件 gap 覆盖槽。 |
| `--xh-mention-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` | mention 的 item 部件 line-height 覆盖槽。 |
| `--xh-mention-item-px` | `item` | `padding-inline` | `default` | `--xh-_mention-item-px` | mention 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-mention-item-py` | `item` | `padding-block` | `default` | `--xh-_mention-item-py` | mention 的 item 部件 padding-block 覆盖槽。 |
| `--xh-mention-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | mention 的 item 部件 border-radius 覆盖槽。 |
| `--xh-mention-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | mention 的 label 部件 color 覆盖槽。 |
| `--xh-mention-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | mention 的 label 部件 color 覆盖槽。 |
| `--xh-mention-label-font-size` | `label` | `font-size` | `default` | `--xh-_mention-font-size` | mention 的 label 部件 font-size 覆盖槽。 |
| `--xh-mention-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | mention 的 label 部件 font-weight 覆盖槽。 |
| `--xh-mention-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-1` | mention 的 label 部件 margin-block-end 覆盖槽。 |
| `--xh-mention-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | mention 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-mention-loading-fg` | `loading` | `color` | `default` | `--xh-material-frosted-fg-muted` | mention 的 loading 部件 color 覆盖槽。 |
| `--xh-mention-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_mention-font-size` | mention 的 loading 部件 font-size 覆盖槽。 |
| `--xh-mention-loading-px` | `loading` | `padding-inline` | `default` | `--xh-_mention-item-px` | mention 的 loading 部件 padding-inline 覆盖槽。 |
| `--xh-mention-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-3` | mention 的 loading 部件 padding-block 覆盖槽。 |
| `--xh-mention-placeholder-fg` | `input` | `color` | `placeholder` | `--xh-fg-subtle` | mention 的 input 部件 color 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
