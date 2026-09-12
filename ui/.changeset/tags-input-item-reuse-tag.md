---
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/react": major
"@xihan-ui/web-components": major
"@xihan-ui/styles": major
---

**`tags-input` 的标签预览退役成 `tag`：`item-preview` / `item-text` / `item-delete-trigger` 不再是本组件的部件，渲出来的是 `tag` 的 `root` / `label` / `close-trigger`（`data-scope="tag"`），样子归 `tag.css`。**

标签输入里每一枚标签此前是本组件自己画的一颗胶囊（底色、圆角、字号、删除钮、悬停与按压都另写一套）——`tag` 本来就是这枚胶囊，第二份就是另起一套。现在：

- **连接层**：每一枚标签在 `connectTagsInput` 里各是一份 `connectStaticTag`（`variant` 按控件的面派：`subtle` 控件里是描边标签，其余含缺省是淡底标签；`tone` / `size` / `disabled` / `readOnly` 随控件；`closable: true`；`translations.close` 取 `translations.deleteItem(标签值)`）。预览就是这份实例的 `getRootProps()`，`open` 只看这一枚是不是正被就地编辑：编辑时 `tag` 按 `open=false` 给 `hidden` 与 `data-state="closed"`，与 `item-input` 的 `hidden` 互斥。文字是 `getLabelProps()`，删除钮是 `getCloseTriggerProps()` 再合上 `tabindex="-1"` 与「按下不夺焦」——按它时 `tag` 只发 `onOpenChange({ open: false })`，`tags-input` 在那里送 `TAG.DELETE` 并把焦点交回输入框（仅当焦点当下正落在这一枚里）。
- **状态标记留在 `item` 上**：`data-value` / `data-highlighted` / `data-editing` / `data-disabled` / `data-readonly` 仍打在本组件的 `item` 包裹层上，`tag` 的 `root` 只带 `tag` 自己的属性（三轴、`data-state`、`data-disabled`、`hidden`）。光标走到标签上的反白由 `[data-scope='tags-input'][data-part='item'][data-highlighted] > [data-scope='tag'][data-part='root']` 这条跨 scope 规则画在 `tag` 的 `root` 上，覆盖槽仍是 `--xh-tags-input-item-bg-highlight` / `-fg-highlight`。
- **禁用 / 只读矩阵由 `tag` 给**：禁用时钮留在原地、原生 `disabled` 并带 `data-disabled`，整枚标签置灰；只读时钮同样留位、原生 `disabled`，标签本身不置灰。
- **可及名**：仍走 `translations.deleteItem`（缺省 `Delete <标签值>`），经 `tag` 的 `translations.close` 落到那颗钮上。
- **三家适配器**：Vue / React 的 `XhTagsInputItemPreview` / `XhTagsInputItemText` / `XhTagsInputItemDeleteTrigger` 名字与用法不变，渲出来的节点换成 `tag` 的三个部件；Web Components 侧作者写法不变（`data-xh-part="item-preview"` / `"item-text"` / `"item-delete-trigger"`），三个作者名以 `delegates` 登记为归 `tag` 的 scope 管。
- **皮肤**：`tags-input.css` 里画胶囊的规则整段删掉（`item` 的底色 / 圆角 / 字号 / 反白 / 置灰 / 编辑态透底，`item-preview` 的内衬，`item-text` 的截断，`item-delete-trigger` 的尺寸 / 圆角 / 悬停 / 按压 / 聚焦环 / 禁用色 / 兜底字形）；`item` 只剩「在行里怎么占位」（不缩、不超过一行）。标签吃 `tag.css`：三档高 22 / 26 / 30 装进控件的 28 / 32 / 40 里，框仍是一行控件高；就地编辑框的行框、内衬与字号照 `tag` 那一档写，换进换出时与标签一样高、行不跳。

**破坏面：**

- `tags-input` 的解剖少三个部件（12 → 9）：`item-preview` / `item-text` / `item-delete-trigger` 删除。按 `[data-scope='tags-input'][data-part='item-preview' | 'item-text' | 'item-delete-trigger']` 选择过的皮肤、测试与作者样式要改成 `[data-scope='tag'][data-part='root' | 'label' | 'close-trigger']`（要限定在 `tags-input` 里就前缀 `[data-scope='tags-input'][data-part='item']`）。
- `tags-input.css` 的这些覆盖槽随之删除：`--xh-tags-input-item-bg` / `-fg` / `-gap`，`--xh-tags-input-delete-size` / `-radius` / `-bg` / `-fg` / `-font-size` / `-fg-highlight` / `-bg-hover` / `-fg-hover` / `-bg-active`，改用 `tag` 的 `--xh-tag-bg` / `--xh-tag-fg` / `--xh-tag-gap` / `--xh-tag-close-size` / `--xh-tag-close-radius` / `--xh-tag-close-fg` / `--xh-tag-close-bg-hover` / `--xh-tag-close-bg-active`（写在 `tags-input` 的根上即对整框的标签生效）。`--xh-tags-input-item-radius` / `-py` / `-px` / `-font-size` 只剩就地编辑框在用，`-radius` 的缺省从 `--xh-shape-pill` 改成 `--xh-shape-control`（与 `tag` 同）。
- 标签的高从随字号算的一档变成 `tag` 的三档 22 / 26 / 30，圆角从胶囊圆改成 `--xh-shape-control`，字重取 `tag` 的 `--xh-font-weight-medium`；反白档描边收成透明。
- 悬停 / 按压底色从 `--xh-bg-subtle-hover` / `-active` 换成由当前前景色兑出的 `color-mix`；缺省字色从 `--xh-fg-muted` 换成标签自己的文字色。
- 聚焦环不再由 `tags-input.css` 画，走 `focus.css` 的通用环；反白标签里的叉取 `currentColor`。
- 只读时删除钮从「原生 `disabled`（由整组只读推得）」保持原生 `disabled` 不变，但现在是 `tag` 的 `readOnly` 给的：钮带 `data-disabled`，标签的 `root` 不带。
