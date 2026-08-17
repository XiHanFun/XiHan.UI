---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

select 浮层多出一个底部操作区：「新建」「全选」这类按钮终于有地方放了。

原来放不进去有两条硬理由，都不是样式能绕的：`content` 既是 `role="listbox"`
（而 listbox 只许拥有 option 与 group，塞按钮进去是违规），又是那个 `overflow-y: auto` 的滚动容器
（放进去的按钮会跟着条目滚走）。所以这次把两件事拆开：

- **`content` 退成浮层外壳** —— 描边、底色、阴影、整体尺寸与键盘收口归它，它自己不滚。
- **新增 `list` 部件** —— `role="listbox"`、条目的拥有关系、滚动与那个「无锚点时兜底的 Tab 位」全在它身上。
- **新增 `footer` 部件** —— `list` 的兄弟。因此它既不进列表框的拥有关系，方向键与连打检索也走不到它，
  条目多到要滚时它仍贴在下沿不动。

**破坏性变更（alpha 期）**：条目现在要写在 `list` 里。

- Vue：`<XhSelectContent>` 与条目之间加一层 `<XhSelectList>`；底部操作区用新增的 `<XhSelectFooter>`。
  只传 `collection`、不写插槽的那条路由组件自己铺好，一个字都不用改。
- Web Components：`<div data-xh-part="content">` 里加一层 `<div data-xh-part="list">` 包住条目。
  `list` 已列进 `requiredParts`，忘了写会在诊断通道上报 `wc.missing-part`，不会静默丢掉列表框语义。
- `trigger` 的 `aria-controls` 随之改指 `list`（它才是那个列表框）。
