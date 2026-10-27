# ExpressionInput 表达式输入框

输入受限表达式，边输入边报出问题，并补全可引用的名字与函数。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/expression-input" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/expression-input.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/expression-input" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/expression-input" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/expression-input.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

输入名字弹出可引用的字段与函数；检查报出的问题在框下逐条列出，问题区间画波浪线

<XhDemo src="expression-input/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="expression-input"`：**`root`** · `label` · **`control`** · **`input`** · `highlight` · `highlight-segment` · `issues` · `issue` · `positioner` · `content` · `item` · `item-prefix` · `item-text` · `item-suffix` · `item-description` · `empty`

## 示例

### 成员补全

补全写成函数，由宿主按光标处的查询给出：在 $row. 之后只列行内字段

<XhDemo src="expression-input/02-members" />

### 多行

长公式分行写：autoSize 给出行数上下限，问题位置带上行号，补全浮层跟着光标

<XhDemo src="expression-input/03-multiline" />

### 插入字段

宿主的按钮调用 insert：在选区处插入字段名，焦点回到输入框，光标落在插入内容之后

<XhDemo src="expression-input/04-insert" />

### 放进表单字段

字段的标题与说明接到输入框上；组件自己的问题列表排在字段说明之后进描述链

<XhDemo src="expression-input/05-field" />

## 设计指引

### 何时使用

- 表单的联动条件、赋值与表达式校验规则。
- 打印模板里的表达式内容、报表的计算列。
- 后台的规则配置页：让使用者写一条能被检查的公式，而不是一段自由文本。

### 何时不用

- 值是从一组选项里选出来的：用[选择器](./select)或[组合框](./combobox)。
- 只是普通文本，不需要检查与补全：用[文本字段](./text-field)。
- 在正文里 @ 人或插入引用：用[提及](./mention)。

### 特性

- 检查由宿主给的 `check` 完成：值变化后去抖（`checkDelay`，缺省 150 毫秒）调用，失焦时立即调用；值为空时不检查。`@xihan-ui/expression` 的 `createExpressionCheck(engine, { identifiers })` 返回的函数可以直接交给它。
- 问题在两处呈现：镜像层把问题区间画成波浪下划线（error 危险色、warning 警告色），框下的问题列表逐行写「第 3 列：未知的名字 amont」，多行时写「第 2 行第 5 列」。问题列表是 `role=status` 的活区，并进输入框的描述链。
- 有 error 即 `aria-invalid`；作者给的 `invalid` 与之取或。warning 只提示，不让输入框无效。
- 补全按光标前的名字给出：输入名字字符且有匹配才打开；名字前紧挨着点时（如 `$row.`）只列宿主给的成员。Ctrl+Space 主动打开，光标前没有名字也列出全部，没有匹配时显示空态。光标在字符串或数字里时不弹补全。
- 补全来源两处：宿主的 `completions`（静态列表按前缀过滤；函数形式由宿主按查询自己给出），以及 `functions` 函数表（缺省全部内置函数，传空表即不补函数）。函数条目显示签名，如 `IF(条件, 真值[, 假值])`、`SUM(值…)`，下一行是一句话说明。
- 接受补全时只替换光标处的名字：函数插入 `NAME()` 且光标落在括号里，变量插入名字；`insert(text)` 在选区处插入一段文本，供宿主的「插入字段」按钮使用。
- 单行时输入框是 `role=combobox`；`multiline` 时是 textarea，保持 textbox 角色、不写 `aria-expanded`，补全浮层锚在光标处。
- 输入法组合期间不取词、不检查，落定后再按新值处理。
- 结构由标准结构函数一份给出：Web Components 只写 root 或什么都不写，Vue / React 不写默认插槽时，三端铺出同一棵树；写了 `label` 才铺标题，放进[表单字段](./field)时名字、说明与校验状态由字段接到输入框上。
- 字段外框与输入框走 Field Chrome 家族，与文本字段同一档高度、内衬与形态三轴；补全列表走磨砂面与集合条目家族。

### 组合

- 放进[表单字段](./field)：字段的标题、说明与错误文案接到输入框上，组件自己的问题列表排在字段说明之后进描述链。
- 宿主要提供「插入字段」之类的入口时，用[按钮](./button)或[菜单](./menu)调用 `insert`。

### 最佳实践

- `check` 用同一个引擎的 `createExpressionCheck`，`identifiers` 与补全里的变量保持一致，补全给出的名字检查时不会被判为未知。
- 宿主函数在函数表里给出 `params`，签名提示才有参数名；没给时显示为「参数 1」「参数 2」。
- 多行形态给 `autoSize` 定行数上下限，长公式在框内滚动。

### 反模式

- 只靠波浪线表达问题、去掉问题列表：读屏用户和看不清颜色的用户就失去了唯一的说明。
- 把补全当作唯一的输入方式：表达式允许手写，补全只是捷径。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-expression-input>` |
| Vue 组件 | `XhExpressionInputContent` `XhExpressionInputControl` `XhExpressionInputEmpty` `XhExpressionInputHighlight` `XhExpressionInputHighlightSegment` `XhExpressionInputInput` `XhExpressionInputIssue` `XhExpressionInputIssues` `XhExpressionInputItem` `XhExpressionInputItemDescription` `XhExpressionInputItemPrefix` `XhExpressionInputItemSuffix` `XhExpressionInputItemText` `XhExpressionInputLabel` `XhExpressionInputPositioner` `XhExpressionInputRoot` |
| 组合式函数 | `useExpressionInput` |
| 状态机 | `expressionInputMachine` |
| 皮肤 | `@xihan-ui/styles/expression-input.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `labelled` | `boolean` |  | 作者渲染了 label 部件时置真，由适配器统计而不是判断标题文字是否有值。 为假时可聚焦部件不把 label 的 id 写进 aria-labelledby。 |
| `ariaLabel` | `string` |  | 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上。 放进字段（字段接线）或渲染了 label 部件时名字以它们为准，aria-labelledby 盖过它。 |
| `label` | `string` |  | 标题文字；给了即由标准结构生成 label 部件。 |
| `multiline` | `boolean` |  | 多行：输入框是 textarea，位置说明带行号，补全浮层锚在光标处。 |
| `issuesRendered` | `boolean` |  | 作者渲染了 issues 部件时置真，由适配器统计；为假时输入框的描述链不引用它。 |
| `value` | `string` |  | 受控值；提供后由宿主决定。 |
| `defaultValue` | `string` |  | 非受控初值。 |
| `check` | `ExpressionCheck` |  | 检查函数；不给时不报问题。 |
| `completions` | `ExpressionCompletionSource` |  | 宿主的变量与成员补全；不给时只补函数。 |
| `functions` | `FunctionTable` |  | 函数补全的来源，缺省全部内置函数；传空表即不补函数。 |
| `placeholder` | `string` |  |  |
| `name` | `string` |  |  |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |
| `required` | `boolean` |  |  |
| `invalid` | `boolean` |  | 校验失败标注；与检查报出的 error 取或。 |
| `autoSize` | `boolean \| ExpressionInputAutoSize` |  | 多行宿主的自动高度，与文本字段同义。 |
| `checkDelay` | `number` |  | 输入后多久检查，单位毫秒，缺省 150；失焦时立即检查。 |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 true。 |
| `placement` | `Placement` |  |  |
| `dir` | `Direction` |  | 文字方向；只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  |  |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost。默认 outline。 |
| `tone` | `Tone` |  |  |
| `size` | `Size` |  |  |
| `translations` | `Partial<ExpressionInputTranslations>` |  |  |
| `onValueChange` | `(details: ExpressionInputValueChangeDetails) => void` |  |  |
| `onIssuesChange` | `(details: ExpressionInputIssuesChangeDetails) => void` |  | 检查结果变了才通知。 |
| `onCompletionSelect` | `(details: ExpressionInputCompletionSelectDetails) => void` |  | 接受了一条补全。 |
| `onOpenChange` | `(details: ExpressionInputOpenChangeDetails) => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ExpressionInputValueChangeDetails` | 值变化；detail 为 `{ value: string }` |
| `issues-change` | `ExpressionInputIssuesChangeDetails` | 检查结果变了；detail 为 `{ issues }` |
| `completion-select` | `ExpressionInputCompletionSelectDetails` | 接受了一条补全；detail 为 `{ completion }` |
| `open-change` | `ExpressionInputOpenChangeDetails` | 补全开合；detail 为 `{ open: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhExpressionInputRoot` | `default` | `ExpressionInputRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhExpressionInputHighlightSegment` | `index` | `string` | 是 | 在 segments 里的序号。 |
| `XhExpressionInputInput` | `as` | `ExpressionInputHost` |  | 输入框渲染为哪个标签；缺省跟着根上的 multiline。 |
| `XhExpressionInputIssue` | `index` | `string` | 是 | 在 issues 里的序号。 |
| `XhExpressionInputItem` | `value` | `string` | 是 | 条目的 key。 |
| `XhExpressionInputPositioner` | `container` | `() => Element \| null` |  | 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 |
| `XhExpressionInputRoot` | `children` | `SlotChildren<ExpressionInputRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `input` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `empty` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`INPUT.CHANGE` · `CARET.SYNC` · `COMPOSITION.START` · `COMPOSITION.END` · `OPEN.FORCE` · `OPEN` · `WORD.CHANGED` · `CLOSE` · `ESCAPE` · `ITEM.HIGHLIGHT` · `ITEM.SELECT` · `VALUE.SET` · `TEXT.INSERT` · `CHECK.RUN` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**判据**：`canEdit` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` |  |
| `open` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` | 作者给的 invalid 或检查报出了 error。 |
| `items` | `readonly ExpressionInputItem[]` | 当前的补全条目，按显示顺序。 |
| `highlightedKey` | `string \| null` | 高亮条目的 key；收起时为 null。 |
| `empty` | `boolean` | 打开着但没有一条补全。 |
| `emptyText` | `string` | 空态的缺省文字。 |
| `kindText` | `(kind: ExpressionCompletionKind) => string` | 条目种类小标的文字。 |
| `issues` | `readonly ExpressionInputIssueView[]` | 检查函数最近一次给出的问题，带上位置与说明。 |
| `segments` | `readonly ExpressionInputSegment[]` | 高亮镜像层的分段：问题区间单独成段。 |
| `setValue` | `(next: string) => void` | 整段改写值，浮层随之收起。 |
| `insert` | `(text: string) => void` | 在光标处插入一段文本（替换选区）；输入框还没挂上时接在末尾。 |
| `close` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` | 标题；`for` 恒指向 input，须是原生 `&lt;label&gt;`。 |
| `getControlProps` | `() => T['element']` | 字段视觉盒：描边与底色画在它上面，输入框与高亮层排在它里面。 |
| `getInputProps` | `(props?: ExpressionInputInputProps) => T['input']` | 输入框；不传参即单行 input，写 textarea 即多行宿主。 |
| `getHighlightProps` | `() => T['element']` | 叠在输入框下的镜像层，把问题区间画成波浪下划线；对读屏隐藏。 |
| `getHighlightSegmentProps` | `(props: ExpressionInputMarkProps) => T['element']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getItemProps` | `(props: ExpressionInputItemProps) => T['element']` |  |
| `getItemPrefixProps` | `(props: ExpressionInputItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: ExpressionInputItemProps) => T['element']` |  |
| `getItemSuffixProps` | `(props: ExpressionInputItemProps) => T['element']` |  |
| `getItemDescriptionProps` | `(props: ExpressionInputItemProps) => T['element']` |  |
| `getEmptyProps` | `() => T['element']` | 没有匹配的补全时显示的空态；与 content 同级。 |
| `getIssuesProps` | `() => T['element']` | 问题列表（role=status）；没有问题时带 hidden 收起。 |
| `getIssueProps` | `(props: ExpressionInputIssueProps) => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `名字字符` | 光标不在字符串或数字里 | 按光标前的名字打开补全，有匹配才打开；名字前紧挨着点时只列宿主给的成员 |
| `Ctrl+Space` | 光标不在字符串或数字里 | 主动打开补全，光标前没有名字也列出全部可用的变量与函数；没有匹配时显示空态 |
| `ArrowDown` | open | 高亮移到下一条（尽头按 loop 回绕），焦点不动 |
| `ArrowUp` | open | 高亮移到上一条（尽头按 loop 回绕），焦点不动 |
| `Enter` / `Tab` | open, 有高亮 | 用高亮条目替换光标处的名字：函数插入 NAME() 且光标落在括号里，变量插入名字；补全收起，这次按键被吞掉 |
| `Enter` | closed | 不接管：单行时交给表单做隐式提交，多行时照常换行 |
| `Escape` | open | 收起补全且值不变；接着输入名字字符会再打开 |
| `ArrowLeft` / `ArrowRight` / `Home` / `End` | 任意时候 | 一律不接管：光标照常移动；打开着时按新位置重取名字，挪出名字即收起 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `input` | `aria-activedescendant` | `item` 部件的 id \| undefined |
| `input` | `aria-autocomplete` | 'list' |
| `input` | `aria-controls` | `content` 部件的 id |
| `input` | `aria-describedby` | `issues` 部件的 id \| undefined |
| `input` | `aria-expanded` | undefined \| 'true' \| 'false' |
| `input` | `aria-haspopup` | 'listbox' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-label` | props.ariaLabel |
| `input` | `aria-labelledby` | `label` 部件的 id \| undefined |
| `input` | `aria-readonly` | 'true' \| 'false' |
| `input` | `aria-required` | 'true' \| 'false' |
| `input` | `role` | undefined \| 'combobox' |
| `highlight` | `aria-hidden` | 'true' |
| `issues` | `role` | 'status' |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-label` | t.content |
| `content` | `role` | 'listbox' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-prefix` | `aria-hidden` | 'true' |
| `empty` | `role` | 'status' |

## 样式参考

### 皮肤

`@xihan-ui/styles/expression-input.css` 按 `[data-scope="expression-input"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-expression-input` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-size` | props.size |
| `input` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-invalid` | ''（条件成立时才出现） |
| `input` | `data-state` | 'open' \| 'closed' |
| `input` | `data-xh-field-auto-size` | ''（条件成立时才出现） |
| `input` | `data-xh-field-input` | '' |
| `input` | `data-xh-field-layout` | 'textarea' \| 'single-line' |
| `highlight` | `data-multiline` | ''（条件成立时才出现） |
| `highlight-segment` | `data-issue` | undefined \| String(segment.issue) |
| `highlight-segment` | `data-severity` | segment.severity |
| `issues` | `data-invalid` | ''（条件成立时才出现） |
| `issue` | `data-issue` | String(issue.index) |
| `issue` | `data-severity` | issue.issue.severity |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `positioner` | `data-variant` | props.variant |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-state` | 'open' \| 'closed' |
| `content` | `data-xh-material` | 'frosted' |
| `item` | `data-highlighted` | ''（条件成立时才出现） |
| `item` | `data-pressed` | ''（条件成立时才出现） |
| `item` | `data-xh-collection-context` | 'overlay' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `item-prefix` | `data-highlighted` | ''（条件成立时才出现） |
| `item-prefix` | `data-xh-collection-slot` | 'prefix' |
| `item-text` | `data-highlighted` | ''（条件成立时才出现） |
| `item-text` | `data-xh-collection-slot` | 'text' |
| `item-suffix` | `data-highlighted` | ''（条件成立时才出现） |
| `item-suffix` | `data-xh-collection-slot` | 'suffix' |
| `item-description` | `data-highlighted` | ''（条件成立时才出现） |
| `item-description` | `data-xh-collection-slot` | 'description' |
| `empty` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-expression-input-content-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `xh-material=frosted` | `--xh-_material-backdrop` | expression-input 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-expression-input-content-bg` | `content` | `background` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-bg` | expression-input 的 content 部件 background 覆盖槽。 |
| `--xh-expression-input-content-border` | `content` | `border` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-border` | expression-input 的 content 部件 border 覆盖槽。 |
| `--xh-expression-input-content-fg` | `content` | `color` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-fg` | expression-input 的 content 部件 color 覆盖槽。 |
| `--xh-expression-input-content-gap` | `content` | `gap` | `default` | `--xh-list-option-gap` | expression-input 的 content 部件 gap 覆盖槽。 |
| `--xh-expression-input-content-highlight` | `content` | `background` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-highlight` | expression-input 的 content 部件 background 覆盖槽。 |
| `--xh-expression-input-content-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-max-h` | expression-input 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-expression-input-content-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` | expression-input 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-expression-input-content-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-min-w` | expression-input 的 content 部件 min-inline-size 覆盖槽。 |
| `--xh-expression-input-content-px` | `content` | `padding-inline` | `default` | `--xh-space-1` | expression-input 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-expression-input-content-py` | `content` | `padding-block` | `default` | `--xh-space-1` | expression-input 的 content 部件 padding-block 覆盖槽。 |
| `--xh-expression-input-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` | expression-input 的 content 部件 border-radius 覆盖槽。 |
| `--xh-expression-input-content-shadow` | `content` | `box-shadow` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-shadow` | expression-input 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-expression-input-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` | expression-input 的 control 部件 background-color 覆盖槽。 |
| `--xh-expression-input-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` | expression-input 的 control 部件 background-color 覆盖槽。 |
| `--xh-expression-input-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` | expression-input 的 control 部件 background-color 覆盖槽。 |
| `--xh-expression-input-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` | expression-input 的 control 部件 background-color 覆盖槽。 |
| `--xh-expression-input-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` | expression-input 的 control 部件 border 覆盖槽。 |
| `--xh-expression-input-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` | expression-input 的 control 部件 border-color 覆盖槽。 |
| `--xh-expression-input-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` | expression-input 的 control 部件 border-color 覆盖槽。 |
| `--xh-expression-input-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` | expression-input 的 control 部件 border-color 覆盖槽。 |
| `--xh-expression-input-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` | expression-input 的 control 部件 color 覆盖槽。 |
| `--xh-expression-input-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_expression-input-gap` | expression-input 的 control 部件 gap 覆盖槽。 |
| `--xh-expression-input-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_expression-input-h` | expression-input 的 control 部件 block-size、min-block-size 覆盖槽。 |
| `--xh-expression-input-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` | expression-input 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-expression-input-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_expression-input-px` | expression-input 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-expression-input-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` | expression-input 的 control 部件 border-radius 覆盖槽。 |
| `--xh-expression-input-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` | expression-input 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-expression-input-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` | expression-input 的 root 部件 inline-size、min-inline-size 覆盖槽。 |
| `--xh-expression-input-empty-fg` | `empty` | `color` | `default` | `--xh-material-frosted-fg-muted` | expression-input 的 empty 部件 color 覆盖槽。 |
| `--xh-expression-input-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_expression-input-font-size` | expression-input 的 empty 部件 font-size 覆盖槽。 |
| `--xh-expression-input-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_expression-input-px` | expression-input 的 empty 部件 padding-inline 覆盖槽。 |
| `--xh-expression-input-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` | expression-input 的 empty 部件 padding-block 覆盖槽。 |
| `--xh-expression-input-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` | expression-input 的 label、root 部件 gap、margin-block-end 覆盖槽。 |
| `--xh-expression-input-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-bg-canvas` | expression-input 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-expression-input-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-fg-default` | expression-input 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-expression-input-input-fg` | `input` | `color` | `xh-field-input` | `--xh-fg-default` | expression-input 的 input 部件 color 覆盖槽。 |
| `--xh-expression-input-input-font-size` | `highlight`<br>`input` | `font-size` | `default`<br>`xh-field-input` | `--xh-_expression-input-font-size` | expression-input 的 highlight、input 部件 font-size 覆盖槽。 |
| `--xh-expression-input-input-max-h` | `input` | `max-block-size` | `xh-field-auto-size` | `--xh-viewport-h-sm` | expression-input 的 input 部件 max-block-size 覆盖槽。 |
| `--xh-expression-input-issue-error-fg` | `highlight-segment`<br>`issue` | `color`<br>`text-decoration-color` | `default`<br>`issue` | `--xh-fg-danger` | expression-input 的 highlight-segment、issue 部件 color、text-decoration-color 覆盖槽。 |
| `--xh-expression-input-issue-font-size` | `issue` | `font-size` | `default` | `--xh-text-caption-size` | expression-input 的 issue 部件 font-size 覆盖槽。 |
| `--xh-expression-input-issue-warning-fg` | `highlight-segment`<br>`issue` | `color`<br>`text-decoration-color` | `severity=warning` | `--xh-fg-warning` | expression-input 的 highlight-segment、issue 部件 color、text-decoration-color 覆盖槽。 |
| `--xh-expression-input-issues-gap` | `issues` | `gap` | `default` | `--xh-space-0_5` | expression-input 的 issues 部件 gap 覆盖槽。 |
| `--xh-expression-input-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` | expression-input 的 item 部件 background-color 覆盖槽。 |
| `--xh-expression-input-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` | expression-input 的 item 部件 background-color 覆盖槽。 |
| `--xh-expression-input-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-material-frosted-fg` | expression-input 的 item 部件 color 覆盖槽。 |
| `--xh-expression-input-item-font-size` | `item` | `font-size` | `default` | `--xh-_expression-input-font-size` | expression-input 的 item 部件 font-size 覆盖槽。 |
| `--xh-expression-input-item-gap` | `item` | `margin-inline-end`<br>`margin-inline-start` | `xh-collection-slot=indicator`<br>`xh-collection-slot=prefix`<br>`xh-collection-slot=shortcut`<br>`xh-collection-slot=suffix` | `--xh-_expression-input-gap` | expression-input 的 item 部件 margin-inline-end、margin-inline-start 覆盖槽。 |
| `--xh-expression-input-item-h` | `item` | `min-block-size` | `default` | `--xh-_expression-input-item-h` | expression-input 的 item 部件 min-block-size 覆盖槽。 |
| `--xh-expression-input-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` | expression-input 的 item 部件 line-height 覆盖槽。 |
| `--xh-expression-input-item-prefix-fg` | `item-prefix` | `color` | `default` | `--xh-material-frosted-fg-muted` | expression-input 的 item-prefix 部件 color 覆盖槽。 |
| `--xh-expression-input-item-prefix-font-size` | `item-prefix` | `font-size` | `default` | `--xh-_expression-input-caption-size` | expression-input 的 item-prefix 部件 font-size 覆盖槽。 |
| `--xh-expression-input-item-prefix-w` | `item-prefix` | `min-inline-size` | `default` | `--xh-space-8` | expression-input 的 item-prefix 部件 min-inline-size 覆盖槽。 |
| `--xh-expression-input-item-px` | `item` | `padding-inline` | `default` | `--xh-_expression-input-px` | expression-input 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-expression-input-item-py` | `item` | `padding-block` | `default` | `--xh-_expression-input-item-py` | expression-input 的 item 部件 padding-block 覆盖槽。 |
| `--xh-expression-input-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-inset` | expression-input 的 item 部件 border-radius 覆盖槽。 |
| `--xh-expression-input-item-suffix-fg` | `item-suffix` | `color` | `default` | `--xh-material-frosted-fg-muted` | expression-input 的 item-suffix 部件 color 覆盖槽。 |
| `--xh-expression-input-item-suffix-font-size` | `item-suffix` | `font-size` | `default` | `--xh-_expression-input-caption-size` | expression-input 的 item-suffix 部件 font-size 覆盖槽。 |
| `--xh-expression-input-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | expression-input 的 label 部件 color 覆盖槽。 |
| `--xh-expression-input-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | expression-input 的 label 部件 font-size 覆盖槽。 |
| `--xh-expression-input-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | expression-input 的 label 部件 font-weight 覆盖槽。 |
| `--xh-expression-input-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` | expression-input 的 label 部件 margin-block-end 覆盖槽。 |
| `--xh-expression-input-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | expression-input 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-expression-input-placeholder-fg` | `input` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` | expression-input 的 input 部件 color 覆盖槽。 |
| `--xh-expression-input-textarea-py` | `highlight`<br>`input` | `padding-block` | `multiline`<br>`xh-field-input`<br>`xh-field-layout=textarea` | `--xh-space-1` | expression-input 的 highlight、input 部件 padding-block 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 出现（锚定列表）（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
