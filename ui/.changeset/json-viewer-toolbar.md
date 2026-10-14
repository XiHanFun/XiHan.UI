---
'@xihan-ui/headless': minor
'@xihan-ui/icons': minor
'@xihan-ui/tokens': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

JsonViewer 新增内建工具条，按需打开：`tools` 不给即没有工具条（行为与此前一致）；`true` 铺出全部工具；数组只铺列出的几项（`expand` / `wrap` / `copy` / `view`），数组里有未知的工具名直接抛错。工具条是根的第一个孩子（新部件 `toolbar`，`role=group` 带名字），钮按组件定的次序排在条的末端：展开 / 收起全部是一颗切换钮（`expand-trigger`），只在树档出现，还有收着的分支时按下展开全部、已经全部展开时按下收回顶层，名字与字形随这一下要做的事变（`data-state` 为 `open` 即已全部展开），只有根一层分支时禁用；自动换行开关（`wrap-trigger`，`aria-pressed`）只在原文档出现；复制钮（`copy-trigger`）与树 / 原文切换钮（`view-trigger`，名字与字形取要切去的那一档、带 `data-view`）钉在末端、切形态时不挪位置；两颗切换钮名字随动作走，不报 `aria-pressed`。钮是 Action Control icon 档 ghost 面，比视图低一档、最低 sm，换行开关开着时取品牌淡底选中面。复制写入的是原文档那一份，成功后钮换成对钩、前景取成功色并停 3 秒，播报区（新部件 `status`，视觉隐藏的 polite 实时区）念出回执；写入失败回到常态并通知 `onCopyError`。打印时工具条收起。

新增 `source`（值的原文，如后端下发的 JSON 文本）：提供时原文档与复制钮改用它，能解析成 JSON 就只按两格缩进重排、数字与字符串等字面量一字不改，超出安全整数的 ID 不再因解析失真；headless 另导出重排函数 `formatJsonSource`。

`view` 改为受控 / 非受控一对：新增 `defaultView` 与 `onViewChange`（Vue `view-change` 与 `v-model:view`，Web Components `view-change` 事件与 `default-view` 属性），只给 `view` 的写法照旧生效。新增原文档自动换行 `wrap` / `defaultWrap` / `onWrapChange`（开启后原文部件投影 `data-wrap`，长行折到下一行）。headless API 新增 `tools`、`wrap`、`copyStatus`、`copied`、`announcement`、`allExpanded`、`setView()`、`setWrap()`、`expandAll()`、`collapseAll()`、`copy()` 与六个部件的 getter，并导出 `JSON_VIEWER_TOOLS` / `resolveJsonViewerTools`；剪贴板写入与停留时长的工具函数挪到共享模块，`writeToClipboard` / `resolveClipboardTimeout` / `CLIPBOARD_TIMEOUT` 的导出名不变。语言包的 json-viewer 桶新增 `toolbar`、`expandAll`、`collapseAll`、`wrap`、`copy`、`copied`、`showText`、`showTree` 八条文案。Vue 的 `useJsonViewer` 新增可选的第三个参数接工具条的三路通知。

图标集新增 `list-tree`（`ListTreeIcon`，一条根线带两条缩进的子线）。新增字形令牌 `--xh-glyph-mark-copy`、`--xh-glyph-mark-expand-all`、`--xh-glyph-mark-collapse-all`、`--xh-glyph-mark-wrap`、`--xh-glyph-mark-source`、`--xh-glyph-mark-tree`；新增公开槽 `--xh-json-viewer-toolbar-gap` / `-toolbar-mb`、`--xh-json-viewer-tool-icon-size`、`--xh-json-viewer-tool-fg`、`--xh-json-viewer-tool-fg-copied`。
