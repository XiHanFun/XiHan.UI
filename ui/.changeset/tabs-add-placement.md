---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

**新增** 标签页补齐多页签场景的几项能力：

- 新增钮：`addable` 让标签带之后露出 `add-trigger` 部件（Vue / React 的 `XhTabsAddTrigger`），点按或在钮上按 Enter / Space 发出 `tab-add`（`onTabAdd`，没有载荷）。库不建标签，新标签由数据源追加、写回 `collection`，要选中它就一并写回 `value`；焦点留在新增钮上，新标签被写回为选中值时接过整组的 Tab 停靠点。它与「更多」钮一样在 tablist 之外、自占一个 Tab 位，不写内容时画一枚加号，可及名取新增的 `translations.addTrigger`（缺省 `Add tab`）。
- 逐条的可关闭与图标：`collection` 的条目新增 `closable` 与 `icon`。条目上的 `closable` 压过整组的 `closable`（整组可关时能把某一条固定住，整组不可关时能单独放开某一条），不能关的标签收起关闭钮，Delete / Backspace 也不发 `tab-close`；`icon` 在标准结构里铺在标签文字之前，「更多」下拉里的那一项同样带上它。`api.collection` 的条目元信息随之多出 `closable`（条目没写为 `null`）与 `icon`。
- 标签带落位：`placement`（`start` | `end`，缺省 `start`）决定标签带落在面板之前还是之后，轴向仍由 `orientation` 定——横排上 / 下，竖排行首侧 / 行尾侧。只换版面，不改 DOM 序；`line` 档的基线与指示线、`card` 档的指示条随之换到朝向面板 / 背离面板的那一边。root 与 indicator 上新增状态属性 `data-placement`。
- 标签平分：`fullWidth` 让横排的 `line` / `card` 标签按标签带的宽度平分（`segmented` 本就平分），root 上投影 `data-full-width`。
