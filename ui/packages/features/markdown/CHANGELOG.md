# @xihan-ui/markdown

## 3.0.0

### Minor Changes

- c2ad137: 流式 Markdown 渲染器补齐流式容错、GFM 扩展与行内挂点：

  - 生长块不露原始符号：还在生长的最后一块做行内容错，没写完的加粗、斜体、删除线与行内代码先按闭合显示，开符号后面还没有字时先不显示；写到一半的链接只显示文字，图片、行内引用与脚注写到一半时整段先不显示。块定型或流结束后按原文严格解析。
  - GFM 任务列表（只读勾选框，`li` 带 `data-task`）、脚注（角标按首次引用编号，定义渲成带回链的脚注列表）与裸地址自动成链（`http(s)://`、`www.`，末尾标点与全角标点不算进地址）。
  - 行内引用 `[@来源]` / `[@甲; @乙]` 与行内公式 `$…$`（行内写的 `$$…$$` 记 display）渲成带 `data-md-inline` 的占位节点，`RenderedBlock` 新增 `inlines` 按出现先后给出挂点内容；金额里的美元符号不成公式。
  - `createStreamRenderer` 新增选项：`idPrefix`（脚注锚点前缀，缺省 `md-`）与 `bareLinks`（裸地址成链，缺省开；要严格按 CommonMark 渲染时关掉）。
  - 新增导出类型 `RenderedInline`、`StreamRendererOptions`。

## 2.1.0

## 2.0.0

### Minor Changes

- e72ed26: **新增** `RenderedBlock.source`：代码块与公式块除了已消毒的 `html`，另给一份未转义的正文原文。

  代码块给的是剥掉起止围栏的代码，公式块给的是剥掉 `$$` 的公式。`html` 对这两种块只是降级产物——代码要交给代码组件重排行号与着色，公式要交给公式引擎，两者都得拿到未经转义的正文，此前只能从已转义的 html 反解。其余种类的块不带这个字段。

  **新增** `logMachine`，`log` 组件不再借用 `thread` 的机器。

  两者本来就是各自独立的组件，共用一台机器只是历史遗留。这一改顺带修好一处 `<xh-log>` 的全局文案失效：Web Components 侧按机器名给 `<xh-config>` 的文案分桶，`<xh-log>` 此前会去取 `thread` 那一格，作者写在 `<xh-config>` 上的日志区可访问名从来到不了元素；同时元素的行数、载入态与文案三个视图属性此前完全不过全局配置，现在一并接上。

  `stick-change` 事件的载荷类型随之改名为 `LogStickChangeDetails`（形状不变，仍是 `{ atBottom, sticking }`）。

## 1.1.0

## 1.0.0

### Major Changes

- bc65cb7: 首个公开版本：框架无关的 UI 基座。

  自研薄 FSM 内核 + headless（anatomy / machine / connect）+ 设计令牌与主题运行时 + 样式层，
  102 个组件在 Vue 与 Web Components 两套适配器上共用同一份内核，跨适配器一致性套件与
  真实 Chromium 里的无障碍扫描、浮层定位契约全绿。

  浮层定位、虚拟滚动、Web Components 响应式基类、代码着色、流式 Markdown 均为自研，
  运行时不带第三方依赖。

## 1.0.0-preview.0

## 1.0.0-alpha.3

## 1.0.0-alpha.2

## 1.0.0-alpha.1

## 1.0.0-alpha.0

### Major Changes

- bc65cb7: 首个公开版本：框架无关的 UI 基座。

  自研薄 FSM 内核 + headless（anatomy / machine / connect）+ 设计令牌与主题运行时 + 样式层，
  102 个组件在 Vue 与 Web Components 两套适配器上共用同一份内核，跨适配器一致性套件与
  真实 Chromium 里的无障碍扫描、浮层定位契约全绿。

  浮层定位、虚拟滚动、Web Components 响应式基类、代码着色、流式 Markdown 均为自研，
  运行时不带第三方依赖。
