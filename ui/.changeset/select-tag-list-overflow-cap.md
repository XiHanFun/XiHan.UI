---
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/react": major
"@xihan-ui/web-components": major
"@xihan-ui/styles": minor
---

**`select` 多选标签行封顶：不给 `maxTagCount` 时最多摆 3 枚，其余合成一枚 `+N`；标签行成为部件，`+N` 是一枚 `tag`，三家适配器都渲出来。**

从前 `maxTagCount` 缺省是「全摆」：选中几项，`api.tags` 就给几枚，`overflowCount` 恒 0；`+N` 没有部件，作者自己拿一个 span 画。触发器是一行控件（盒高钉在 `--xh-control-h-*`，这一点没变），标签排不下就往盒外冲——实测 320px 栏里选 10 项，最后一枚标签的右缘越过盒的右缘 195px，选 30 项越过 1315px，展开箭头一并被推出盒外；600px 栏里选 30 项也越过 1035px。

现在：

- **`maxTagCount` 缺省 3**，导出常量 `SELECT_DEFAULT_MAX_TAG_COUNT`。选中 4 项起 `api.tags` 只给前 3 枚，其余进 `overflowCount`。要回到从前的「全摆」，显式传 `maxTagCount: Infinity`。
- **新增部件 `tag-list`**（`api.getTagListProps()`）：触发器里收着可见标签与 `+N` 的那一行。无选中时带 `hidden`。
- **`+N` 那一枚**（`api.getOverflowTagProps()`）：折起的标签合成的一枚 `tag`（`data-scope="tag"`，带 `data-count`）；没有折起的标签时是 `tag` 的收起态（`data-state="closed"` + `hidden`），不留空位。文字由 `api.overflowText` 给，走新增的 `translations.overflowTag(count)`，默认 `+N`。与触发器里的标签一样套的是 `tag` 组件，见同批「选择器的标签套 `tag`」那份变更集。
- **三家适配器**：Vue 新增 `XhSelectTagList` / `XhSelectOverflowTag`，React 同名两件；`+N` 那一枚不写内容即显示 `overflowText`。Web Components 侧作者写 `<span data-xh-part="tag-list">` 与 `<span data-xh-part="overflow-tag">`（后者由元素接成 `tag` 的 root），`+N` 由元素填字（留空归元素、写了内容归作者，与 `value-text` 同一条规矩）。根插槽 / 函数式 children 的载荷多一项 `overflowText`。
- **皮肤**：`tag-list` 是触发器里可压缩、裁溢出的一行（`flex: 0 1 auto; min-inline-size: 0; overflow: hidden`），行里的标签装不下时各自缩短带省略号，`+N` 不缩；标签与 `+N` 的样子归 `tag.css`，按 `[data-scope="tag"][data-part="root"][data-count]` 覆盖 `--xh-tag-bg` / `--xh-tag-fg` 即可把 `+N` 与选中值区分；新增覆盖槽 `--xh-select-tag-list-gap`。标签行露面时 `value-text` 让位（`display: none`），无选中时反过来——两者同时写在触发器里即可，不必再按 `tags.length` 二选一；`value-text` 留在 DOM 里，触发器的可及名仍从它取到完整的选中项文本。

同一组量测改后：320px 栏里选 10 项、30 项，标签行、每枚标签与 `+N` 的右缘都不越过盒的右缘，展开箭头留在盒里；192px 的最小盒里三枚长标签都带省略号，`+N` 完整可见；盒高在 0 / 3 / 10 / 30 枚下都是一行控件高。

**破坏面：**

- 缺省下选中超过 3 项的多选，`api.tags` 少了、`overflowCount` 不再恒 0。断言过「全摆」的用例要改，或显式传 `maxTagCount: Infinity`。
- `SelectTranslations` 多一个必填键 `overflowTag`；自己整份实现该接口的要补上。
- `SelectApi` 多 `overflowText` / `getTagListProps` / `getOverflowTagProps` 三个成员；自己按 `SelectApi` 造对象的要补上。
- 解剖多一个部件：`tag-list`（`+N` 与标签是 `tag` 的 root，不算 select 的部件）。按部件数断言过的用例要改。
- 皮肤新增了 `trigger:has(tag-list:not([hidden])) value-text { display: none }` 这条让位规则：从前把标签直接摆在触发器里、又同时渲着 `value-text` 的写法不受影响（没有 `tag-list` 就不让位）；换成 `tag-list` 之后 `value-text` 会在有选中时收起。
