# DiffView 差异视图 <Badge type="info" text="alpha" />

一份改动的逐行呈现：并排或单栏、双侧行号、变更类型的读屏文字，以及远离变更处的折叠。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/diff-view" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/diff-view.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/diff-view" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/diff-view" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/diff-view.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

两个入口归一到同一个模型：这里用新旧两版全文计算，着色在建模时一次算好

<XhDemo src="diff-view/01-unified" />

## 组件结构

加粗的是必需部件。

`data-scope="diff-view"`：**`root`** · `header` · `summary` · **`viewport`** · **`body`** · `row` · `line-number` · `line-content` · `change-label` · `inline-change` · `token` · `gap` · `gap-cell` · `gap-trigger` · `empty` · `truncation`

## 示例

### 并排与折叠

并排两列都发出格子，空的一侧照发；远离变更的连续上下文折为一格，点击即展开

<XhDemo src="diff-view/02-split-fold" />

### 长行换行与词级差异

开启 wrap 使长行原地折行；配对的删改行之间再比较一次词，只有真正改动的片段上底色

<XhDemo src="diff-view/03-wrap-words" />

### 超长差异的截断提示

超过 maxLines 的部分被截去，提示条向读者说明截去了多少行

<XhDemo src="diff-view/04-truncated" />

### 尺寸

size 改变字号、行高与行号槽的宽度，三档并列对照

<XhDemo src="diff-view/05-size" />

## 设计指引

### 何时使用

- 展示 AI 提议的代码改动，或两版文本的对比。
- 已有统一格式的补丁，或有新旧两版全文。

### 何时不用

- 只展示一段代码时，使用[代码视图](./code-view)。
- 展示 AI 提议的数据编辑并逐条取舍时，使用带多选的[表格](./table)。

### 特性

- 两个入口归一到同一个模型：`computeTextDiff(before, after)` 用两版全文计算，`parseUnifiedPatch(patch)` 解析补丁；组件只接受模型。
- 自定义渲染器可调用 `diffViewSides(view)` 取得列序：单栏为旧侧，分栏按旧侧、新侧排列。
- 着色在建模时一次计算，不在连接层执行：`computeTextDiff` 持有完整文本，整体切分一次再按行取用，跨行的块注释与多行字符串才不会着错色。`parseUnifiedPatch` 拿不到完整文件，因此一律不着色。
- 词级差异：配对的一条删除行与一条新增行之间再比较一次词，只有实际变动的片段加底色；整行改写与超长行不比较。两个入口都产出，`wordDiff: false` 关闭。
- `contextLines` 把 hunk 内远离变更的连续上下文折成一格，点击展开。展开集合可受控，便于“全部展开”等操作统一持有。
- `wrap` 让长行原地折行，容器不再横向滚动；窄栏与并排视图下尤其有用。
- 头部自带增删统计位 `summary`，增删各一个，数字取自模型，着色跟随变更类型。
- `maxLines` 是必需的上限：AI 可能输出超大文件，新旧两侧各自超出时从尾部截断。截断行数由模型带出，`truncation` 提示条向读者说明。
- 行号与列号一律从模型计算，不从 DOM 反推。

### 组合

- 单栏与并排的切换使用[切换按钮组](./toggle-group)；增删统计已有成品位（只需要数字时可用 `diffStats(model)`）。
- 放入[工具调用](./tool-call)的详情区，展示本次调用的改动。
- 需要对 AI 提议的编辑逐条取舍并应用时，使用[表格](./table)的选择机制承载行级取舍，单元格内放[复选框](./checkbox)，页脚的计数与“应用”使用[按钮](./button)。差异视图本身只读，不接这套交互。

### 最佳实践

- 并排视图给足宽度：两列各自还要横向滚动；窄栏下单栏更易读，或开启 `wrap` 让长行折行。
- 折叠阈值取三到五行：过少时需要频繁展开，过多时折叠失去意义。

### 反模式

- 截断后不渲染 `truncation`：截断的差异看起来仍像完整差异，评审者会误以为已经看完。
- 对补丁计算出的差异着色：文本不完整，跨行的记号必然切错。
- 用颜色作为变更类型的唯一线索：色觉障碍与高对比度模式下会失效。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-diff-view>` |
| Vue 组件 | `XhDiffViewBody` `XhDiffViewEmpty` `XhDiffViewHeader` `XhDiffViewRoot` `XhDiffViewSummary` `XhDiffViewTruncation` `XhDiffViewViewport` |
| 组合式函数 | `useDiffView` |
| 状态机 | `diffViewMachine` |
| 皮肤 | `@xihan-ui/styles/diff-view.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `model` | `DiffModel` |  | 差异模型，唯一入口。补丁与新旧两版文本都先归一到它。 |
| `view` | `DiffViewMode` |  |  |
| `contextLines` | `number` |  | 变更两侧各显示的上下文行数，其余折叠；未提供或非有限值时不折叠。 |
| `expandedValue` | `readonly string[]` |  | 展开的折叠格 id 集合，提供即受控。 |
| `defaultExpandedValue` | `readonly string[]` |  |  |
| `wrap` | `boolean` |  | 长行原地折行，不再横向滚动；默认关闭。 |
| `size` | `Size` |  |  |
| `translations` | `Partial<DiffViewTranslations>` |  |  |
| `onExpandedValueChange` | `(details: DiffViewExpandedValueChangeDetails) => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `expanded-value-change` | `DiffViewExpandedValueChangeDetails` | 展开集合变化；detail 为 `{ value: string[] }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhDiffViewRoot` | `default` | `DiffViewRootSlotProps` |  |
| `XhDiffViewSummary` | `default` | `{ count: number }` |  |
| `XhDiffViewTruncation` | `default` | `{ count: number }` |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`GAP.EXPAND` · `GAP.COLLAPSE` · `CONTROLLED.EXPANDED.SET` · `PRESS.START` · `PRESS.END`

**判据**：`isExpandedControlled`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `view` | `DiffViewMode` |  |
| `rows` | `readonly DiffViewRow[]` | 折叠后的可见行序，含折叠的格。 |
| `expandedValue` | `string[]` |  |
| `stats` | `{ added: number, removed: number }` | 增删的行数。 |
| `truncated` | `boolean` | 模型被上限截断过。 |
| `truncatedLines` | `number` | 被上限截断、未进入模型的源文本行数；未截断时为 0。 |
| `truncationText` | `string` | 截断提示条的文字，已代入行数；未截断时为空串。 |
| `isEmpty` | `boolean` | 没有任何变更。 |
| `setExpandedValue` | `(next: string[]) => void` |  |
| `toggleGap` | `(id: string) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getSummaryProps` | `(props: { change: DiffChange }) => T['element']` | 头部右侧的增删统计位，增删各一个。 |
| `getViewportProps` | `() => T['element']` |  |
| `getBodyProps` | `() => T['element']` |  |
| `getRowProps` | `(props: DiffViewRowProps) => T['element']` |  |
| `getLineNumberProps` | `(props: DiffViewCellProps) => T['element']` |  |
| `getLineContentProps` | `(props: DiffViewCellProps) => T['element']` |  |
| `getChangeLabelProps` | `(props: { change: DiffChange }) => T['element']` |  |
| `getInlineChangeProps` | `(props: DiffViewInlineChangeProps) => T['element']` |  |
| `getTokenProps` | `(token: CodeToken) => T['element']` |  |
| `getGapProps` | `(props: DiffViewGapProps) => T['element']` |  |
| `getGapCellProps` | `() => T['element']` |  |
| `getGapTriggerProps` | `(props: DiffViewGapProps) => T['button']` |  |
| `getEmptyProps` | `() => T['element']` |  |
| `getTruncationProps` | `() => T['element']` | 截断提示条；未截断时带 hidden。 |
| `changeLabel` | `(change: DiffChange) => string` | 变更类型对应的读屏文字，写入视觉隐藏的格。 |
| `cellText` | `(props: DiffViewCellProps) => string \| undefined` | 该行在该侧的文本；split 下空侧为 undefined。 |
| `cellNumber` | `(props: DiffViewCellProps) => number \| undefined` | 该行在该侧的行号；不存在时为 undefined。 |
| `cellTokens` | `(props: DiffViewCellProps) => readonly CodeToken[]` | 该行在该侧的着色片段；不着色或空侧时为空数组。 |
| `cellSegments` | `(props: DiffViewCellProps) => readonly DiffViewSegment[]` | 该行在该侧的词级片段，着色记号已按片段边界切分。 未计算词级差异时为空数组，此时按 cellTokens / cellText 铺设。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` | 差异视图在 Tab 序列中 | 滚动容器自身可聚焦，随后方向键的横纵滚动交给浏览器，组件不接管 |
| `Enter` / `Space` | 焦点在展开按钮上 | 展开该处折起来的上下文行；组件只接 click，按键走原生 button 的默认行为 |
| `Enter` / `Space` | 按住展开按钮 | 按住期间该格的 gap-trigger 投影 data-pressed，与指针 :active 同一副按压面（disclosure trigger 只换面不缩放）；抬起、失焦或该格展开撤下 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `body` | `aria-colcount` | 2 \| 1 |
| `body` | `aria-label` | undefined \| translations?.diff |
| `body` | `aria-labelledby` | `header` 部件的 id \| undefined |
| `body` | `aria-rowcount` | rows.length |
| `body` | `role` | 'table' |
| `row` | `aria-rowindex` | rowIndex |
| `row` | `role` | 'row' |
| `line-number` | `aria-hidden` | 'true' |
| `line-content` | `aria-colindex` | 2 \| 1 |
| `line-content` | `role` | 'cell' |
| `gap` | `role` | 'row' |
| `gap-cell` | `aria-colindex` | 1 |
| `gap-cell` | `role` | 'cell' |
| `gap-trigger` | `aria-expanded` | 'true' \| 'false' |
| `gap-trigger` | `aria-label` | expandGapLabel(hiddenCountOf(gapId)) |

- 表格语义：`role=table` 配 `role=row` 与 `role=cell`，带 `aria-rowcount` / `aria-rowindex` / `aria-colcount` / `aria-colindex`。列数只计算实际暴露的内容列，行号不算列。
- 每一行都带一段视觉隐藏的变更类型文字，变更不只靠颜色传达。
- 变更行还有一条非颜色线索：新增绘制实心色条，删除绘制同宽的斜纹条，灰度与高对比度下也可区分。
- 行号对读屏隐藏，由皮肤用 `attr()` 绘制，复制差异不会带上行号。
- 不采用表格的行级 roving：只读差异不是网格，吞掉方向键的焦点组会抢走页面滚动，读屏本身也有表格浏览模式。这是显式决定。

## 样式参考

### 皮肤

`@xihan-ui/styles/diff-view.css` 使用 `[data-scope="diff-view"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-truncated` | ''（条件成立时才出现） |
| `root` | `data-view` | props.view |
| `root` | `data-wrap` | ''（条件成立时才出现） |
| `summary` | `data-change` | change |
| `row` | `data-change` | lineAt(rowIndex)?.change |
| `row` | `data-revealed` | ''（条件成立时才出现） |
| `line-number` | `data-change` | lineAt(rowIndex)?.change |
| `line-number` | `data-line-number` | cellNumber({ rowIndex, side })?.toString() |
| `line-number` | `data-side` | side |
| `line-content` | `data-change` | lineAt(rowIndex)?.change |
| `line-content` | `data-empty` | ''（条件成立时才出现） |
| `line-content` | `data-side` | side |
| `change-label` | `data-change` | change |
| `inline-change` | `data-change` | lineAt(rowIndex)?.change \| undefined |
| `token` | `data-kind` | token.kind |
| `gap` | `data-expanded` | ''（条件成立时才出现） |
| `gap` | `data-value` | hunkIndex:0 |
| `gap-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `gap-trigger` | `data-value` | hunkIndex:0 |
| `gap-trigger` | `data-xh-action-control` | '' |
| `gap-trigger` | `data-xh-action-display` | 'always' |
| `gap-trigger` | `data-xh-action-profile` | 'disclosure-trigger' |
| `gap-trigger` | `data-xh-action-size` | props.size |
| `gap-trigger` | `data-xh-action-variant` | 'ghost' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-diff-view-added-bg` | `row` | `background` | `change=added` | `--xh-diff-added-bg` | diff-view 的 row 部件 background 覆盖槽。 |
| `--xh-diff-view-added-fg` | `inline-change`<br>`line-content`<br>`line-number`<br>`row`<br>`summary` | `background`<br>`box-shadow`<br>`color` | `change=added` | `--xh-diff-added-fg` | diff-view 的 inline-change、line-content、line-number、row、summary 部件 background、box-shadow、color 覆盖槽。 |
| `--xh-diff-view-bg` | `root` | `background` | `default` | `--xh-bg-surface` | diff-view 的 root 部件 background 覆盖槽。 |
| `--xh-diff-view-border` | `root` | `border` | `default` | `--xh-border-default` | diff-view 的 root 部件 border 覆盖槽。 |
| `--xh-diff-view-change-bar` | `row` | `background`<br>`box-shadow` | `change=added`<br>`change=removed` | `--xh-stroke-thick` | diff-view 的 row 部件 background、box-shadow 覆盖槽。 |
| `--xh-diff-view-comment-fg` | `token` | `color` | `kind=comment` | `--xh-fg-muted` | diff-view 的 token 部件 color 覆盖槽。 |
| `--xh-diff-view-divider` | `header`<br>`line-number`<br>`root` | `border-block-end`<br>`border-inline-end`<br>`border-inline-start` | `@media (min-width: 1024px)`<br>`default`<br>`side=new`<br>`view=split` | `--xh-border-subtle` | diff-view 的 header、line-number、root 部件 border-block-end、border-inline-end、border-inline-start 覆盖槽。 |
| `--xh-diff-view-empty-bg` | `line-content` | `background` | `empty` | `--xh-bg-subtle` | diff-view 的 line-content 部件 background 覆盖槽。 |
| `--xh-diff-view-empty-fg` | `empty` | `color` | `default` | `--xh-fg-muted` | diff-view 的 empty 部件 color 覆盖槽。 |
| `--xh-diff-view-font` | `body`<br>`header` | `font-family` | `default` | `--xh-font-family-mono` | diff-view 的 body、header 部件 font-family 覆盖槽。 |
| `--xh-diff-view-font-size` | `body`<br>`gap-trigger` | `font-size` | `default` | `--xh-_diff-view-font-size` | diff-view 的 body、gap-trigger 部件 font-size 覆盖槽。 |
| `--xh-diff-view-gap-bg` | `gap` | `background` | `default` | `--xh-bg-subtle` | diff-view 的 gap 部件 background 覆盖槽。 |
| `--xh-diff-view-gap-bg-hover` | `gap-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | diff-view 的 gap-trigger 部件 background-color 覆盖槽。 |
| `--xh-diff-view-gap-fg` | `gap-trigger` | `color` | `default` | `--xh-fg-muted` | diff-view 的 gap-trigger 部件 color 覆盖槽。 |
| `--xh-diff-view-gutter` | `line-number` | `inline-size` | `default` | `4ch` | diff-view 的 line-number 部件 inline-size 覆盖槽。 |
| `--xh-diff-view-header-fg` | `header` | `color` | `default` | `--xh-fg-muted` | diff-view 的 header 部件 color 覆盖槽。 |
| `--xh-diff-view-header-font-size` | `empty`<br>`header`<br>`truncation` | `font-size` | `default` | `--xh-text-secondary-size` | diff-view 的 empty、header、truncation 部件 font-size 覆盖槽。 |
| `--xh-diff-view-header-gap` | `header` | `gap` | `default` | `--xh-space-2` | diff-view 的 header 部件 gap 覆盖槽。 |
| `--xh-diff-view-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | diff-view 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-diff-view-inline-change-radius` | `inline-change` | `border-radius` | `change` | `--xh-shape-inset` | diff-view 的 inline-change 部件 border-radius 覆盖槽。 |
| `--xh-diff-view-keyword-fg` | `token` | `color` | `kind=keyword` | `--xh-syntax-keyword` | diff-view 的 token 部件 color 覆盖槽。 |
| `--xh-diff-view-keyword-weight` | `token` | `font-weight` | `kind=keyword` | `--xh-font-weight-semibold` | diff-view 的 token 部件 font-weight 覆盖槽。 |
| `--xh-diff-view-line-height` | `body`<br>`gap`<br>`gap-trigger`<br>`row` | `block-size`<br>`line-height`<br>`min-block-size` | `default`<br>`xh-action-profile=disclosure-trigger` | `--xh-text-code-leading` | diff-view 的 body、gap、gap-trigger、row 部件 block-size、line-height、min-block-size 覆盖槽。 |
| `--xh-diff-view-max-h` | `viewport` | `max-block-size` | `default` | `--xh-viewport-max-h` | diff-view 的 viewport 部件 max-block-size 覆盖槽。 |
| `--xh-diff-view-number-fg` | `line-number` | `color` | `default` | `--xh-fg-subtle` | diff-view 的 line-number 部件 color 覆盖槽。 |
| `--xh-diff-view-number-token-fg` | `token` | `color` | `kind=number` | `--xh-syntax-number` | diff-view 的 token 部件 color 覆盖槽。 |
| `--xh-diff-view-punctuation-fg` | `token` | `color` | `kind=punctuation` | `--xh-fg-subtle` | diff-view 的 token 部件 color 覆盖槽。 |
| `--xh-diff-view-px` | `empty`<br>`gap-trigger`<br>`header`<br>`line-content`<br>`line-number`<br>`truncation` | `padding-inline`<br>`padding-inline-end` | `default` | `--xh-_diff-view-px` | diff-view 的 empty、gap-trigger、header、line-content、line-number、truncation 部件 padding-inline、padding-inline-end 覆盖槽。 |
| `--xh-diff-view-py` | `empty`<br>`header`<br>`truncation` | `padding-block` | `default` | `--xh-_diff-view-py` | diff-view 的 empty、header、truncation 部件 padding-block 覆盖槽。 |
| `--xh-diff-view-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | diff-view 的 root 部件 border-radius 覆盖槽。 |
| `--xh-diff-view-removed-bg` | `row` | `background` | `change=removed` | `--xh-diff-removed-bg` | diff-view 的 row 部件 background 覆盖槽。 |
| `--xh-diff-view-removed-fg` | `inline-change`<br>`line-content`<br>`line-number`<br>`row`<br>`summary` | `background`<br>`color` | `change=removed` | `--xh-diff-removed-fg` | diff-view 的 inline-change、line-content、line-number、row、summary 部件 background、color 覆盖槽。 |
| `--xh-diff-view-shadow` | `root` | `box-shadow` | `default` | `none` | diff-view 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-diff-view-string-fg` | `token` | `color` | `kind=string` | `--xh-syntax-string` | diff-view 的 token 部件 color 覆盖槽。 |
| `--xh-diff-view-truncation-bg` | `truncation` | `background` | `default` | `--xh-fg-warning` | diff-view 的 truncation 部件 background 覆盖槽。 |
| `--xh-diff-view-truncation-border` | `truncation` | `border-block-start` | `default` | `--xh-border-subtle` | diff-view 的 truncation 部件 border-block-start 覆盖槽。 |
| `--xh-diff-view-truncation-fg` | `truncation` | `color` | `default` | `--xh-fg-warning` | diff-view 的 truncation 部件 color 覆盖槽。 |
| `--xh-diff-view-truncation-gap` | `truncation` | `gap` | `default` | `--xh-space-2` | diff-view 的 truncation 部件 gap 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-diff-view-reveal` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤按视口分档：`min-width: 1024px`。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
