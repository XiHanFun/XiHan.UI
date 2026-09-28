# Citation 引用来源 <Badge type="info" text="alpha" />

把回答中的行内引用、可展开的来源预览和文末来源列表连成同一套可访问关系。`@xihan-ui/chat-stream` 的 `SourcePart[]` 与 `sources` 结构兼容，可以直接传入。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/citation" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/citation.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/citation" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/citation" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/citation.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

SourcePart 直接驱动行内引用、来源预览和来源列表

<XhDemo src="citation/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="citation"`：**`root`** · **`text`** · **`trigger`** · **`preview`** · `preview-header` · **`preview-title`** · `preview-meta` · `quote` · `preview-link` · `dismiss-trigger` · **`list`** · **`source`** · **`source-link`** · `source-index` · `source-title` · `source-meta`

## 示例

### 受控状态

activeSourceId 与 open 分别写回，来源数据仍是唯一真源

<XhDemo src="citation/02-controlled" />

### 文档来源

source-open 把文档 SourcePart 与锚点交给宿主打开

<XhDemo src="citation/03-document" />

### 键盘导航

来源列表使用单一 Tab 位，方向键、Home、End 移动，Enter 打开预览

<XhDemo src="citation/04-keyboard" />

## 设计指引

### 何时使用

- AI 回答、研究摘要或知识库结果需要标出结论依据，并允许用户核对原文。
- 同一来源既要在正文中以短编号出现，也要在文末列表中保留完整标题与类型。

### 何时不用

- 只是普通脚注、无需展开预览或来源交互：使用语义化链接和有序列表即可。
- 内容是导航目录而非证据来源：使用[锚点导航](./anchor)。

### 特性

- 行内 trigger 用 `aria-controls` / `aria-expanded` 指向唯一 preview region；预览再以 `aria-labelledby` 指回打开入口。
- 来源列表只占一个 Tab 位，支持 ↑ / ↓、Home、End 与 Enter / Space；`Escape` 收起预览并按需归还焦点。
- URL 来源保留原生链接导航；文档来源通过 `source-open` 把 `SourcePart` 与当前 anchor 交回宿主。
- `activeSourceId` 与 `open` 可分别受控，受控时只有宿主写回才改变可见状态。

### 最佳实践

- `sourceId` 在一组来源中保持稳定且唯一；同一来源的多次行内引用用不同 `citationId`。
- `anchors` 中保存足以核验的短引文，完整文档仍由来源链接或宿主查看器承担。
- 不要让引用编号代替正文：读屏名称会组合来源顺序与标题，但正文应在去掉引用后仍然可读。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-citation>` |
| Vue 组件 | `XhCitationList` `XhCitationPreview` `XhCitationRoot` `XhCitationSource` `XhCitationSourceIndex` `XhCitationSourceLink` `XhCitationSourceMeta` `XhCitationSourceTitle` `XhCitationText` `XhCitationTrigger` |
| 组合式函数 | `useCitation` |
| 状态机 | `citationMachine` |
| 皮肤 | `@xihan-ui/styles/citation.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `sources` | `readonly CitationSource[]` |  | @xihan-ui/chat-stream 的 SourcePart[] 可直接传入。 |
| `activeSourceId` | `string \| null` |  |  |
| `defaultActiveSourceId` | `string \| null` |  |  |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `disabled` | `boolean` |  |  |
| `loop` | `boolean` |  |  |
| `dir` | `Direction` |  |  |
| `size` | `Size` |  |  |
| `translations` | `Partial<CitationTranslations>` |  |  |
| `onActiveSourceChange` | `(details: CitationActiveSourceChangeDetails) => void` |  |  |
| `onOpenChange` | `(details: CitationOpenChangeDetails) => void` |  |  |
| `onSourceOpen` | `(details: CitationSourceOpenDetails) => void` |  | 打开原始来源；URL 的默认链接仍会正常导航，同时发出该通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `active-source-change` | `CitationActiveSourceChangeDetails` | 当前来源变化 |
| `open-change` | `CitationOpenChangeDetails` | 预览展开态变化 |
| `source-open` | `CitationSourceOpenDetails` | 用户请求打开原始来源 |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhCitationPreview` | `sourceId` | `string` | 是 |  |
| `XhCitationPreview` | `anchorIndex` | `number` |  |  |
| `XhCitationRoot` | `children` | `ReactNode` |  |  |
| `XhCitationSource` | `sourceId` | `string` | 是 |  |
| `XhCitationSource` | `disabled` | `boolean` |  |  |
| `XhCitationTrigger` | `sourceId` | `string` | 是 |  |
| `XhCitationTrigger` | `citationId` | `string` |  |  |
| `XhCitationTrigger` | `anchorIndex` | `number` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `preview` | 'open' \| 'closed' |
| `source` | 'active' \| 'inactive' |
| `source-link` | 'active' \| 'inactive' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`CITATION.ACTIVATE` · `SOURCE.ACTIVATE` · `SOURCE.OPEN` · `SOURCE.FOCUS` · `LIST.BLUR` · `OPEN.SET`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `sources` | `readonly CitationSource[]` |  |
| `activeSource` | `CitationSource \| null` |  |
| `activeSourceId` | `string \| null` |  |
| `activeAnchorIndex` | `number \| null` |  |
| `open` | `boolean` |  |
| `focusedSourceId` | `string \| null` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `setActiveSource` | `(sourceId: string) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTextProps` | `() => T['element']` |  |
| `getTriggerProps` | `(props: CitationTriggerProps) => T['button']` |  |
| `getPreviewProps` | `(props: CitationPreviewProps) => T['element']` |  |
| `getPreviewHeaderProps` | `(props: CitationPreviewProps) => T['element']` |  |
| `getPreviewTitleProps` | `(props: CitationPreviewProps) => T['element']` |  |
| `getPreviewMetaProps` | `(props: CitationPreviewProps) => T['element']` |  |
| `getQuoteProps` | `(props: CitationPreviewProps) => T['element']` |  |
| `getPreviewLinkProps` | `(props: CitationPreviewProps) => T['element']` |  |
| `getDismissTriggerProps` | `(props: CitationPreviewProps) => T['button']` |  |
| `getListProps` | `() => T['element']` |  |
| `getSourceProps` | `(props: CitationSourceItemProps) => T['element']` |  |
| `getSourceLinkProps` | `(props: CitationSourceItemProps) => T['button']` |  |
| `getSourceIndexProps` | `(props: CitationSourceItemProps) => T['element']` |  |
| `getSourceTitleProps` | `(props: CitationSourceItemProps) => T['element']` |  |
| `getSourceMetaProps` | `(props: CitationSourceItemProps) => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus on inline citation, not disabled | 展开或收起该引文对应的来源预览 |
| `ArrowDown` | focus in source list | 焦点移到下一条可用来源，尽头按 loop 回绕 |
| `ArrowUp` | focus in source list | 焦点移到上一条可用来源，尽头按 loop 回绕 |
| `Home` | focus in source list | 焦点移到第一条可用来源 |
| `End` | focus in source list | 焦点移到最后一条可用来源 |
| `Space` / `Enter` | focus on source list item, not disabled | 将该来源设为当前来源并展开预览 |
| `Escape` | source preview open | 收起预览；若焦点位于预览内则归还到打开它的行内引用或来源条目 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `preview` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-label` | labels.citation(index + 1, citationSourceTitle(current)) |
| `preview` | `aria-label` | labels.preview \| undefined |
| `preview` | `aria-labelledby` | context.get('activeTriggerId') \| undefined |
| `preview` | `role` | 'region' |
| `preview-link` | `aria-label` | labels.openSource(title) |
| `dismiss-trigger` | `aria-label` | labels.closePreview |
| `list` | `aria-label` | labels.sources |
| `list` | `role` | 'list' |
| `source` | `role` | 'listitem' |
| `source-link` | `aria-controls` | `preview` 部件的 id |
| `source-link` | `aria-current` | 'true' \| undefined |
| `source-link` | `aria-expanded` | 'true' \| 'false' |
| `source-link` | `aria-label` | labels.source(index + 1, citationSourceTitle(current)) |
| `source-index` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/citation.css` 使用 `[data-scope="citation"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'text' |
| `trigger` | `data-xh-action-size` | 'xs' |
| `trigger` | `data-xh-action-variant` | 'subtle' |
| `preview` | `data-state` | 'open' \| 'closed' |
| `preview-link` | `data-xh-action-control` | '' |
| `preview-link` | `data-xh-action-display` | 'always' \| undefined |
| `preview-link` | `data-xh-action-profile` | 'text' \| undefined |
| `preview-link` | `data-xh-action-size` | 'sm' \| undefined |
| `preview-link` | `data-xh-action-variant` | 'ghost' \| undefined |
| `dismiss-trigger` | `data-xh-action-control` | '' |
| `dismiss-trigger` | `data-xh-action-display` | 'always' |
| `dismiss-trigger` | `data-xh-action-profile` | 'icon' |
| `dismiss-trigger` | `data-xh-action-size` | 'xs' |
| `dismiss-trigger` | `data-xh-action-variant` | 'ghost' |
| `list` | `data-disabled` | ''（条件成立时才出现） |
| `source` | `data-disabled` | ''（条件成立时才出现） |
| `source` | `data-state` | 'active' \| 'inactive' |
| `source-link` | `data-current` | ''（条件成立时才出现） |
| `source-link` | `data-disabled` | ''（条件成立时才出现） |
| `source-link` | `data-state` | 'active' \| 'inactive' |
| `source-link` | `data-xh-action-control` | '' |
| `source-link` | `data-xh-action-display` | 'always' |
| `source-link` | `data-xh-action-profile` | 'row' |
| `source-link` | `data-xh-action-size` | props.size |
| `source-link` | `data-xh-action-variant` | 'ghost' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-citation-dismiss-trigger-radius` | `dismiss-trigger` | `border-radius` | `default` | `--xh-shape-control` | citation 的 dismiss-trigger 部件 border-radius 覆盖槽。 |
| `--xh-citation-fg` | `root` | `color` | `default` | `--xh-fg-default` | citation 的 root 部件 color 覆盖槽。 |
| `--xh-citation-font-size` | `root` | `font-size` | `default` | `--xh-_citation-font-size` | citation 的 root 部件 font-size 覆盖槽。 |
| `--xh-citation-gap` | `root` | `gap` | `default` | `--xh-_citation-gap` | citation 的 root 部件 gap 覆盖槽。 |
| `--xh-citation-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-_citation-icon-size` | citation 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-citation-index-active-bg` | `source`<br>`source-index` | `background` | `state=active` | `--xh-bg-brand` | citation 的 source、source-index 部件 background 覆盖槽。 |
| `--xh-citation-index-active-fg` | `source`<br>`source-index` | `color` | `state=active` | `--xh-fg-on-brand` | citation 的 source、source-index 部件 color 覆盖槽。 |
| `--xh-citation-index-bg` | `source-index` | `background` | `default` | `--xh-bg-subtle` | citation 的 source-index 部件 background 覆盖槽。 |
| `--xh-citation-index-fg` | `source-index` | `color` | `default` | `--xh-fg-muted` | citation 的 source-index 部件 color 覆盖槽。 |
| `--xh-citation-index-font-size` | `source-index` | `font-size` | `default` | `--xh-text-caption-size` | citation 的 source-index 部件 font-size 覆盖槽。 |
| `--xh-citation-index-radius` | `source-index` | `border-radius` | `default` | `--xh-shape-circle` | citation 的 source-index 部件 border-radius 覆盖槽。 |
| `--xh-citation-index-size` | `source-index` | `block-size`<br>`min-inline-size` | `default` | `--xh-control-box-sm` | citation 的 source-index 部件 block-size、min-inline-size 覆盖槽。 |
| `--xh-citation-link-fg` | `preview-link` | `color` | `default` | `--xh-fg-brand` | citation 的 preview-link 部件 color 覆盖槽。 |
| `--xh-citation-list-gap` | `list` | `gap` | `default` | `--xh-space-1` | citation 的 list 部件 gap 覆盖槽。 |
| `--xh-citation-meta-fg` | `preview-meta`<br>`source-meta` | `color` | `default` | `--xh-fg-muted` | citation 的 preview-meta、source-meta 部件 color 覆盖槽。 |
| `--xh-citation-meta-font-size` | `preview-meta`<br>`source-meta` | `font-size` | `default` | `--xh-text-caption-size` | citation 的 preview-meta、source-meta 部件 font-size 覆盖槽。 |
| `--xh-citation-preview-bg` | `preview` | `background` | `default` | `--xh-bg-surface` | citation 的 preview 部件 background 覆盖槽。 |
| `--xh-citation-preview-border` | `preview` | `border` | `default` | `--xh-border-default` | citation 的 preview 部件 border 覆盖槽。 |
| `--xh-citation-preview-fg` | `preview` | `color` | `default` | `--xh-fg-default` | citation 的 preview 部件 color 覆盖槽。 |
| `--xh-citation-preview-gap` | `preview` | `gap` | `default` | `--xh-space-3` | citation 的 preview 部件 gap 覆盖槽。 |
| `--xh-citation-preview-header-content-gap` | `preview-header` | `gap` | `first-child` | `--xh-space-0_5` | citation 的 preview-header 部件 gap 覆盖槽。 |
| `--xh-citation-preview-header-gap` | `preview-header` | `gap` | `default` | `--xh-space-3` | citation 的 preview-header 部件 gap 覆盖槽。 |
| `--xh-citation-preview-link-radius` | `preview-link` | `border-radius` | `focus-visible` | `--xh-shape-control` | citation 的 preview-link 部件 border-radius 覆盖槽。 |
| `--xh-citation-preview-px` | `preview` | `padding-inline` | `default` | `--xh-_citation-pad` | citation 的 preview 部件 padding-inline 覆盖槽。 |
| `--xh-citation-preview-py` | `preview` | `padding-block` | `default` | `--xh-_citation-pad` | citation 的 preview 部件 padding-block 覆盖槽。 |
| `--xh-citation-preview-radius` | `preview` | `border-radius` | `default` | `--xh-shape-surface` | citation 的 preview 部件 border-radius 覆盖槽。 |
| `--xh-citation-quote-border` | `quote` | `border-inline-start` | `default` | `--xh-fg-brand` | citation 的 quote 部件 border-inline-start 覆盖槽。 |
| `--xh-citation-quote-fg` | `quote` | `color` | `default` | `--xh-fg-muted` | citation 的 quote 部件 color 覆盖槽。 |
| `--xh-citation-quote-font-size` | `quote` | `font-size` | `default` | `--xh-text-secondary-size` | citation 的 quote 部件 font-size 覆盖槽。 |
| `--xh-citation-quote-ps` | `quote` | `padding-inline-start` | `default` | `--xh-space-3` | citation 的 quote 部件 padding-inline-start 覆盖槽。 |
| `--xh-citation-source-fg` | `source-link` | `color` | `default` | `--xh-fg-default` | citation 的 source-link 部件 color 覆盖槽。 |
| `--xh-citation-source-link-content-gap` | `source-link` | `gap` | `last-child` | `--xh-space-0_5` | citation 的 source-link 部件 gap 覆盖槽。 |
| `--xh-citation-source-px` | `source-link` | `padding-inline` | `default` | `--xh-space-3` | citation 的 source-link 部件 padding-inline 覆盖槽。 |
| `--xh-citation-source-py` | `source-link` | `padding-block` | `xh-action-profile=row` | `--xh-space-2` | citation 的 source-link 部件 padding-block 覆盖槽。 |
| `--xh-citation-source-radius` | `source-link` | `border-radius` | `default` | `--xh-shape-control` | citation 的 source-link 部件 border-radius 覆盖槽。 |
| `--xh-citation-source-title-fg` | `source-title` | `color` | `default` | `--xh-fg-default` | citation 的 source-title 部件 color 覆盖槽。 |
| `--xh-citation-text-fg` | `text` | `color` | `default` | `--xh-fg-default` | citation 的 text 部件 color 覆盖槽。 |
| `--xh-citation-title-fg` | `preview-title` | `color` | `default` | `--xh-fg-default` | citation 的 preview-title 部件 color 覆盖槽。 |
| `--xh-citation-title-font-size` | `preview-title` | `font-size` | `default` | `--xh-text-label-size` | citation 的 preview-title 部件 font-size 覆盖槽。 |
| `--xh-citation-title-font-weight` | `preview-title` | `font-weight` | `default` | `--xh-font-weight-semibold` | citation 的 preview-title 部件 font-weight 覆盖槽。 |
| `--xh-citation-trigger-fg` | `trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-brand` | citation 的 trigger 部件 color 覆盖槽。 |
| `--xh-citation-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-text-caption-size` | citation 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-citation-trigger-h` | `trigger` | `block-size`<br>`inline-size`<br>`min-block-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=icon`<br>`xh-action-profile=row` | `--xh-space-6` | citation 的 trigger 部件 block-size、inline-size、min-block-size、min-inline-size 覆盖槽。 |
| `--xh-citation-trigger-margin` | `trigger` | `margin-inline` | `default` | `--xh-space-0_5` | citation 的 trigger 部件 margin-inline 覆盖槽。 |
| `--xh-citation-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-space-1` | citation 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-citation-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-pill` | citation 的 trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态（见[动效规范](../design/motion#角色)）。

`background-color` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
