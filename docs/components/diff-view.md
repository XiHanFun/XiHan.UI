# 差异视图 <Badge type="info" text="diff-view" />

一份改动的逐行呈现：并排或单栏、双侧行号、变更类型的读屏文字，以及远离变更处的折叠。

## 何时使用

- 展示 AI 提议的代码改动，或两版文本的对比。
- 手里有一份统一格式的补丁，或者有新旧两版全文。

## 何时不用

- 只展示一段代码：用[代码视图](./code-view)。
- 展示的是「AI 提议的数据编辑逐条取舍」：那是一张带多选的[表格](./table)。

## 特性

- **两个入口归一到同一个模型**：`computeTextDiff(before, after)` 拿两版全文算，
  `parseUnifiedPatch(patch)` 解析补丁；组件只认模型。
- **着色在建模时一次算好**，不在连接层跑：`computeTextDiff` 手里有完整文本，
  整体切一次再按行取，跨行的块注释与多行字符串才不会着错色。
  `parseUnifiedPatch` 拿不到完整文件，因此**一律不填着色**——宁可不着色也不错着色。
- **词级差异**：配对的一条删除行与一条新增行之间再比一次词，只有真正动过的那几段上底色，
  整行改写与超长行不比（比出来满行都在闪，等于没有重点）。两个入口都产出，`wordDiff: false` 关掉。
- `contextLines` 把 hunk 内远离变更的连续上下文折成一格，点开即展开。
  展开集合可受控，好让「全部展开」这类操作统一持有。
- `wrap` 让长行原地折行，卡片不再横向滚动；窄栏与并排视图下尤其有用。
- 头部自带增删统计位 `stat`，增删各一个，数字取自模型、着色跟着变更类型走。
- `maxLines` 是必须有的上限：AI 会吐超大文件，超出即截断并标出来。
- 行号与列号一律从模型算，**绝不从 DOM 反推**。

## 示例

### 单栏差异

两个入口归一到同一个模型：这里用新旧两版全文算，着色在建模时一次算好

<XhDemo src="diff-view/01-unified" />

### 并排与折叠

并排两列都发格子，空的那一侧照发；远离变更的连续上下文折成一格，点开即展开

<XhDemo src="diff-view/02-split-fold" />

### 长行换行与词级差异

开 wrap 让长行原地折行；配对的删改行之间再比一次词，只有真正动过的那几段上底色

<XhDemo src="diff-view/03-wrap-words" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-diff-view>` |
| Vue 组件 | `XhDiffViewBody` `XhDiffViewEmpty` `XhDiffViewHeader` `XhDiffViewRoot` `XhDiffViewStat` `XhDiffViewViewport` |
| 组合式函数 | `useDiffView` |
| 状态机 | `diffViewMachine` |
| 皮肤 | `@xihan-ui/styles/diff-view.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="diff-view"`：**`root`** · `header` · `stat` · **`viewport`** · **`body`** · `row` · `line-number` · `line-content` · `change-label` · `segment` · `token` · `gap` · `gap-cell` · `gap-trigger` · `empty`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `model` | `DiffModel` |  | 差异模型，唯一入口。补丁与新旧两版文本都先归一到它。 |
| `view` | `DiffViewMode` |  |  |
| `contextLines` | `number` |  | 变更两侧各露几行上下文，其余折起来；不给或非有限值即不折叠。 |
| `expanded` | `readonly string[]` |  | 展开的折叠格 id 集合，给了即受控。 |
| `defaultExpanded` | `readonly string[]` |  |  |
| `wrap` | `boolean` |  | 长行原地折行，不再横向滚动；默认关。 |
| `size` | `Size` |  |  |
| `translations` | `Partial<DiffViewTranslations>` |  |  |
| `onExpandedChange` | `(details: DiffViewExpandedChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `expanded-change` | `DiffViewExpandedChangeDetails` | 展开集合变化；detail 为 `{ expanded: string[] }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhDiffViewRoot` | `default` | `DiffViewRootSlotProps` |  |
| `XhDiffViewStat` | `default` | `{ count: number }` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`GAP.EXPAND` · `GAP.COLLAPSE` · `CONTROLLED.EXPANDED.SET`

**判据**：`isExpandedControlled`

## connect API

`useDiffView` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `view` | `DiffViewMode` |  |
| `rows` | `readonly DiffViewRow[]` | 折叠后的可见行序，含折起来的那些格。 |
| `expanded` | `string[]` |  |
| `stats` | `{ added: number, removed: number }` | 增删各多少行。 |
| `truncated` | `boolean` | 模型被上限截断过。 |
| `isEmpty` | `boolean` | 一条变更都没有。 |
| `setExpanded` | `(next: string[]) => void` |  |
| `toggleGap` | `(id: string) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getStatProps` | `(props: { change: DiffChange }) => T['element']` | 头部右侧的增删统计位，增删各一个。 |
| `getViewportProps` | `() => T['element']` |  |
| `getBodyProps` | `() => T['element']` |  |
| `getRowProps` | `(props: DiffViewRowProps) => T['element']` |  |
| `getLineNumberProps` | `(props: DiffViewCellProps) => T['element']` |  |
| `getLineContentProps` | `(props: DiffViewCellProps) => T['element']` |  |
| `getChangeLabelProps` | `(props: { change: DiffChange }) => T['element']` |  |
| `getSegmentProps` | `(props: DiffViewSegmentProps) => T['element']` |  |
| `getTokenProps` | `(token: CodeToken) => T['element']` |  |
| `getGapProps` | `(props: DiffViewGapProps) => T['element']` |  |
| `getGapCellProps` | `() => T['element']` |  |
| `getGapTriggerProps` | `(props: DiffViewGapProps) => T['button']` |  |
| `getEmptyProps` | `() => T['element']` |  |
| `changeLabel` | `(change: DiffChange) => string` | 变更类型对应的读屏文字，写进视觉隐藏的那一格。 |
| `cellText` | `(props: DiffViewCellProps) => string \| undefined` | 这一行在这一侧的文本；split 下空侧为 undefined。 |
| `cellNumber` | `(props: DiffViewCellProps) => number \| undefined` | 这一行在这一侧的行号；没有就是 undefined。 |
| `cellTokens` | `(props: DiffViewCellProps) => readonly CodeToken[]` | 这一行在这一侧的着色片段；不着色或空侧时为空数组。 |
| `cellSegments` | `(props: DiffViewCellProps) => readonly DiffViewSegment[]` | 这一行在这一侧的词级片段，着色记号已按片段边界切好。 没算词级差异时为空数组，此时照 cellTokens / cellText 铺。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` | 差异视图在 Tab 序列中 | 滚动容器自身可聚焦，随后方向键的横纵滚动交给浏览器，组件不接管 |
| `Enter` / `Space` | 焦点在展开按钮上 | 展开该处折起来的上下文行；组件只接 click，按键走原生 button 的默认行为 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

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
| `gap-trigger` | `aria-label` | translations?.expandGap |

- 表格语义：`role=table` 配 `role=row` 与 `role=cell`，带 `aria-rowcount` / `aria-rowindex` /
  `aria-colcount` / `aria-colindex`。列数只数**真正暴露的内容列**——行号不算列。
- 每一行都带一段视觉隐藏的变更类型文字：**变更不能只靠颜色传达**。
- 变更行还有一条非颜色线索：新增画实心色条，删除画同宽的斜纹条，灰度与高对比度下也分得开。
- 行号对读屏隐藏，由皮肤用 `attr()` 画出来，因此复制差异不会带上行号。
- **刻意不采表格那套行级 roving**：只读差异不是网格，给每份差异一个吞方向键的焦点组
  会把页面滚动抢走，而读屏本来就有表格浏览模式。这是显式裁决，不是遗漏。

## 样式

默认皮肤 `@xihan-ui/styles/diff-view.css` 按部件选择：`[data-scope="diff-view"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-truncated` | ''（条件成立时才出现） |
| `root` | `data-view` | props.view |
| `root` | `data-wrap` | ''（条件成立时才出现） |
| `stat` | `data-change` | change |
| `row` | `data-change` | lineAt(rowIndex)?.change |
| `row` | `data-revealed` | ''（条件成立时才出现） |
| `line-number` | `data-change` | lineAt(rowIndex)?.change |
| `line-number` | `data-line-number` | cellNumber({ rowIndex, side })?.toString() |
| `line-number` | `data-side` | side |
| `line-content` | `data-change` | lineAt(rowIndex)?.change |
| `line-content` | `data-empty` | ''（条件成立时才出现） |
| `line-content` | `data-side` | side |
| `change-label` | `data-change` | change |
| `segment` | `data-change` | lineAt(rowIndex)?.change \| undefined |
| `token` | `data-kind` | token.kind |
| `gap` | `data-expanded` | ''（条件成立时才出现） |
| `gap` | `data-value` | hunkIndex:0 |
| `gap-trigger` | `data-value` | hunkIndex:0 |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-diff-view-added-bg` · `--xh-diff-view-added-fg` · `--xh-diff-view-bg` · `--xh-diff-view-border` · `--xh-diff-view-change-bar` · `--xh-diff-view-comment-fg` · `--xh-diff-view-empty-bg` · `--xh-diff-view-empty-fg` · `--xh-diff-view-font` · `--xh-diff-view-font-size` · `--xh-diff-view-gap-bg` · `--xh-diff-view-gap-bg-hover` · `--xh-diff-view-gap-fg` · `--xh-diff-view-gutter` · `--xh-diff-view-header-fg` · `--xh-diff-view-header-font-size` · `--xh-diff-view-header-gap` · `--xh-diff-view-keyword-fg` · `--xh-diff-view-keyword-weight` · `--xh-diff-view-line-height` · `--xh-diff-view-max-h` · `--xh-diff-view-number-fg` · `--xh-diff-view-number-token-fg` · `--xh-diff-view-punctuation-fg` · `--xh-diff-view-px` · `--xh-diff-view-py` · `--xh-diff-view-radius` · `--xh-diff-view-removed-bg` · `--xh-diff-view-removed-fg` · `--xh-diff-view-segment-radius` · `--xh-diff-view-shadow` · `--xh-diff-view-string-fg`

## 动效

关键帧 `xh-diff-view-reveal` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 单栏与并排的切换用[开关组](./toggle-group)；增删统计已有成品位，不必再自己拼
  （只要数字不要版式时仍可用 `diffStats(model)`）。
- 装进[工具调用](./tool-call)的详情区，展示这次调用改了什么。
- 要做「AI 提议的编辑逐条取舍 + 应用」：用[表格](./table)的选择机制承载行级取舍，
  单元格里放[复选框](./checkbox)，页脚的计数与「应用」用[按钮](./button)。
  差异视图本身只读，不接这套交互。

## 最佳实践

- 并排视图给足宽度：两列各自还要横向滚动，窄栏下单栏更好读，或者开 `wrap` 让长行折下来。
- 折叠阈值取三到五行：再少就一直在点展开，再多就等于没折。

## 反模式

- 拿补丁算出来的差异去着色：那份文本是残缺的，跨行的记号一定切错。
- 用颜色作为变更类型的唯一线索：色觉障碍与高对比度模式下它就消失了。
