---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

树（Tree）的 `multiple` 改为选择模式 `selectionMode`（Web Components 为 `selection-mode`），取值与 Listbox 相同：`'single'`（缺省，单选不变）、`'multiple'`（原 `multiple: true`，点击与确认键切换，Shift 点击并进一段）、`'extended'`（新增，照文件管理器：点击与确认键换成这一项，按住 Ctrl / Cmd 点击或 Ctrl / Cmd + Space 切换这一项，按住 Shift 点击选锚点到这一项那一段，同时按 Ctrl / Cmd 则并进）。`multiple` 与 `extended` 下 tree 报 `aria-multiselectable="true"`；级联勾选 `cascade` 只在 `multiple` 下生效。Ctrl / Cmd + Space 在两种多选模式下都只切换焦点节点。`TreeApi` 的 `multiple` 改为 `selectionMode`，`select(value, options)` 的选项新增 `additive`；新增类型 `TreeSelectionMode`。

升级：`multiple: true` 改写 `selectionMode: 'multiple'`（Vue 模板与 Web Components 把 `multiple` 改成 `selection-mode="multiple"`）；读 `api.multiple` 的改读 `api.selectionMode !== 'single'`。TreeSelect 的 `multiple` 不变。
