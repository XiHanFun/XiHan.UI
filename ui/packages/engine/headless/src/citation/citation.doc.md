# 引用来源

把回答中的行内引用、可展开的来源预览和文末来源列表连成同一套可访问关系。`@xihan-ui/chat-stream` 的 `SourcePart[]` 与 `sources` 结构兼容，可以直接传入。

## 何时使用

- AI 回答、研究摘要或知识库结果需要标出结论依据，并允许用户核对原文。
- 同一来源既要在正文中以短编号出现，也要在文末列表中保留完整标题与类型。

## 何时不用

- 只是普通脚注、无需展开预览或来源交互：使用语义化链接和有序列表即可。
- 内容是导航目录而非证据来源：使用[锚点导航](./anchor)。

## 特性

- 行内 trigger 用 `aria-controls` / `aria-expanded` 指向唯一 preview region；预览再以 `aria-labelledby` 指回打开入口。
- 来源列表只占一个 Tab 位，支持 ↑ / ↓、Home、End 与 Enter / Space；`Escape` 收起预览并按需归还焦点。
- 预览有两种出现方式，由 `previewMode` 决定：
  - `inline`（缺省）：预览是正文流里的一块面，展开时从 0 长到整块、收起时收回 0，后面的段落随之平移；首帧就开着的预览直接呈现。缺省取它：现有结构不用改，也不依赖悬停，触屏与键盘同样顺手。
  - `hover`：预览放进 `positioner` 部件，锚定在引用编号旁的悬停卡片，搬到 portal 落点、不推动正文。指针停留 `openDelay`（缺省 700ms）出现，离开编号与卡片 `closeDelay`（缺省 300ms）后收起，中途移进卡片即撤销；卡片开着或刚收起不到 `skipDelayDuration`（缺省 300ms）时，指向另一处引用直接接替，与悬停卡片、文字提示同一套节奏。焦点落到引用上当场打开，焦点离开引用与卡片即收起；触屏没有悬停，点按照常开合。Escape 与卡片外的按下都会收起它。
- 一处引用引了几个来源时写 `sourceIds`（Web Components 在 `value` 里写成空白分隔的几个 id），预览里的 `prev-trigger` / `next-trigger` 在这几个来源之间轮换，`preview-index` 显示「2 / 3」；只有一个来源时三者收起。hover 档轮换时卡片就地换内容，不再播一次出现。
- URL 来源保留原生链接导航；文档来源通过 `source-open` 把 `SourcePart` 与当前 anchor 交回宿主。
- `activeSourceId` 与 `open` 可分别受控，受控时只有宿主写回才改变可见状态。
- 正文里的引用常随[流式正文](./markdown-stream)到达：把流式正文放进 `text` 部件，在它的 `citation` 插槽里渲 trigger。首帧一个引用都没有是真实首帧，`text` 与 `trigger` 都不是必需部件。

## 最佳实践

- `sourceId` 在一组来源中保持稳定且唯一；同一来源的多次行内引用用不同 `citationId`。
- `anchors` 中保存足以核验的短引文，完整文档仍由来源链接或宿主查看器承担。
- 不要让引用编号代替正文：读屏名称会组合来源顺序与标题，但正文应在去掉引用后仍然可读。
